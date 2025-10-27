import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, typography } from '../../constants/theme';

interface SectionHeaderProps {
    title: string;
    onSeeAll?: () => void;
    showSeeAll?: boolean;
}

export default function SectionHeader({
    title,
    onSeeAll,
    showSeeAll = true
}: SectionHeaderProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {showSeeAll && onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
                    <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 16,
    },
    title: {
        ...typography.title,
        fontSize: 24,
        fontWeight: '700',
        color: colors.text.primary,
    },
    seeAllText: {
        ...typography.caption,
        color: colors.text.secondary,
        fontSize: 16,
    },
});
