import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'social';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    socialType?: 'google' | 'facebook';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    socialType,
    style,
    textStyle,
}: ButtonProps) {
    const buttonStyle = [
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const buttonTextStyle = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ];

    const getSocialIcon = () => {
        if (socialType === 'google') {
            return 'logo-google';
        } else if (socialType === 'facebook') {
            return 'logo-facebook';
        }
        return icon;
    };

    const getSocialColor = () => {
        if (socialType === 'google') {
            return colors.social.google;
        } else if (socialType === 'facebook') {
            return colors.social.facebook;
        }
        return colors.primary;
    };

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.cardBackground : colors.primary}
                    size="small"
                />
            ) : (
                <>
                    {getSocialIcon() && (
                        <Ionicons
                            name={getSocialIcon()!}
                            size={20}
                            color={socialType ? colors.cardBackground : getSocialColor()}
                            style={styles.icon}
                        />
                    )}
                    <Text style={buttonTextStyle}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    social: {
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
    },
    small: {
        paddingVertical: spacing.sm,
        minHeight: 36,
    },
    medium: {
        paddingVertical: spacing.sm,
        minHeight: 44,
    },
    large: {
        paddingVertical: spacing.lg,
        minHeight: 56,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...typography.button,
        textAlign: 'center',
    },
    primaryText: {
        color: colors.cardBackground,
    },
    secondaryText: {
        color: colors.text.primary,
    },
    socialText: {
        color: colors.text.primary,
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },
    disabledText: {
        opacity: 0.7,
    },
    icon: {
        marginRight: spacing.sm,
    },
});
