import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../components/LoadingScreen';
import Input from '../../components/ui/Input';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface SelectedImage {
    uri: string;
    id: string;
    isMain?: boolean;
    type?: string;
    fileName?: string;
}

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

export default function AddPage() {
    const { isAuthenticated, isLoading, refreshUserData } = useAuth();
    const insets = useSafeAreaInsets();
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Redirect href="/(public)" />;
    }

    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
            allowsEditing: false,
        });

        if (!result.canceled) {
            const newImages = result.assets.map((asset: any, index: number) => ({
                uri: asset.uri,
                id: `${Date.now()}-${index}`,
                isMain: selectedImages.length === 0 && index === 0, // First image becomes main
                type: asset.type || 'image/jpeg',
                fileName: asset.fileName || `image_${Date.now()}_${index}.jpg`,
            }));
            setSelectedImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (imageId: string) => {
        setSelectedImages(prev => {
            const filtered = prev.filter(img => img.id !== imageId);
            // If we removed the main image, make the first remaining image the main one
            if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
                filtered[0].isMain = true;
            }
            return filtered;
        });
    };

    const setMainImage = (imageId: string) => {
        setSelectedImages(prev => {
            // Find the image to make main
            const imageToMove = prev.find(img => img.id === imageId);
            if (!imageToMove) return prev;

            // Remove it from its current position
            const otherImages = prev.filter(img => img.id !== imageId);

            // Put it at the beginning and mark as main
            const reorderedImages = [
                { ...imageToMove, isMain: true },
                ...otherImages.map(img => ({ ...img, isMain: false }))
            ];

            return reorderedImages;
        });
    };

    const reorderImages = (data: SelectedImage[]) => {
        // Reset all images to not be main, then set the first one as main
        const reorderedImages = data.map((image, index) => ({
            ...image,
            isMain: index === 0
        }));
        setSelectedImages(reorderedImages);
    };

    const handleLongPressStart = (drag: () => void) => {
        longPressTimer.current = setTimeout(() => {
            drag();
        }, 200); // 200ms instead of default ~500ms
    };

    const handleLongPressEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }
        if (!price.trim()) {
            Alert.alert('Error', 'Please enter a price');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }
        if (selectedImages.length === 0) {
            Alert.alert('Error', 'Please add at least one image');
            return;
        }

        // Validate price is a valid number
        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue < 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('Creating product with data:', {
                title: title.trim(),
                description: description.trim(),
                price: priceValue,
                category: selectedCategory,
                imageCount: selectedImages.length
            });

            // Prepare images for API
            const imageFiles = selectedImages.map(image => ({
                uri: image.uri,
                type: image.type || 'image/jpeg',
                fileName: image.fileName || `image_${image.id}.jpg`
            }));

            // Create the product
            const response = await apiService.createProduct({
                title: title.trim(),
                description: description.trim(),
                price: priceValue,
                category: selectedCategory,
                images: imageFiles
            });

            console.log('Product created successfully:', response);

            Alert.alert(
                'Success!',
                'Your item has been listed successfully!',
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                            // Reset form
                            setTitle('');
                            setDescription('');
                            setPrice('');
                            setSelectedCategory('');
                            setSelectedImages([]);

                            // Refresh user data to update product listings
                            try {
                                await refreshUserData();
                            } catch (error) {
                                console.error('Error refreshing user data:', error);
                            }

                            // Navigate to home page
                            router.push('/(tabs)/home');
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error('Error creating product:', error);

            let errorMessage = 'Failed to create listing. Please try again.';
            let shouldLogout = false;

            if (error.status === 401 || error.message?.includes('Authentication failed') || error.message?.includes('Invalid or expired refresh token')) {
                errorMessage = 'Your session has expired. Please log in again.';
                shouldLogout = true;
            } else if (error.status === 403) {
                errorMessage = 'You do not have permission to create listings.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert(
                'Error',
                errorMessage,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (shouldLogout) {
                                // The AuthContext will handle the logout automatically
                                // when it detects invalid tokens
                            }
                        }
                    }
                ]
            );
        } finally {
            setIsSubmitting(false);
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
        headerButton: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.primary,
            borderRadius: 8,
            minWidth: 60,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerButtonText: {
            ...typography.button,
            color: colors.background,
            fontSize: 16,
            fontWeight: '600',
        },
        content: {
            flex: 1,
            paddingHorizontal: spacing.lg,
        },
        scrollContent: {
            paddingBottom: 100 + Math.max(insets.bottom, 8), // Add padding for bottom tab bar with safe area
        },
        section: {
            marginBottom: spacing.lg,
        },
        photosSection: {
            marginBottom: spacing.lg,
            paddingTop: spacing.sm,
        },
        imageSectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        imageCount: {
            ...typography.caption,
            color: colors.text.secondary,
            fontSize: 14,
        },
        imageInstructions: {
            ...typography.caption,
            color: colors.text.secondary,
            fontSize: 12,
            marginBottom: spacing.sm,
            fontStyle: 'italic',
        },
        label: {
            ...typography.caption,
            marginBottom: spacing.xs,
            color: colors.text.primary,
            fontSize: 16,
            fontWeight: '500',
        },
        imageContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
        },
        imageWrapper: {
            position: 'relative',
            width: 90,
            height: 90,
            marginRight: spacing.sm,
        },
        imageItem: {
            width: 90,
            height: 90,
            borderRadius: 8,
            overflow: 'hidden',
        },
        selectedImage: {
            width: 90,
            height: 90,
            borderRadius: 8,
        },
        removeImageButton: {
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: colors.primary,
            borderRadius: 10,
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        setMainButton: {
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: colors.background,
            borderRadius: 10,
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        addImageButton: {
            width: 90,
            height: 90,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.cardBackground,
        },
        textAreaContainer: {
            backgroundColor: colors.cardBackground,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            minHeight: 80,
        },
        textArea: {
            ...typography.body,
            color: colors.text.primary,
            flex: 1,
            textAlignVertical: 'top',
            fontSize: 16,
        },
        categoryContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
        },
        categoryButton: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 16,
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
        },
        selectedCategoryButton: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        categoryText: {
            ...typography.caption,
            color: colors.text.primary,
            fontSize: 14,
            fontWeight: '500',
        },
        selectedCategoryText: {
            color: colors.background,
            fontWeight: '600',
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>New Listing</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.headerButtonText}>
                        {isSubmitting ? "Creating..." : "List"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Images Section */}
                <View style={styles.photosSection}>
                    <View style={styles.imageSectionHeader}>
                        <Text style={styles.label}>Photos</Text>
                        <Text style={styles.imageCount}>{selectedImages.length}/10</Text>
                    </View>
                    {selectedImages.length > 0 && (
                        <Text style={styles.imageInstructions}>
                            The starred picture is the main image displayed
                        </Text>
                    )}

                    <View style={styles.imageContainer}>
                        {selectedImages.length > 0 ? (
                            <DraggableFlatList
                                data={selectedImages}
                                onDragEnd={({ data }) => reorderImages(data)}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                activationDistance={1}
                                dragItemOverflow={true}
                                renderItem={({ item, drag, isActive }: RenderItemParams<SelectedImage>) => (
                                    <View style={styles.imageWrapper}>
                                        <TouchableOpacity
                                            style={styles.imageItem}
                                            onPressIn={() => handleLongPressStart(drag)}
                                            onPressOut={handleLongPressEnd}
                                            disabled={isActive}
                                        >
                                            <Image source={{ uri: item.uri }} style={styles.selectedImage} />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => removeImage(item.id)}
                                            >
                                                <Ionicons name="close" size={16} color={colors.background} />
                                            </TouchableOpacity>
                                            {item.isMain && (
                                                <TouchableOpacity
                                                    style={styles.setMainButton}
                                                    onPress={() => setMainImage(item.id)}
                                                >
                                                    <Ionicons
                                                        name="star"
                                                        size={16}
                                                        color={colors.warning}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        ) : null}

                        {selectedImages.length < 10 && (
                            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                                <Ionicons name="add" size={24} color={colors.text.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Title Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Title</Text>
                    <Input
                        placeholder="What are you selling?"
                        value={title}
                        onChangeText={setTitle}
                        icon="text"
                        autoCapitalize="words"
                    />
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Description</Text>
                    <View style={styles.textAreaContainer}>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Tell us about your item..."
                            placeholderTextColor={colors.text.tertiary}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            autoCapitalize="sentences"
                        />
                    </View>
                </View>

                {/* Price Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Price</Text>
                    <Input
                        placeholder="0.00"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        icon="cash"
                    />
                </View>

                {/* Category Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryContainer}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.value}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === category.value && styles.selectedCategoryButton
                                ]}
                                onPress={() => setSelectedCategory(category.value)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === category.value && styles.selectedCategoryText
                                ]}>
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
