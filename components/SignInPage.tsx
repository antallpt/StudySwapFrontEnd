import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { ApiError, apiService } from '../services/api';
import { generateDeviceId } from '../services/tokenService';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            // Generate device ID for login
            const deviceId = await generateDeviceId();

            const response = await apiService.login({
                email,
                password,
                deviceId
            });

            if (response.isLoginSuccesfull === 'true' && response.accessToken && response.refreshToken) {
                // Create user object for auth context
                const userData = {
                    email,
                    firstName: 'User', // You might want to get this from the API response
                    lastName: 'Name',
                    university: 'University',
                };

                const tokens = {
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                };

                await login(userData, tokens);
                Alert.alert('Success', 'Login successful!');
                // Navigation will be handled automatically by the auth context
            } else {
                Alert.alert('Error', 'Invalid credentials');
            }
        } catch (error: any) {
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    Alert.alert('Error', 'Invalid email or password');
                } else {
                    Alert.alert('Error', `Login failed: ${error.message}`);
                }
            } else {
                Alert.alert('Error', 'Network error. Please check your connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        // TODO: Implement Google OAuth
        // For now, navigate directly to home page
        router.push('/(public)/home' as any);
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
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>Sign in to continue to StudySwap</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={colors.text.tertiary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={colors.text.tertiary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.signInButton, isLoading && styles.buttonDisabled]}
                            onPress={handleSignIn}
                            disabled={isLoading}
                        >
                            <Text style={styles.signInButtonText}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google Sign In */}
                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleSignIn}
                        >
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => router.push('./forgot-password')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Don't have an account?{' '}
                            <Link href="./signup" asChild>
                                <Text style={styles.footerLink}>Sign up</Text>
                            </Link>
                        </Text>
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
    signInButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
        ...shadows.card,
    },
    buttonDisabled: {
        backgroundColor: colors.text.tertiary,
    },
    signInButtonText: {
        ...typography.button,
        color: colors.cardBackground,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        ...typography.caption,
        marginHorizontal: spacing.md,
    },
    googleButton: {
        backgroundColor: colors.social.google,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        ...shadows.card,
    },
    googleButtonText: {
        ...typography.button,
        color: colors.cardBackground,
    },
    quickAccessButton: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
        ...shadows.card,
    },
    quickAccessButtonText: {
        ...typography.button,
        color: colors.cardBackground,
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    forgotPasswordText: {
        ...typography.caption,
        color: colors.primary,
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