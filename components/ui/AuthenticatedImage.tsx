import React, { useEffect, useState } from 'react';
import { Image, ImageProps } from 'react-native';
import { getStoredTokens } from '../../services/tokenService';
import { getAuthenticatedImageUrl } from '../../utils/imageUtils';

interface AuthenticatedImageProps extends Omit<ImageProps, 'source'> {
    imageUrl: string;
    fallbackImageUrl?: string;
}

export default function AuthenticatedImage({
    imageUrl,
    fallbackImageUrl,
    ...props
}: AuthenticatedImageProps) {
    const [authenticatedImageUrl, setAuthenticatedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAuthenticatedImage = async () => {
            try {
                setIsLoading(true);

                // Get access token
                const { accessToken } = await getStoredTokens();

                if (!accessToken) {
                    console.error('No access token available for image loading');
                    setAuthenticatedImageUrl(fallbackImageUrl || imageUrl);
                    return;
                }

                // Fetch authenticated image
                const dataUrl = await getAuthenticatedImageUrl(imageUrl, accessToken);
                setAuthenticatedImageUrl(dataUrl);
            } catch (error) {
                console.error('Error loading authenticated image:', error);
                setAuthenticatedImageUrl(fallbackImageUrl || imageUrl);
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthenticatedImage();
    }, [imageUrl, fallbackImageUrl]);

    if (isLoading || !authenticatedImageUrl) {
        // Don't show anything while loading - just return null
        return null;
    }

    return (
        <Image
            {...props}
            source={{ uri: authenticatedImageUrl }}
        />
    );
}
