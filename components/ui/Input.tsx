import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface InputProps {
    label?: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    error?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export default function Input({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    icon,
    error,
    keyboardType = 'default',
    autoCapitalize = 'none',
}: InputProps) {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const inputStyle = [
        styles.input,
        isFocused && styles.inputFocused,
        error && styles.inputError,
    ];

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? colors.primary : colors.text.tertiary}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={inputStyle}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.text.tertiary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.sm,
    },
    label: {
        ...typography.caption,
        marginBottom: spacing.xs,
        color: colors.text.primary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        minHeight: 48,
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        ...typography.body,
        color: colors.text.primary,
        paddingVertical: spacing.sm,
        fontSize: 16,
    },
    inputFocused: {
        borderColor: colors.primary,
    },
    inputError: {
        borderColor: colors.error,
    },
    eyeIcon: {
        padding: spacing.xs,
    },
    errorText: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
