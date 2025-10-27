import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../components/LoadingScreen';
import AuthenticatedImage from '../../components/ui/AuthenticatedImage';
import Avatar from '../../components/ui/Avatar';
import SectionHeader from '../../components/ui/SectionHeader';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { getPlaceholderImageUrl } from '../../utils/imageUtils';

const categories = [
    { value: 'ELECTRONICS', label: 'Electronics' },
    { value: 'BOOKS', label: 'Books' },
    { value: 'CLOTHING', label: 'Clothing' },
    { value: 'STATIONERY', label: 'Stationery' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'FURNITURE', label: 'Furniture' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'FOOD', label: 'Food' },
    { value: 'OTHER', label: 'Other' }
];

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
    seller?: {
        userId: number;
        firstName: string;
        lastName: string;
        email: string;
        university: string;
    };
}

export default function HomePage() {
    const { user, logout, isAuthenticated, isLoading, refreshAccessToken } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isSearching, setIsSearching] = useState(false);

    // Fetch products from API
    const fetchProducts = async () => {
        if (!isAuthenticated) return;

        try {
            setProductsLoading(true);
            const response = await apiService.getProducts(0, 20);
            console.log('Products response:', response);
            console.log('Products content:', response.content);

            // Debug product IDs
            if (response.content && response.content.length > 0) {
                response.content.forEach((product: any, index: number) => {
                    console.log(`Home Product ${index}:`, {
                        id: product.id,
                        productId: product.productId,
                        imageProductId: product.images?.[0]?.productId,
                        title: product.title,
                        hasImages: product.images && product.images.length > 0,
                        fullProduct: product
                    });
                });
            }

            setProducts(response.content || []);
        } catch (error: any) {
            console.error('Error fetching products:', error);

            // If it's an authentication error, try to refresh the token
            if (error.status === 401 || error.status === 403 || error.message?.includes('Authentication failed') || error.message?.includes('No access token available')) {
                console.log('Authentication error, attempting to refresh token...');
                try {
                    const refreshSuccess = await refreshAccessToken();
                    if (refreshSuccess) {
                        // Retry the request after token refresh
                        try {
                            const response = await apiService.getProducts(0, 20);
                            setProducts(response.content || []);
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
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    // Search products function
    const searchProducts = async () => {
        if (!isAuthenticated) return;

        try {
            setIsSearching(true);
            const searchRequest = {
                query: searchQuery.trim(),
                category: selectedCategory || undefined
            };

            console.log('Searching with:', searchRequest);
            const response = await apiService.searchProducts(searchRequest, 0, 20);
            console.log('Search response:', response);

            setProducts(response.content || []);
            setSearchModalVisible(false);
        } catch (error: any) {
            console.error('Error searching products:', error);

            // If it's an authentication error, try to refresh the token
            if (error.status === 401 || error.status === 403 || error.message?.includes('Authentication failed') || error.message?.includes('No access token available')) {
                console.log('Authentication error during search, attempting to refresh token...');
                try {
                    const refreshSuccess = await refreshAccessToken();
                    if (refreshSuccess) {
                        // Retry the search after token refresh
                        try {
                            const searchRequest = {
                                query: searchQuery.trim(),
                                category: selectedCategory || undefined
                            };
                            const response = await apiService.searchProducts(searchRequest, 0, 20);
                            setProducts(response.content || []);
                            setSearchModalVisible(false);
                            return;
                        } catch (retryError) {
                            console.error('Error after token refresh during search:', retryError);
                        }
                    }
                } catch (refreshError) {
                    console.error('Error during token refresh in search:', refreshError);
                }
            }

            Alert.alert('Search Error', 'Failed to search products. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    // Clear search and show all products
    const clearSearch = () => {
        setSearchQuery('');
        setSelectedCategory('');
        fetchProducts();
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts();
        }
    }, [isAuthenticated]);

    // Refresh when user changes (account switching)
    useEffect(() => {
        if (isAuthenticated && user?.userId && user.userId !== 'loading') {
            console.log('User changed in home, refreshing products...', {
                userId: user.userId,
                firstName: user.firstName
            });
            fetchProducts();
        }
    }, [user?.userId]); // Listen for userId changes

    // Auto-refresh when user tabs into home page
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                console.log('Home page focused, refreshing products...', {
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
                await fetchProducts();
            } catch (error) {
                console.error('Error during refresh:', error);
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

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout');
                        }
                    }
                }
            ]
        );
    };

    const handleProductPress = (product: Product) => {
        // Now productId should be available directly from the DTO
        const productId = product.productId || product.id || (product.images?.[0]?.productId);
        console.log('Product pressed:', {
            id: product.id,
            productId: product.productId,
            imageProductId: product.images?.[0]?.productId,
            finalId: productId,
            title: product.title
        });
        if (productId) {
            router.push(`/product/${productId}` as any);
        } else {
            Alert.alert('Error', 'Product ID not available');
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: insets.top,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.lg,
            backgroundColor: colors.background,
        },
        profileSection: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        avatarContainer: {
            marginRight: spacing.md,
        },
        greetingSection: {
            flex: 1,
        },
        greeting: {
            ...typography.title,
            fontSize: 24,
            fontWeight: '700',
            color: colors.text.primary,
        },
        welcomeText: {
            ...typography.caption,
            color: colors.text.secondary,
            marginTop: 4,
            fontSize: 16,
        },
        searchButton: {
            backgroundColor: colors.border,
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: spacing.md,
        },
        content: {
            flex: 1,
            paddingHorizontal: spacing.lg,
        },
        scrollContent: {
            paddingBottom: 100 + Math.max(insets.bottom, 8), // Add padding for bottom tab bar with safe area
        },
        productsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: spacing.lg,
        },
        productCard: {
            width: '48%',
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            marginBottom: spacing.md,
            overflow: 'hidden',
            shadowColor: colors.text.primary,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        imageContainer: {
            width: '100%',
            height: 150,
            backgroundColor: colors.border,
        },
        productImage: {
            width: '100%',
            height: '100%',
        },
        productInfo: {
            padding: spacing.md,
        },
        productTitle: {
            ...typography.title,
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: spacing.xs,
        },
        productPrice: {
            ...typography.title,
            fontSize: 18,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing.xs,
        },
        productCategory: {
            ...typography.caption,
            color: colors.text.secondary,
            fontSize: 12,
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
        // Modal styles
        modalContainer: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: insets.top,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            ...typography.title,
            fontSize: 20,
            fontWeight: '600',
            color: colors.text.primary,
        },
        closeButton: {
            padding: spacing.sm,
        },
        modalContent: {
            flex: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
        },
        searchInputContainer: {
            marginBottom: spacing.lg,
        },
        inputLabel: {
            ...typography.caption,
            color: colors.text.secondary,
            marginBottom: spacing.sm,
            fontWeight: '500',
        },
        searchInput: {
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            ...typography.body,
            color: colors.text.primary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        categoryContainer: {
            marginBottom: spacing.xl,
        },
        categoryScrollView: {
            marginTop: spacing.sm,
        },
        categoryChip: {
            backgroundColor: colors.cardBackground,
            borderRadius: 20,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            marginRight: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
        },
        categoryChipSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        categoryChipText: {
            ...typography.caption,
            color: colors.text.secondary,
            fontWeight: '500',
        },
        categoryChipTextSelected: {
            color: colors.background,
            fontWeight: '600',
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
        },
        clearButton: {
            flex: 1,
            backgroundColor: colors.border,
            borderRadius: 12,
            paddingVertical: spacing.md,
            alignItems: 'center',
            marginRight: spacing.sm,
        },
        clearButtonText: {
            ...typography.button,
            color: colors.text.secondary,
            fontWeight: '600',
        },
        searchActionButton: {
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: spacing.md,
            alignItems: 'center',
            marginLeft: spacing.sm,
        },
        searchActionButtonDisabled: {
            backgroundColor: colors.text.tertiary,
        },
        searchActionButtonText: {
            ...typography.button,
            color: colors.background,
            fontWeight: '600',
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            firstName={user?.firstName || 'U'}
                            lastName={user?.lastName || ''}
                            size={50}
                        />
                    </View>
                    <View style={styles.greetingSection}>
                        <Text style={styles.greeting}>Hi {user?.firstName || 'User'}!</Text>
                        <Text style={styles.welcomeText}>Welcome back</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.searchButton} onPress={() => setSearchModalVisible(true)}>
                    <Ionicons name="search" size={18} color={colors.text.secondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
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
                {/* Available Products Section */}
                <SectionHeader title="Available Products" onSeeAll={() => { }} />

                {productsLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading products...</Text>
                    </View>
                ) : products.length > 0 ? (
                    <View style={styles.productsGrid}>
                        {products.map((product, index) => (
                            <TouchableOpacity
                                key={`product-${product.productId || product.id || product.images?.[0]?.productId || index}-${index}`}
                                style={styles.productCard}
                                onPress={() => handleProductPress(product)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.imageContainer}>
                                    <AuthenticatedImage
                                        imageUrl={product.images && product.images.length > 0
                                            ? product.images[0].imageUrl
                                            : ''}
                                        fallbackImageUrl={getPlaceholderImageUrl()}
                                        style={styles.productImage}
                                    />
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productTitle} numberOfLines={2}>
                                        {product.title}
                                    </Text>
                                    <Text style={styles.productPrice}>€{product.price}</Text>
                                    <Text style={styles.productCategory}>{product.category}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={48} color={colors.text.secondary} />
                        <Text style={styles.emptyText}>No products available</Text>
                        <Text style={styles.emptySubtext}>Check back later for new listings</Text>
                    </View>
                )}
            </ScrollView>

            {/* Search Modal */}
            <Modal
                visible={searchModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Search Products</Text>
                        <TouchableOpacity
                            onPress={() => setSearchModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        {/* Search Input */}
                        <View style={styles.searchInputContainer}>
                            <Text style={styles.inputLabel}>Search Query</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Enter product name or description..."
                                placeholderTextColor={colors.text.tertiary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Category Filter */}
                        <View style={styles.categoryContainer}>
                            <Text style={styles.inputLabel}>Category (Optional)</Text>
                            <ScrollView style={styles.categoryScrollView} horizontal showsHorizontalScrollIndicator={false}>
                                <TouchableOpacity
                                    style={[
                                        styles.categoryChip,
                                        !selectedCategory && styles.categoryChipSelected
                                    ]}
                                    onPress={() => setSelectedCategory('')}
                                >
                                    <Text style={[
                                        styles.categoryChipText,
                                        !selectedCategory && styles.categoryChipTextSelected
                                    ]}>
                                        All
                                    </Text>
                                </TouchableOpacity>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.value}
                                        style={[
                                            styles.categoryChip,
                                            selectedCategory === category.value && styles.categoryChipSelected
                                        ]}
                                        onPress={() => setSelectedCategory(category.value)}
                                    >
                                        <Text style={[
                                            styles.categoryChipText,
                                            selectedCategory === category.value && styles.categoryChipTextSelected
                                        ]}>
                                            {category.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={clearSearch}
                            >
                                <Text style={styles.clearButtonText}>Clear Search</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.searchActionButton, isSearching && styles.searchActionButtonDisabled]}
                                onPress={searchProducts}
                                disabled={isSearching}
                            >
                                {isSearching ? (
                                    <ActivityIndicator size="small" color={colors.background} />
                                ) : (
                                    <Text style={styles.searchActionButtonText}>Search</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
