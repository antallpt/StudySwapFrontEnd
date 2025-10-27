import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../components/LoadingScreen';
import AuthenticatedImage from '../../components/ui/AuthenticatedImage';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { getPlaceholderImageUrl } from '../../utils/imageUtils';

const { width: screenWidth } = Dimensions.get('window');

interface Product {
    productId: number; // Changed from id to productId to match ProductDTO
    title: string;
    description: string;
    price: number;
    category: string;
    createdAt: string;
    sellerId: number;
    images?: Array<{
        imageId: number;
        imageUrl: string;
        orderIndex: number;
        productId: number;
    }>;
    seller?: {
        userId: number;
        firstName: string;
        lastName: string;
        email: string;
        university: string;
    };
}

export default function ProductDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isAuthenticated, user, isLoading: authLoading, refreshUserData } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [seller, setSeller] = useState<{ firstName: string; lastName: string } | null>(null);

    // Check if this is the user's own product
    const isOwnProduct = product && user && user.userId && product.sellerId === parseInt(user.userId);

    useEffect(() => {
        console.log('ProductDetailPage useEffect:', { id, isAuthenticated, idType: typeof id });
        if (id && isAuthenticated) {
            fetchProduct();
        }
    }, [id, isAuthenticated]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            console.log('Fetching product with ID:', id, 'parsed as:', parseInt(id!));

            if (!id || isNaN(parseInt(id))) {
                throw new Error('Invalid product ID');
            }

            const productData = await apiService.getProduct(parseInt(id));
            console.log('Product data received:', productData);
            setProduct(productData);

            // Fetch seller information
            if (productData.sellerId) {
                try {
                    const sellerData = await apiService.getUserById(productData.sellerId);
                    console.log('Seller data received:', sellerData);
                    setSeller({
                        firstName: sellerData.firstName,
                        lastName: sellerData.lastName
                    });
                } catch (error) {
                    console.error('Error fetching seller data:', error);
                    setSeller(null);
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            Alert.alert('Error', `Failed to load product details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleMessageSeller = async () => {
        if (!product?.productId) {
            Alert.alert('Error', 'Product information not available');
            return;
        }

        try {
            // Create a new chat for this product
            const chat = await apiService.createChat(product.productId);
            console.log('Chat created:', chat);

            // Navigate to the chat with seller information
            router.push({
                pathname: `/chat/${chat.id}` as any,
                params: {
                    sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Seller',
                    sellerId: product.sellerId.toString()
                }
            });
        } catch (error: any) {
            console.error('Error creating chat:', error);

            let errorMessage = 'Failed to start conversation. Please try again.';
            if (error.status === 401 || error.message?.includes('Authentication failed')) {
                errorMessage = 'Your session has expired. Please log in again.';
            } else if (error.status === 400) {
                errorMessage = 'Cannot message yourself.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Error', errorMessage);
        }
    };

    const handleDeleteProduct = async () => {
        if (!product?.productId) {
            Alert.alert('Error', 'Product information not available');
            return;
        }

        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product? This action cannot be undone and will also delete any associated chats.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('Deleting product:', product.productId);
                            await apiService.deleteProduct(product.productId);
                            console.log('Product deleted successfully');

                            // Refresh user data to ensure it's up to date
                            try {
                                await refreshUserData();
                                console.log('User data refreshed after product deletion');
                            } catch (refreshError) {
                                console.error('Error refreshing user data after deletion:', refreshError);
                            }

                            Alert.alert('Success', 'Product deleted successfully', [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        // Navigate back to home page
                                        router.replace('/(tabs)/home' as any);
                                    }
                                }
                            ]);
                        } catch (error: any) {
                            console.error('Error deleting product:', error);

                            let errorMessage = 'Failed to delete product. Please try again.';
                            if (error.status === 401 || error.message?.includes('Authentication failed')) {
                                errorMessage = 'Your session has expired. Please log in again.';
                            } else if (error.status === 403) {
                                errorMessage = 'You are not authorized to delete this product.';
                            } else if (error.status === 404) {
                                errorMessage = 'Product not found.';
                            } else if (error.message) {
                                errorMessage = error.message;
                            }

                            Alert.alert('Error', errorMessage);
                        }
                    },
                },
            ]
        );
    };

    const handleBack = () => {
        router.back();
    };

    if (authLoading || loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        router.replace('/(public)');
        return null;
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Product not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const images = product.images || [];
    const hasImages = images.length > 0;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                {isOwnProduct && (
                    <TouchableOpacity style={styles.headerButton} onPress={handleDeleteProduct}>
                        <Ionicons name="trash-outline" size={24} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                <View style={styles.imageContainer}>
                    {hasImages ? (
                        <FlatList
                            data={images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                                setCurrentImageIndex(index);
                            }}
                            keyExtractor={(item) => item.imageId.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.imagePage}>
                                    <AuthenticatedImage
                                        imageUrl={item.imageUrl}
                                        fallbackImageUrl={getPlaceholderImageUrl()}
                                        style={styles.productImage}
                                    />
                                </View>
                            )}
                        />
                    ) : (
                        <View style={styles.imagePage}>
                            <Image
                                source={{ uri: getPlaceholderImageUrl() }}
                                style={styles.productImage}
                            />
                        </View>
                    )}

                    {/* Image Indicators */}
                    {hasImages && images.length > 1 && (
                        <View style={styles.imageIndicators}>
                            {images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.indicator,
                                        index === currentImageIndex && styles.activeIndicator
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.content}>
                    <View style={styles.priceSection}>
                        <Text style={styles.price}>€{product.price}</Text>
                        <Text style={styles.category}>{product.category}</Text>
                    </View>

                    <Text style={styles.title}>{product.title}</Text>

                    <Text style={styles.description}>{product.description}</Text>

                    {/* Seller Info */}
                    {product.seller && (
                        <View style={styles.sellerSection}>
                            <Text style={styles.sellerLabel}>Sold by</Text>
                            <View style={styles.sellerInfo}>
                                <View style={styles.sellerAvatar}>
                                    <Text style={styles.sellerInitials}>
                                        {product.seller.firstName[0]}{product.seller.lastName[0]}
                                    </Text>
                                </View>
                                <View style={styles.sellerDetails}>
                                    <Text style={styles.sellerName}>
                                        {product.seller.firstName} {product.seller.lastName}
                                    </Text>
                                    <Text style={styles.sellerUniversity}>
                                        {product.seller.university}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Message Button - Only show for other users' products */}
                    {!isOwnProduct && (
                        <TouchableOpacity style={styles.messageButton} onPress={handleMessageSeller}>
                            <Ionicons name="chatbubble-outline" size={20} color="white" />
                            <Text style={styles.messageButtonText}>Message Seller</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        height: 400,
        position: 'relative',
    },
    imagePage: {
        width: screenWidth,
        height: 400,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productImage: {
        width: screenWidth,
        height: 400,
        resizeMode: 'cover',
    },
    imageIndicators: {
        position: 'absolute',
        bottom: spacing.md,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeIndicator: {
        backgroundColor: 'white',
    },
    content: {
        padding: spacing.lg,
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    price: {
        ...typography.title,
        fontSize: 28,
        fontWeight: '700',
        color: colors.primary,
    },
    category: {
        ...typography.caption,
        fontSize: 14,
        color: colors.text.secondary,
        backgroundColor: colors.border,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    title: {
        ...typography.title,
        fontSize: 24,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    description: {
        ...typography.body,
        fontSize: 16,
        lineHeight: 24,
        color: colors.text.primary,
        marginBottom: spacing.xl,
    },
    sellerSection: {
        marginBottom: spacing.xl,
    },
    sellerLabel: {
        ...typography.caption,
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    sellerInitials: {
        ...typography.title,
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    sellerDetails: {
        flex: 1,
    },
    sellerName: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    sellerUniversity: {
        ...typography.caption,
        fontSize: 14,
        color: colors.text.secondary,
    },
    messageButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        marginBottom: spacing.xl,
    },
    messageButtonText: {
        ...typography.button,
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: spacing.sm,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    errorText: {
        ...typography.title,
        fontSize: 18,
        color: colors.text.primary,
        marginBottom: spacing.lg,
    },
    backButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
    },
    backButtonText: {
        ...typography.button,
        color: 'white',
        fontSize: 16,
    },
});
