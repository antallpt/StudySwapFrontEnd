// API Configuration
export const API_CONFIG = {
    // Production server URL
    BASE_URL: 'http://31.97.217.79:8080/api/v1',

    // For Android emulator, you might need to use:
    // BASE_URL: 'http://10.0.2.2:8080/api/v1',

    // For iOS simulator, localhost should work:
    // BASE_URL: 'http://localhost:8080/api/v1',

    // For physical device, use your computer's IP address:
    // BASE_URL: 'http://192.168.1.100:8080/api/v1', // Replace with your actual IP

    TIMEOUT: 10000, // 10 seconds
};

// Get the appropriate API URL based on platform and environment
export const getApiBaseUrl = () => {
    // Always use the production server for now
    return API_CONFIG.BASE_URL;
};

