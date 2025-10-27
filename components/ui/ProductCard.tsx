import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, shadows, typography } from '../../constants/theme';

interface ProductCardProps {
    product: {
        id: string;
        title: string;
        price: string;
        image: string;
        category: string;
    };
    style?: any;
    onPress?: () => void;
}

export default function ProductCard({ product, style, onPress }: ProductCardProps) {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image source={{ uri: product.image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                    {product.title}
                </Text>
                <Text style={styles.price}>{product.price}</Text>
                <Text style={styles.category}>{product.category}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        ...shadows.card,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
    },
    info: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 6,
        fontSize: 14,
    },
    price: {
        ...typography.body,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 4,
        fontSize: 16,
    },
    category: {
        ...typography.caption,
        color: colors.text.secondary,
        fontSize: 12,
    },
});
