import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { borderRadius, colors, shadows, spacing, typography } from '../constants/theme';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const validateEmail = () => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        setError('');
        return true;
    };

    const handleSendOTP = async () => {
        if (!validateEmail()) return;

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setEmailSent(true);
            Alert.alert(
                'OTP Sent',
                'We have sent a verification code to your email address. Please check your inbox.'
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = () => {
        router.push('./');
    };

    const handleResendOTP = () => {
        setEmailSent(false);
        setEmail('');
        setError('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>
                            Don't worry, it happens. Please enter the email address associated with your account.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {!emailSent ? (
                            <>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input, error && styles.inputError]}
                                        placeholder="Email"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                                </View>

                                <TouchableOpacity
                                    style={[styles.sendButton, loading && styles.buttonDisabled]}
                                    onPress={handleSendOTP}
                                    disabled={loading}
                                >
                                    <Text style={styles.sendButtonText}>
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.successContainer}>
                                <View style={styles.successIcon}>
                                    <Text style={styles.successText}>✓</Text>
                                </View>
                                <Text style={styles.successTitle}>Check Your Email</Text>
                                <Text style={styles.successMessage}>
                                    We've sent a password reset link to {email}
                                </Text>
                                <TouchableOpacity
                                    style={styles.resendButton}
                                    onPress={handleResendOTP}
                                >
                                    <Text style={styles.resendButtonText}>Resend Link</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Remember your password?{' '}
                                <Text style={styles.footerLink} onPress={handleSignIn}>
                                    Sign in
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        ...typography.title,
        color: colors.text.primary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.subtitle,
        textAlign: 'center',
    },
    form: {
        marginBottom: spacing.xl,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    input: {
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 16,
        color: colors.text.primary,
        ...shadows.card,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorText: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
    },
    sendButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.lg,
        ...shadows.card,
    },
    buttonDisabled: {
        backgroundColor: colors.text.tertiary,
    },
    sendButtonText: {
        ...typography.button,
        color: colors.cardBackground,
    },
    successContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    successIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    successText: {
        color: colors.cardBackground,
        fontSize: 24,
        fontWeight: 'bold',
    },
    successTitle: {
        ...typography.title,
        marginBottom: spacing.sm,
        color: colors.text.primary,
        textAlign: 'center',
    },
    successMessage: {
        ...typography.subtitle,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    resendButton: {
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        ...shadows.card,
    },
    resendButtonText: {
        ...typography.button,
        color: colors.text.primary,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        ...typography.body,
        color: colors.text.secondary,
    },
    footerLink: {
        color: colors.primary,
        fontWeight: '600',
    },
});
