import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../components/LoadingScreen';
import AuthenticatedImage from '../../components/ui/AuthenticatedImage';
import Avatar from '../../components/ui/Avatar';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { getPlaceholderImageUrl } from '../../utils/imageUtils';

interface Product {
    id?: number;
    productId?: number;
    title: string;
    description: string;
    price: number;
    category: string;
    images?: Array<{
        imageId: number;
        imageUrl: string;
        orderIndex: number;
        productId: number;
    }>;
}

export default function ProfilePage() {
    const { isAuthenticated, isLoading, user, logout, refreshAccessToken, refreshUserData } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [userProducts, setUserProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);


    // Fetch user products
    const fetchUserProducts = async () => {
        if (!isAuthenticated) return;

        try {
            setProductsLoading(true);
            const response = await apiService.getOwnProducts(0, 20);
            // Now we're using the dedicated endpoint for user's own products
            console.log('Own products response:', response);
            console.log('Products data:', response.content);

            // Debug product IDs
            if (response.content && response.content.length > 0) {
                response.content.forEach((product: any, index: number) => {
                    console.log(`Product ${index}:`, {
                        id: product.id,
                        productId: product.productId,
                        imageProductId: product.images?.[0]?.productId,
                        idType: typeof product.id,
                        productIdType: typeof product.productId,
                        imageProductIdType: typeof product.images?.[0]?.productId,
                        title: product.title,
                        hasImages: product.images && product.images.length > 0
                    });
                });
            }




            setUserProducts(response.content || []);
        } catch (error: any) {
            console.error('Error fetching user products:', error);

            // If it's an authentication error, try to refresh the token
            if (error.status === 401 || error.status === 403 || error.message?.includes('Authentication failed') || error.message?.includes('No access token available')) {
                console.log('Authentication error, attempting to refresh token...');
                try {
                    const refreshSuccess = await refreshAccessToken();
                    if (refreshSuccess) {
                        // Retry the request after token refresh
                        try {
                            const response = await apiService.getOwnProducts(0, 20);
                            setUserProducts(response.content || []);
                            return;
                        } catch (retryError) {
                            console.error('Error after token refresh:', retryError);
                        }
                    }
                } catch (refreshError) {
                    console.error('Error during token refresh:', refreshError);
                }
            }

            // Set empty array instead of crashing
            setUserProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            // Only fetch products when profile loads, don't refresh user data immediately
            // to avoid token rotation issues
            fetchUserProducts();
        }
    }, [isAuthenticated]);

    // Refresh user data when user changes (account switching)
    useEffect(() => {
        if (isAuthenticated && user?.userId && user.userId !== 'loading') {
            console.log('User data changed, refreshing profile...', {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName
            });
            // User data is already updated, just refresh products
            fetchUserProducts();
        }
    }, [user?.userId]); // Listen for userId changes

    // Auto-refresh when user tabs into profile page
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                console.log('Profile page focused, refreshing data...', {
                    userId: user?.userId,
                    firstName: user?.firstName,
                    isAuthenticated
                });
                handleRefresh();
            }
        }, [isAuthenticated, user?.userId])
    );

    // Refresh data when screen comes into focus
    const handleRefresh = async () => {
        if (isAuthenticated) {
            try {
                // Only refresh user data if it's still loading
                if (user?.userId === 'loading') {
                    await refreshUserData();
                }
                // Always try to fetch products
                await fetchUserProducts();
            } catch (error) {
                console.error('Error during refresh:', error);
                // Don't crash the app, just show an error message
                // The user can try again or the app will handle logout if needed
            }
        }
    };

    // Pull to refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await handleRefresh();
        } catch (error) {
            console.error('Error during pull to refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Redirect href="/(public)" />;
    }

    const handleSignOut = () => {
        logout();
    };

    const handleProductPress = (productId: number) => {
        console.log('Product pressed with ID:', productId, 'type:', typeof productId);
        router.push(`/product/${productId}` as any);
    };


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: insets.top,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            height: 60,
        },
        headerTitle: {
            ...typography.title,
            fontSize: 20,
            fontWeight: '600',
            color: colors.text.primary,
        },
        headerButtons: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerButton: {
            padding: spacing.sm,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        scrollContent: {
            paddingBottom: 80,
            flexGrow: 1,
        },
        profileHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xl,
        },
        profileInfo: {
            flex: 1,
            paddingRight: spacing.lg,
        },
        profileImage: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.border,
        },
        profileName: {
            ...typography.title,
            fontSize: 24,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: spacing.xs,
        },
        profileEmail: {
            ...typography.body,
            color: colors.text.secondary,
            fontSize: 16,
            marginBottom: spacing.sm,
        },
        profileBio: {
            ...typography.body,
            color: colors.text.secondary,
            fontSize: 14,
            lineHeight: 20,
        },
        divider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: spacing.md,
        },
        contentGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.md,
        },
        gridItem: {
            width: '50%',
            padding: spacing.sm,
            alignItems: 'center',
        },
        imageContainer: {
            width: '100%',
            height: 150,
            marginBottom: spacing.sm,
            backgroundColor: colors.border,
            borderRadius: 8,
            overflow: 'hidden',
        },
        gridImage: {
            width: '100%',
            height: '100%',
        },
        gridTitle: {
            ...typography.body,
            fontSize: 14,
            fontWeight: '500',
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing.xs,
        },
        gridPrice: {
            ...typography.body,
            fontSize: 14,
            fontWeight: '600',
            color: colors.primary,
            textAlign: 'center',
        },
        loadingContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.xxl,
        },
        loadingText: {
            ...typography.body,
            color: colors.text.secondary,
            marginTop: spacing.sm,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.xxl,
        },
        emptyText: {
            ...typography.title,
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary,
            marginTop: spacing.md,
        },
        emptySubtext: {
            ...typography.body,
            color: colors.text.secondary,
            marginTop: spacing.xs,
            textAlign: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleRefresh}>
                        <Ionicons name="refresh" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton} onPress={handleSignOut}>
                        <Ionicons name="log-out-outline" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                            {user && user.userId !== 'loading' ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                        </Text>
                        <Text style={styles.profileEmail}>
                            {user && user.userId !== 'loading' ? user.email : 'Loading...'}
                        </Text>
                        <Text style={styles.profileBio}>
                            {user && user.userId !== 'loading' && user.university ? `${user.university} student` : 'Loading...'} • StudySwap member
                        </Text>
                    </View>
                    <Avatar
                        firstName={user && user.userId !== 'loading' ? user.firstName : 'U'}
                        lastName={user && user.userId !== 'loading' ? user.lastName : ''}
                        size={80}
                    />
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Content Grid */}
                <View style={styles.contentGrid}>
                    {productsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Loading your listings...</Text>
                        </View>
                    ) : userProducts.length > 0 ? (
                        userProducts.map((product, index) => (
                            <TouchableOpacity
                                key={`product-${product.productId || product.id || (product.images?.[0]?.productId) || index}-${index}`}
                                style={styles.gridItem}
                                onPress={() => {
                                    // Now productId should be available directly from the DTO
                                    const productId = product.productId || product.id || (product.images && product.images.length > 0 ? product.images[0].productId : null);
                                    console.log('Product tapped:', {
                                        id: product.id,
                                        productId: product.productId,
                                        imageProductId: product.images?.[0]?.productId,
                                        finalId: productId,
                                        idType: typeof productId,
                                        title: product.title
                                    });
                                    if (productId) {
                                        handleProductPress(productId);
                                    } else {
                                        console.error('Product has no ID:', product);
                                        Alert.alert('Error', 'Product ID not available');
                                    }
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={styles.imageContainer}>
                                    <AuthenticatedImage
                                        imageUrl={product.images && product.images.length > 0
                                            ? product.images[0].imageUrl
                                            : ''}
                                        fallbackImageUrl={getPlaceholderImageUrl()}
                                        style={styles.gridImage}
                                    />
                                </View>
                                <Text style={styles.gridTitle} numberOfLines={2}>
                                    {product.title}
                                </Text>
                                <Text style={styles.gridPrice}>€{product.price}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={48} color={colors.text.secondary} />
                            <Text style={styles.emptyText}>No listings yet</Text>
                            <Text style={styles.emptySubtext}>Start selling your items to see them here</Text>
                        </View>
                    )}
                </View>


            </ScrollView>
        </View>
    );
}
