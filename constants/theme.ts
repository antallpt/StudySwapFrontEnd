export const colors = {
    primary: '#000000', // Black like Threads
    primaryDark: '#333333',
    secondary: '#FF9500', // Orange accent
    background: '#FFFFFF', // White background like Threads
    cardBackground: '#FFFFFF',
    text: {
        primary: '#000000', // Black text like Threads
        secondary: '#737373', // Gray text like Threads
        tertiary: '#A8A8A8',
    },
    border: '#E5E5EA',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    social: {
        google: '#4285F4',
        facebook: '#1877F2',
        instagram: '#E4405F',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    title: {
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 22,
        color: colors.text.secondary,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 22,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
        color: colors.text.secondary,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 22,
    },
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
};

export const shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
};
