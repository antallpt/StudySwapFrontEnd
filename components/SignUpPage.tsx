import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
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

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        university: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSignUp = async () => {
        const { firstName, lastName, email, password, confirmPassword, university } = formData;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !university) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            // Generate device ID for registration
            const deviceId = await generateDeviceId();

            const response = await apiService.register({
                email,
                password,
                firstName,
                lastName,
                university,
                deviceId,
            });

            if (response.isLoggedIn === 'true' && response.accessToken && response.refreshToken) {
                // Auto-login after successful registration
                const userData = {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    university: formData.university,
                };

                const tokens = {
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                };

                await login(userData, tokens);
                Alert.alert('Success', 'Account created successfully!');
                // Navigation will be handled automatically by the auth context
            } else {
                Alert.alert('Error', response.errorMessage || 'Registration failed');
            }
        } catch (error: any) {
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    if (error.message.includes('Duplicate Email')) {
                        Alert.alert('Error', 'An account with this email already exists');
                    } else {
                        Alert.alert('Error', 'Invalid registration data. Please check your information.');
                    }
                } else {
                    Alert.alert('Error', `Registration failed: ${error.message}`);
                }
            } else {
                Alert.alert('Error', 'Network error. Please check your connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Join StudySwap</Text>
                            <Text style={styles.subtitle}>Create your account to start studying together</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="First Name"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={formData.firstName}
                                    onChangeText={(value) => handleInputChange('firstName', value)}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last Name"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={formData.lastName}
                                    onChangeText={(value) => handleInputChange('lastName', value)}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={formData.email}
                                    onChangeText={(value) => handleInputChange('email', value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="University"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={formData.university}
                                    onChangeText={(value) => handleInputChange('university', value)}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={formData.password}
                                    onChangeText={(value) => handleInputChange('password', value)}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
                                onPress={handleSignUp}
                                disabled={isLoading}
                            >
                                <Text style={styles.signUpButtonText}>
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Text>
                            </TouchableOpacity>

                            {/* Terms */}
                            <View style={styles.termsContainer}>
                                <Text style={styles.termsText}>
                                    By creating an account, you agree to our{' '}
                                    <Text style={styles.termsLink}>Terms of Service</Text>
                                    {' '}and{' '}
                                    <Text style={styles.termsLink}>Privacy Policy</Text>
                                </Text>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Already have an account?{' '}
                                <Link href="./" asChild>
                                    <Text style={styles.footerLink}>Sign in</Text>
                                </Link>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
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
    signUpButton: {
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
    signUpButtonText: {
        ...typography.button,
        color: colors.cardBackground,
    },
    termsContainer: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.sm,
    },
    termsText: {
        ...typography.caption,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    termsLink: {
        color: colors.primary,
        fontWeight: '600',
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