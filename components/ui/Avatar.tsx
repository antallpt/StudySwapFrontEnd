import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../constants/theme';

interface AvatarProps {
    firstName: string;
    lastName?: string;
    size?: number;
    backgroundColor?: string;
    textColor?: string;
}

export default function Avatar({
    firstName,
    lastName,
    size = 50,
    backgroundColor = colors.primary,
    textColor = colors.background
}: AvatarProps) {
    const getInitials = () => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '?';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return firstInitial + lastInitial;
    };

    const fontSize = size * 0.4; // 40% of the avatar size

    return (
        <View style={[
            styles.avatar,
            {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: backgroundColor,
            }
        ]}>
            <Text style={[
                styles.initial,
                {
                    fontSize: fontSize,
                    color: textColor,
                }
            ]}>
                {getInitials()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.text.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    initial: {
        ...typography.title,
        fontWeight: '700',
    },
});
