import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const DEVICE_ID_KEY = 'device_id';

// Generate a unique device ID
export const generateDeviceId = async (): Promise<string> => {
    try {
        // Try to get existing device ID
        const existingDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (existingDeviceId) {
            return existingDeviceId;
        }

        // Generate new device ID
        let deviceId: string;

        if (Platform.OS === 'ios') {
            // For iOS, generate a unique device ID
            deviceId = `ios_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        } else {
            // For Android, generate a unique device ID
            deviceId = `android_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // Store the device ID
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
        return deviceId;
    } catch (error) {
        console.error('Error generating device ID:', error);
        // Fallback to timestamp-based ID
        return `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

// Token management functions
export const storeTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
    try {
        console.log('Storing tokens:', {
            accessTokenLength: accessToken.length,
            refreshTokenLength: refreshToken.length,
            accessTokenStart: accessToken.substring(0, 20) + '...',
            refreshTokenStart: refreshToken.substring(0, 10) + '...'
        });

        await Promise.all([
            AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
            AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
        ]);

        console.log('Tokens stored successfully');
    } catch (error) {
        console.error('Error storing tokens:', error);
        throw error;
    }
};

export const getStoredTokens = async (): Promise<{ accessToken: string | null; refreshToken: string | null }> => {
    try {
        const [accessToken, refreshToken] = await Promise.all([
            AsyncStorage.getItem(ACCESS_TOKEN_KEY),
            AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        ]);

        console.log('Retrieved stored tokens:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            accessTokenLength: accessToken?.length || 0,
            refreshTokenLength: refreshToken?.length || 0,
            refreshTokenStart: refreshToken ? refreshToken.substring(0, 10) + '...' : 'null'
        });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Error getting stored tokens:', error);
        return { accessToken: null, refreshToken: null };
    }
};

export const clearTokens = async (): Promise<void> => {
    try {
        await Promise.all([
            AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
            AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        ]);
    } catch (error) {
        console.error('Error clearing tokens:', error);
        throw error;
    }
};

export const getAccessToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
};

export const getRefreshToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
    }
};
