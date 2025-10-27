import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface IllustrationProps {
    type: 'signin' | 'signup' | 'forgot-password';
    style?: ViewStyle;
}

export default function Illustration({ type, style }: IllustrationProps) {
    const getIllustrationContent = () => {
        switch (type) {
            case 'signin':
                return (
                    <View style={styles.container}>
                        {/* Person with phone and chart */}
                        <View style={styles.personContainer}>
                            <View style={[styles.person, { backgroundColor: colors.primary }]}>
                                <Ionicons name="person" size={24} color={colors.cardBackground} />
                            </View>
                            <View style={styles.phone}>
                                <Ionicons name="phone-portrait" size={16} color={colors.secondary} />
                            </View>
                            <View style={styles.chart}>
                                <Ionicons name="bar-chart" size={16} color={colors.secondary} />
                            </View>
                        </View>
                    </View>
                );
            case 'signup':
                return (
                    <View style={styles.container}>
                        {/* Person with star and icons */}
                        <View style={styles.personContainer}>
                            <View style={[styles.person, { backgroundColor: colors.secondary }]}>
                                <Ionicons name="person" size={24} color={colors.cardBackground} />
                            </View>
                            <View style={styles.star}>
                                <Ionicons name="star" size={16} color={colors.primary} />
                            </View>
                            <View style={styles.bag}>
                                <Ionicons name="bag" size={16} color={colors.primary} />
                            </View>
                            <View style={styles.document}>
                                <Ionicons name="document-text" size={16} color={colors.primary} />
                            </View>
                        </View>
                    </View>
                );
            case 'forgot-password':
                return (
                    <View style={styles.container}>
                        {/* Person with laptop */}
                        <View style={styles.personContainer}>
                            <View style={[styles.person, { backgroundColor: colors.secondary }]}>
                                <Ionicons name="person" size={24} color={colors.cardBackground} />
                            </View>
                            <View style={styles.laptop}>
                                <Ionicons name="laptop" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.glasses}>
                                <Ionicons name="glasses" size={16} color={colors.primary} />
                            </View>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return <View style={[styles.illustration, style]}>{getIllustrationContent()}</View>;
}

const styles = StyleSheet.create({
    illustration: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        height: 80,
    },
    container: {
        position: 'relative',
        width: 80,
        height: 80,
    },
    personContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    person: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    phone: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    chart: {
        position: 'absolute',
        bottom: 15,
        right: 5,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    star: {
        position: 'absolute',
        top: 5,
        right: 15,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    bag: {
        position: 'absolute',
        bottom: 20,
        left: 5,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    document: {
        position: 'absolute',
        top: 20,
        left: 10,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    laptop: {
        position: 'absolute',
        bottom: 10,
        left: 15,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    glasses: {
        position: 'absolute',
        top: 15,
        right: 20,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
});
