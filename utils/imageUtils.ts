/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = 'http://31.97.217.79:8080';

/**
 * Fetches an authenticated image and converts it to a data URL
 * @param imageUrl - The image URL from the backend (can be full path or just filename)
 * @param accessToken - The access token for authentication
 * @returns Promise that resolves to a data URL or the original URL if it's already a full URL
 */
export const getAuthenticatedImageUrl = async (imageUrl: string, accessToken: string): Promise<string> => {
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }

    // Extract filename from the full path (e.g., /path/to/file.jpg -> file.jpg)
    const filename = imageUrl.split('/').pop();
    const fullUrl = `${API_BASE_URL}/media/${filename}`;

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'image/*',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch image:', response.status, response.statusText);
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error fetching authenticated image:', error);
        // Return the original URL as fallback
        return fullUrl;
    }
};

/**
 * Converts a backend image path to a full URL using the media endpoint
 * @param imageUrl - The image URL from the backend (can be full path or just filename)
 * @returns Full URL for the image
 */
export const getImageUrl = (imageUrl: string): string => {
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }

    // Extract filename from the full path (e.g., /path/to/file.jpg -> file.jpg)
    const filename = imageUrl.split('/').pop();
    const fullUrl = `${API_BASE_URL}/media/${filename}`;

    return fullUrl;
};

/**
 * Gets a placeholder image URL for products without images
 * @returns Placeholder image URL
 */
export const getPlaceholderImageUrl = (): string => {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop';
};
