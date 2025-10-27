import { findWorkingApiUrl } from './networkTest';

// Test API service to debug network issues
export const testApiConnection = async (): Promise<{ success: boolean; data?: any; error?: string; workingUrl?: string }> => {
    // First, try to find a working API URL
    const workingUrl = await findWorkingApiUrl();

    if (!workingUrl) {
        return {
            success: false,
            error: 'No working API URL found. Please check your network connection and server status.'
        };
    }

    const url = `${workingUrl}/auth/register`;

    const testData = {
        email: 'test@stud.hwr-berlin.de',
        password: 'test123456',
        firstName: 'Test',
        lastName: 'User',
        university: 'HWR Berlin'
    };

    console.log('Testing API connection...');
    console.log('URL:', url);
    console.log('Data:', testData);

    try {
        // Try with minimal configuration
        console.log('Attempting fetch with minimal config...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(testData),
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
            const data = await response.json();
            console.log('Success! Response:', data);
            return { success: true, data, workingUrl };
        } else {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            return { success: false, error: errorText };
        }
    } catch (error) {
        console.error('Fetch test failed:', error);

        // Try with XMLHttpRequest as fallback
        try {
            console.log('Trying XMLHttpRequest fallback...');
            return await new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept', 'application/json');

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        console.log('XHR Status:', xhr.status);
                        console.log('XHR Response:', xhr.responseText);

                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const data = JSON.parse(xhr.responseText);
                                resolve({ success: true, data, workingUrl });
                            } catch (e) {
                                resolve({ success: false, error: 'Invalid JSON response' });
                            }
                        } else {
                            resolve({ success: false, error: `HTTP ${xhr.status}: ${xhr.statusText}` });
                        }
                    }
                };

                xhr.onerror = function () {
                    console.error('XHR Error');
                    resolve({ success: false, error: 'XHR Network error' });
                };

                xhr.send(JSON.stringify(testData));
            });
        } catch (xhrError) {
            console.error('XHR test also failed:', xhrError);
            return { success: false, error: `Both fetch and XHR failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
    }
};
