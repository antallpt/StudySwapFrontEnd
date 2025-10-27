import { Platform } from 'react-native';

// Test different API endpoints to find one that works
export const findWorkingApiUrl = async (): Promise<string | null> => {
    const testUrls = [
        // Direct server IP (should work on physical devices)
        'http://31.97.217.79:8080/api/v1',

        // For iOS Simulator
        'http://localhost:8080/api/v1',
        'http://127.0.0.1:8080/api/v1',

        // For Android Emulator
        'http://10.0.2.2:8080/api/v1',

        // Your local machine's IP (if you're on the same network)
        // You'll need to replace this with your actual local IP
        // 'http://192.168.1.100:8080/api/v1',
    ];

    const testData = {
        email: 'test@stud.hwr-berlin.de',
        password: 'test123456',
        firstName: 'Test',
        lastName: 'User',
        university: 'HWR Berlin'
    };

    console.log(`Testing network connectivity on ${Platform.OS}...`);

    for (const url of testUrls) {
        try {
            console.log(`Testing URL: ${url}`);

            const response = await fetch(`${url}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(testData),
            });

            console.log(`Response from ${url}:`, response.status);

            if (response.ok) {
                console.log(`✅ Working URL found: ${url}`);
                return url;
            }
        } catch (error) {
            console.log(`❌ Failed to connect to ${url}:`, error.message);
        }
    }

    console.log('❌ No working API URL found');
    return null;
};

// Get your local machine's IP address
export const getLocalIpAddress = async (): Promise<string | null> => {
    try {
        // This is a simple way to get the local IP, but it might not work in all cases
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.log('Could not get local IP address:', error);
        return null;
    }
};
