import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import { clearTokens, generateDeviceId, getStoredTokens, storeTokens } from '../services/tokenService';

interface User {
    userId?: string;
    email: string;
    firstName: string;
    lastName: string;
    university: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (userData: User, tokens: AuthTokens) => Promise<void>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Check if user is already logged in when app starts
    const checkAuthStatus = useCallback(async () => {
        try {
            setIsLoading(true);
            const { accessToken, refreshToken } = await getStoredTokens();

            console.log('Checking auth status:', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken
            });

            if (accessToken && refreshToken) {
                // Don't immediately fetch user data to avoid token rotation
                // Just set a placeholder user and let the profile page fetch data when needed
                console.log('User has valid tokens, setting placeholder user');
                setUser({
                    userId: 'loading',
                    email: 'Loading...',
                    firstName: 'Loading...',
                    lastName: 'Loading...',
                    university: 'Loading...',
                });
            } else {
                // Clear invalid data
                await clearTokens();
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Login user and fetch data from API
    const login = useCallback(async (userData: User, tokens: AuthTokens) => {
        try {
            // Clear any existing user data first to prevent stale data
            setUser(null);

            // Store tokens first
            await storeTokens(tokens.accessToken, tokens.refreshToken);

            // Use the user data from registration/login response to avoid immediate API call
            // that might cause token rotation
            setUser(userData);
            console.log('User logged in successfully with provided data');

            // Fetch fresh user data to get complete profile information
            await refreshUserData();
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }, []);

    // Logout user and clear storage
    const logout = useCallback(async () => {
        try {
            setUser(null);
            await clearTokens();
        } catch (error) {
            console.error('Error clearing user data:', error);
            throw error;
        }
    }, []);

    // Refresh access token using refresh token
    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        try {
            const { refreshToken } = await getStoredTokens();
            if (!refreshToken) {
                return false;
            }

            // Generate device ID for refresh request
            const deviceId = await generateDeviceId();

            const response = await apiService.refreshToken({
                refreshToken,
                deviceId,
            });

            if (response.accessToken && response.refreshToken) {
                await storeTokens(response.accessToken, response.refreshToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing access token:', error);
            // If refresh fails, logout the user
            await logout();
            return false;
        }
    }, [logout]);

    // Refresh user data from API
    const refreshUserData = useCallback(async (): Promise<void> => {
        try {
            const userData = await apiService.getUserProfile();
            setUser({
                userId: userData.userId?.toString(),
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                university: userData.university,
            });
            console.log('User data refreshed successfully:', {
                userId: userData.userId,
                firstName: userData.firstName,
                lastName: userData.lastName
            });
        } catch (error: any) {
            console.error('Error refreshing user data:', error);

            // If it's an authentication error, logout
            if (error.status === 401 || error.message?.includes('Authentication failed') || error.message?.includes('Invalid or expired refresh token') || error.message?.includes('No access token available')) {
                console.log('Authentication failed, logging out user');
                try {
                    await logout();
                } catch (logoutError) {
                    console.error('Error during logout:', logoutError);
                }
            }
            // Don't throw the error, just log it to prevent crashes
        }
    }, [logout]);

    // Check auth status on app start
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const value: AuthContextType = useMemo(() => ({
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus,
        refreshAccessToken,
        refreshUserData,
    }), [user, isLoading, isAuthenticated, login, logout, checkAuthStatus, refreshAccessToken, refreshUserData]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
