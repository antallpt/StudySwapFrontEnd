import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface BottomNavigationProps {
    activeTab?: string;
    onTabPress?: (tab: string) => void;
}

export default function BottomNavigation({
    activeTab = 'home',
    onTabPress
}: BottomNavigationProps) {
    const tabs = [
        { id: 'home', icon: 'home' },
        { id: 'add', icon: 'add' },
        { id: 'messages', icon: 'chatbubble' },
        { id: 'profile', icon: 'person' },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <TouchableOpacity
                        key={tab.id}
                        style={styles.tab}
                        onPress={() => onTabPress?.(tab.id)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                            <Ionicons
                                name={tab.icon as any}
                                size={24}
                                color={isActive ? colors.background : colors.text.primary}
                            />
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIconContainer: {
        backgroundColor: colors.primary,
    },
});
