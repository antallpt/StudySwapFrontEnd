import { getApiBaseUrl } from '../config/api';
import { getStoredTokens, storeTokens } from './tokenService';

// API configuration
const API_BASE_URL = getApiBaseUrl();

// Types for API requests and responses
export interface LoginRequest {
    email: string;
    password: string;
    deviceId: string;
}

export interface LoginResponse {
    isLoginSuccesfull: string;
    accessToken?: string;
    refreshToken?: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    university: string;
    deviceId: string;
}

export interface RegisterResponse {
    isLoggedIn: string;
    accessToken?: string;
    refreshToken?: string;
    errorMessage?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
    deviceId: string;
}

export interface RefreshTokenResponse {
    accessToken?: string;
    refreshToken?: string;
    message?: string;
}

export interface ChatDTO {
    id: number;
    sellerId: number;
    buyerId: number;
    createdAt: string;
    lastMessageAt?: string;
    lastMessage?: MessageDTO;
}

export interface MessageDTO {
    id: number;
    senderId: number;
    body: string;
    createdAt: string;
    chatId: number;
}

export interface ChatCreationRequest {
    productId: number;
    receiverId?: number;
}

export interface SendMessageRequest {
    content: string;
}

export interface SearchProductRequest {
    query: string;
    category?: string;
}

export class ApiError extends Error {
    public status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// API service class
class ApiService {
    private baseURL: string;
    private refreshPromise: Promise<any> | null = null;
    private isRefreshing: boolean = false;
    private pendingRequests: Array<{
        resolve: (value: any) => void;
        reject: (error: any) => void;
        endpoint: string;
        options: RequestInit;
    }> = [];

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    // Helper method to perform token refresh with proper error handling
    private async performTokenRefresh(refreshToken: string): Promise<any> {
        // Get the same device ID that was used during registration/login
        const { generateDeviceId } = await import('./tokenService');
        const deviceId = await generateDeviceId();

        console.log('Attempting token refresh with:', {
            deviceId,
            refreshTokenLength: refreshToken.length,
            refreshTokenStart: refreshToken.substring(0, 10) + '...',
            timestamp: new Date().toISOString(),
            isRefreshing: this.isRefreshing
        });

        try {
            const result = await this.refreshToken({
                refreshToken,
                deviceId,
            });

            console.log('Token refresh successful:', {
                hasAccessToken: !!result.accessToken,
                hasRefreshToken: !!result.refreshToken,
                accessTokenLength: result.accessToken?.length || 0,
                refreshTokenLength: result.refreshToken?.length || 0,
                newRefreshTokenStart: result.refreshToken?.substring(0, 10) + '...' || 'null'
            });

            return result;
        } catch (error) {
            console.error('Token refresh failed in performTokenRefresh:', error);
            throw error;
        }
    }

    // Helper method to check if token is expired
    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            // Add 5 minute buffer to avoid unnecessary refreshes
            const bufferTime = 5 * 60; // 5 minutes in seconds
            return now >= (payload.exp - bufferTime);
        } catch (e) {
            return true; // If we can't parse it, consider it expired
        }
    }

    // Helper method to handle token refresh and retry
    private async makeAuthenticatedRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        // Check if we're already refreshing tokens to prevent race conditions
        if (this.isRefreshing) {
            console.log('Token refresh in progress, waiting for completion...', {
                endpoint,
                isRefreshing: this.isRefreshing,
                hasRefreshPromise: !!this.refreshPromise
            });

            try {
                await this.refreshPromise;
                console.log('Token refresh completed, getting fresh tokens...');

                // Get fresh tokens after refresh completes
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await getStoredTokens();
                if (!newAccessToken || !newRefreshToken) {
                    console.log('No tokens available after refresh, throwing error');
                    throw new ApiError('No access token available after refresh. Please log in again.', 401);
                }

                console.log('Using fresh tokens for request:', {
                    accessTokenLength: newAccessToken.length,
                    refreshTokenLength: newRefreshToken.length,
                    refreshTokenStart: newRefreshToken.substring(0, 10) + '...'
                });

                return this.makeAuthenticatedRequestWithTokens<T>(endpoint, options, newAccessToken, newRefreshToken);
            } catch (error) {
                console.error('Error waiting for token refresh:', error);
                throw error;
            }
        }

        let { accessToken, refreshToken } = await getStoredTokens();

        console.log('Using tokens for request to:', endpoint, {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            accessTokenLength: accessToken?.length || 0,
            refreshTokenLength: refreshToken?.length || 0,
            refreshTokenStart: refreshToken ? refreshToken.substring(0, 10) + '...' : 'null'
        });

        if (!accessToken || !refreshToken) {
            throw new ApiError('No access token available. Please log in again.', 401);
        }

        return this.makeAuthenticatedRequestWithTokens<T>(endpoint, options, accessToken, refreshToken);
    }

    // Helper method to make request with specific tokens
    private async makeAuthenticatedRequestWithTokens<T>(
        endpoint: string,
        options: RequestInit,
        accessToken: string,
        refreshToken: string
    ): Promise<T> {

        const url = `${this.baseURL}${endpoint}`;

        // Don't set Content-Type for FormData, let fetch handle it
        const isFormData = options.body instanceof FormData;
        const defaultHeaders: Record<string, string> = {
            'Accept': 'application/json',
            'User-Agent': 'StudySwap-Mobile/1.0.0',
            'Authorization': `Bearer ${accessToken}`,
        };

        if (!isFormData) {
            defaultHeaders['Content-Type'] = 'application/json';
        }

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            console.log('Making authenticated API request to:', url);
            console.log('Request headers:', {
                'Authorization': `Bearer ${accessToken?.substring(0, 20)}...`,
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
            });
            console.log('Request method:', options.method || 'GET');
            console.log('Is FormData:', isFormData);
            const response = await fetch(url, config);

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            // If we get a 401 or 403, try to refresh the token and retry
            if (response.status === 401 || response.status === 403) {
                console.log('Authentication error, attempting to refresh token...');
                console.log('Access token being used:', accessToken?.substring(0, 50) + '...');
                console.log('Endpoint that failed:', endpoint);

                // Don't retry FormData requests as they can only be consumed once
                if (isFormData) {
                    console.log('FormData request cannot be retried, refreshing token for next request');
                    try {
                        if (!this.isRefreshing) {
                            this.isRefreshing = true;
                            this.refreshPromise = this.performTokenRefresh(refreshToken!);
                        }

                        const refreshResponse = await this.refreshPromise;
                        await storeTokens(refreshResponse.accessToken, refreshResponse.refreshToken);

                        console.log('Token refreshed for FormData request, but cannot retry');
                    } catch (refreshError: any) {
                        console.error('Token refresh failed for FormData request:', refreshError);
                    } finally {
                        this.refreshPromise = null;
                        this.isRefreshing = false;
                    }

                    // For FormData requests, provide a more helpful error message
                    throw new ApiError(
                        'Your session has expired. The token has been refreshed. Please try uploading again.',
                        response.status
                    );
                }

                // Try to decode the JWT to see if it's expired
                try {
                    const payload = JSON.parse(atob(accessToken?.split('.')[1] || ''));
                    const now = Math.floor(Date.now() / 1000);
                    const exp = payload.exp;
                    console.log('JWT token info:', {
                        issuedAt: new Date(payload.iat * 1000).toISOString(),
                        expiresAt: new Date(exp * 1000).toISOString(),
                        isExpired: now >= exp,
                        timeUntilExpiry: exp - now,
                        subject: payload.sub
                    });
                } catch (e) {
                    console.log('Could not decode JWT token:', e);
                }

                // Use mutex to prevent multiple simultaneous refresh attempts
                if (!this.isRefreshing) {
                    console.log('Starting token refresh...', {
                        endpoint,
                        refreshTokenStart: refreshToken.substring(0, 10) + '...',
                        refreshTokenLength: refreshToken.length
                    });
                    this.isRefreshing = true;
                    this.refreshPromise = this.performTokenRefresh(refreshToken);
                } else {
                    console.log('Token refresh already in progress, waiting...', {
                        endpoint,
                        isRefreshing: this.isRefreshing,
                        hasRefreshPromise: !!this.refreshPromise
                    });
                }

                try {
                    const refreshResponse = await this.refreshPromise;

                    // Immediately update tokens in storage to prevent race conditions
                    await storeTokens(refreshResponse.accessToken, refreshResponse.refreshToken);

                    // Longer delay to ensure tokens are fully processed on backend
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    console.log('Refresh response:', {
                        hasAccessToken: !!refreshResponse.accessToken,
                        hasRefreshToken: !!refreshResponse.refreshToken,
                        message: refreshResponse.message
                    });

                    if (refreshResponse.accessToken && refreshResponse.refreshToken) {
                        console.log('Tokens updated in storage after refresh');

                        // Retry the request with the new token
                        console.log('Token refreshed, retrying request...');
                        console.log('Retry with new token:', {
                            accessTokenLength: refreshResponse.accessToken.length,
                            accessTokenStart: refreshResponse.accessToken.substring(0, 50) + '...',
                            endpoint: url
                        });
                        const retryHeaders: Record<string, string> = {
                            'Accept': 'application/json',
                            'User-Agent': 'StudySwap-Mobile/1.0.0',
                            'Authorization': `Bearer ${refreshResponse.accessToken}`,
                        };

                        if (!isFormData) {
                            retryHeaders['Content-Type'] = 'application/json';
                        }

                        const retryConfig: RequestInit = {
                            ...options,
                            headers: {
                                ...retryHeaders,
                                ...options.headers,
                            },
                        };

                        // Decode and log the JWT token being used for retry
                        try {
                            const payload = JSON.parse(atob(refreshResponse.accessToken.split('.')[1]));
                            console.log('Retry JWT payload:', {
                                subject: payload.sub,
                                issuedAt: new Date(payload.iat * 1000).toISOString(),
                                expiresAt: new Date(payload.exp * 1000).toISOString(),
                                isExpired: Math.floor(Date.now() / 1000) >= payload.exp
                            });
                        } catch (e) {
                            console.log('Could not decode retry JWT token:', e);
                        }

                        const retryResponse = await fetch(url, retryConfig);
                        console.log('Retry response status:', retryResponse.status);
                        console.log('Retry response headers:', Object.fromEntries(retryResponse.headers.entries()));

                        if (!retryResponse.ok) {
                            const errorData = await retryResponse.json().catch(() => ({}));
                            console.log('Retry error response data:', errorData);

                            // If retry also fails with 401/403, the token refresh might have failed
                            if (retryResponse.status === 401 || retryResponse.status === 403) {
                                console.log('Retry also failed with auth error, clearing tokens');
                                const { clearTokens } = await import('./tokenService');
                                await clearTokens();
                            }

                            throw new ApiError(
                                errorData.message || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`,
                                retryResponse.status
                            );
                        }

                        const retryResponseData = await retryResponse.json();
                        console.log('Retry response data:', retryResponseData);
                        return retryResponseData;
                    } else {
                        throw new ApiError('Failed to refresh token. Please log in again.', 401);
                    }
                } catch (refreshError: any) {
                    console.error('Token refresh failed:', refreshError);

                    // If refresh token is invalid, clear tokens and logout
                    if (refreshError.status === 401 || refreshError.message?.includes('Invalid or expired refresh token')) {
                        console.log('Refresh token is invalid, clearing tokens');
                        const { clearTokens } = await import('./tokenService');
                        await clearTokens();
                        throw new ApiError('Your session has expired. Please log in again.', 401);
                    }

                    // For other refresh errors, don't clear tokens immediately
                    console.log('Token refresh failed, but keeping tokens for retry');
                    throw new ApiError('Authentication failed. Please try again.', 401);
                } finally {
                    // Clear the refresh promise and flag so future requests can try again
                    this.refreshPromise = null;
                    this.isRefreshing = false;
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log('Error response data:', errorData);
                throw new ApiError(
                    errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status
                );
            }

            const responseData = await response.json();
            console.log('Response data:', responseData);
            return responseData;
        } catch (error) {
            console.error('API request failed:', error);
            console.error('Error type:', typeof error);
            console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

            if (error instanceof ApiError) {
                throw error;
            }

            // More specific error handling
            if (error instanceof TypeError) {
                if (error.message === 'Network request failed') {
                    throw new ApiError(
                        'Network request failed. Please check your internet connection and try again.',
                        0
                    );
                } else if (error.message.includes('fetch')) {
                    throw new ApiError(
                        `Network error: ${error.message}. Please check your internet connection.`,
                        0
                    );
                }
            }

            throw new ApiError(
                `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                0
            );
        }
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'StudySwap-Mobile/1.0.0',
        };

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            console.log('Making API request to:', url);
            console.log('Request body:', options.body);

            const response = await fetch(url, config);

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log('Error response data:', errorData);
                throw new ApiError(
                    errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status
                );
            }

            const responseData = await response.json();
            console.log('Response data:', responseData);
            return responseData;
        } catch (error) {
            console.error('API request failed:', error);
            console.error('Error type:', typeof error);
            console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

            if (error instanceof ApiError) {
                throw error;
            }

            // More specific error handling
            if (error instanceof TypeError) {
                if (error.message === 'Network request failed') {
                    throw new ApiError(
                        'Network request failed. Please check your internet connection and try again.',
                        0
                    );
                } else if (error.message.includes('fetch')) {
                    throw new ApiError(
                        `Network error: ${error.message}. Please check your internet connection.`,
                        0
                    );
                }
            }

            throw new ApiError(
                `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                0
            );
        }
    }

    // Authentication methods
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        return this.makeRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        return this.makeRequest<RegisterResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        return this.makeRequest<RefreshTokenResponse>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // Product methods
    async getProducts(page: number = 0, size: number = 20): Promise<any> {
        return this.makeAuthenticatedRequest<any>(`/products?page=${page}&size=${size}`, {
            method: 'GET',
        });
    }

    async getOwnProducts(page: number = 0, size: number = 20): Promise<any> {
        return this.makeAuthenticatedRequest<any>(`/products/ownproducts?page=${page}&size=${size}`, {
            method: 'GET',
        });
    }

    async searchProducts(searchRequest: SearchProductRequest, page: number = 0, size: number = 20): Promise<any> {
        return this.makeAuthenticatedRequest<any>(`/products/search?page=${page}&size=${size}`, {
            method: 'POST',
            body: JSON.stringify(searchRequest),
        });
    }

    async getProduct(id: number): Promise<any> {
        console.log('API: Getting product with ID:', id, 'type:', typeof id);
        return this.makeAuthenticatedRequest<any>(`/products/${id}`, {
            method: 'GET',
        });
    }

    async deleteProduct(id: number): Promise<void> {
        console.log('API: Deleting product with ID:', id, 'type:', typeof id);

        // Use makeAuthenticatedRequest but handle empty response
        const url = `${this.baseURL}/products/${id}`;
        let { accessToken, refreshToken } = await getStoredTokens();

        if (!accessToken || !refreshToken) {
            throw new ApiError('No access token available. Please log in again.', 401);
        }

        // Check if access token is expired or close to expiring
        if (this.isTokenExpired(accessToken)) {
            console.log('Access token is expired, refreshing before delete...');
            try {
                if (!this.isRefreshing) {
                    this.isRefreshing = true;
                    this.refreshPromise = this.performTokenRefresh(refreshToken!);
                }

                const refreshResponse = await this.refreshPromise;
                await storeTokens(refreshResponse.accessToken, refreshResponse.refreshToken);
                accessToken = refreshResponse.accessToken;
                refreshToken = refreshResponse.refreshToken;

                console.log('Token refreshed before delete, proceeding');
            } catch (refreshError: any) {
                console.error('Token refresh failed before delete:', refreshError);

                // If refresh token is invalid, clear tokens
                if (refreshError.status === 401 || refreshError.message?.includes('Invalid or expired refresh token')) {
                    console.log('Refresh token is invalid during delete, clearing tokens');
                    const { clearTokens } = await import('./tokenService');
                    await clearTokens();
                    throw new ApiError('Your session has expired. Please log in again.', 401);
                }

                throw new ApiError('Authentication failed. Please try again.', 401);
            } finally {
                this.refreshPromise = null;
                this.isRefreshing = false;
            }
        }

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'StudySwap-Mobile/1.0.0',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('Delete product response status:', response.status);

        // Handle 401/403 responses with token refresh
        if (response.status === 401 || response.status === 403) {
            console.log('Authentication error during delete, attempting token refresh...');
            try {
                if (!this.isRefreshing) {
                    this.isRefreshing = true;
                    this.refreshPromise = this.performTokenRefresh(refreshToken!);
                }

                const refreshResponse = await this.refreshPromise;
                await storeTokens(refreshResponse.accessToken, refreshResponse.refreshToken);

                // Retry the delete request
                const retryResponse = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'StudySwap-Mobile/1.0.0',
                        'Authorization': `Bearer ${refreshResponse.accessToken}`,
                    },
                });

                if (!retryResponse.ok) {
                    const errorData = await retryResponse.json().catch(() => ({}));
                    throw new ApiError(
                        errorData.message || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`,
                        retryResponse.status
                    );
                }

                console.log('Product deleted successfully after token refresh');
                return;
            } catch (refreshError: any) {
                console.error('Token refresh failed during delete:', refreshError);

                // If refresh token is invalid, clear tokens
                if (refreshError.status === 401 || refreshError.message?.includes('Invalid or expired refresh token')) {
                    console.log('Refresh token is invalid during delete retry, clearing tokens');
                    const { clearTokens } = await import('./tokenService');
                    await clearTokens();
                    throw new ApiError('Your session has expired. Please log in again.', 401);
                }

                throw new ApiError('Authentication failed. Please try again.', 401);
            } finally {
                this.refreshPromise = null;
                this.isRefreshing = false;
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        // DELETE endpoint returns empty body, so we don't try to parse JSON
        console.log('Product deleted successfully');
    }

    // User profile methods
    async getUserProfile(): Promise<any> {
        return this.makeAuthenticatedRequest<any>('/user', {
            method: 'GET',
        });
    }

    async getUserById(userId: number): Promise<any> {
        return this.makeAuthenticatedRequest<any>(`/user/${userId}`, {
            method: 'GET',
        });
    }

    // Chat methods
    async getChats(page: number = 0, size: number = 20): Promise<ChatDTO[]> {
        return this.makeAuthenticatedRequest<ChatDTO[]>(`/chats?page=${page}&size=${size}`, {
            method: 'GET',
        });
    }

    async getChat(chatId: number): Promise<ChatDTO> {
        return this.makeAuthenticatedRequest<ChatDTO>(`/chats/${chatId}`, {
            method: 'GET',
        });
    }

    async createChat(productId: number): Promise<ChatDTO> {
        return this.makeAuthenticatedRequest<ChatDTO>('/chats', {
            method: 'POST',
            body: JSON.stringify({
                productId: productId,
                receiverId: null // Will be determined by backend based on product seller
            }),
        });
    }

    async getMessages(chatId: number, page: number = 0, size: number = 50): Promise<MessageDTO[]> {
        const response = await this.makeAuthenticatedRequest<any>(`/chats/${chatId}/messages?page=${page}&size=${size}`, {
            method: 'GET',
        });
        return response.content || [];
    }

    async sendMessage(chatId: number, content: string): Promise<MessageDTO> {
        return this.makeAuthenticatedRequest<MessageDTO>(`/chats/${chatId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                content: content
            }),
        });
    }

    // Product creation methods
    async createProduct(productData: {
        title: string;
        description: string;
        price: number;
        category: string;
        images: any[]; // Array of image files
    }): Promise<any> {
        // Create FormData for multipart form submission
        const formData = new FormData();
        formData.append('title', productData.title);
        formData.append('description', productData.description);
        formData.append('price', productData.price.toString());
        formData.append('category', productData.category);

        // Add images to form data
        productData.images.forEach((image, index) => {
            formData.append('images', {
                uri: image.uri,
                type: image.type || 'image/jpeg',
                name: image.fileName || `image_${index}.jpg`,
            } as any);
        });

        console.log('Creating product with data:', {
            title: productData.title,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            imageCount: productData.images.length
        });

        // Use the authenticated request method with FormData
        return this.makeAuthenticatedRequest<any>('/products', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type, let fetch set it for FormData
        });
    }
}

// Create and export API service instance
export const apiService = new ApiService();

// Export the class for testing
export { ApiService };
