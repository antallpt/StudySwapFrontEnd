import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../components/LoadingScreen';
import Avatar from '../../components/ui/Avatar';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, ChatDTO } from '../../services/api';

export default function MessagesPage() {
    const { isAuthenticated, isLoading, user, refreshAccessToken } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [chats, setChats] = useState<ChatDTO[]>([]);
    const [chatsLoading, setChatsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [otherUsers, setOtherUsers] = useState<Record<number, { firstName: string; lastName: string }>>({});
    const [latestMessages, setLatestMessages] = useState<Record<number, string>>({});

    // Fetch user chats
    const fetchChats = async () => {
        if (!isAuthenticated) return;

        try {
            setChatsLoading(true);
            const response = await apiService.getChats(0, 20);
            console.log('Chats response:', response);
            console.log('Chats data:', response);

            // Debug each chat's lastMessage
            if (response && response.length > 0) {
                response.forEach((chat, index) => {
                    console.log(`Chat ${index}:`, {
                        id: chat.id,
                        lastMessage: chat.lastMessage,
                        lastMessageAt: chat.lastMessageAt,
                        sellerId: chat.sellerId,
                        buyerId: chat.buyerId
                    });
                });
            }

            setChats(response || []);

            // Fetch other users' information and latest messages for each chat
            const otherUsersData: Record<number, { firstName: string; lastName: string }> = {};
            const latestMessages: Record<number, string> = {};

            for (const chat of response || []) {
                const isSeller = user?.userId && chat.sellerId.toString() === user.userId;
                const otherUserId = isSeller ? chat.buyerId : chat.sellerId;

                // Fetch other user's information
                try {
                    const otherUserData = await apiService.getUserById(otherUserId);
                    otherUsersData[otherUserId] = {
                        firstName: otherUserData.firstName,
                        lastName: otherUserData.lastName
                    };
                } catch (error) {
                    console.error(`Error fetching user ${otherUserId}:`, error);
                }

                // Fetch latest message for this chat
                try {
                    const messages = await apiService.getMessages(chat.id, 0, 1);
                    if (messages && messages.length > 0) {
                        latestMessages[chat.id] = messages[0].body;
                    }
                } catch (error) {
                    console.error(`Error fetching latest message for chat ${chat.id}:`, error);
                }
            }
            setOtherUsers(otherUsersData);
            setLatestMessages(latestMessages);
        } catch (error: any) {
            console.error('Error fetching chats:', error);

            // If it's an authentication error, try to refresh the token
            if (error.status === 401 || error.status === 403 || error.message?.includes('Authentication failed') || error.message?.includes('No access token available')) {
                console.log('Authentication error, attempting to refresh token...');
                try {
                    const refreshSuccess = await refreshAccessToken();
                    if (refreshSuccess) {
                        // Retry the request after token refresh
                        try {
                            const response = await apiService.getChats(0, 20);
                            setChats(response || []);
                            return;
                        } catch (retryError) {
                            console.error('Error after token refresh:', retryError);
                        }
                    }
                } catch (refreshError) {
                    console.error('Error during token refresh:', refreshError);
                }
            }

            // Set empty array instead of crashing
            setChats([]);
        } finally {
            setChatsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchChats();
        }
    }, [isAuthenticated]);

    // Refresh when user changes (account switching)
    useEffect(() => {
        if (isAuthenticated && user?.userId && user.userId !== 'loading') {
            console.log('User changed in messages, refreshing chats...', {
                userId: user.userId,
                firstName: user.firstName
            });
            fetchChats();
        }
    }, [user?.userId]); // Listen for userId changes

    // Auto-refresh when user tabs into messages page
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                console.log('Messages page focused, refreshing chats...');
                handleRefresh();
            }
        }, [isAuthenticated])
    );

    // Refresh data when screen comes into focus
    const handleRefresh = async () => {
        if (isAuthenticated) {
            try {
                await fetchChats();
            } catch (error) {
                console.error('Error during refresh:', error);
            }
        }
    };

    // Pull to refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await handleRefresh();
        } catch (error) {
            console.error('Error during pull to refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleChatPress = (chatId: number) => {
        router.push(`/chat/${chatId}` as any);
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    };

    const renderChatItem = ({ item }: { item: ChatDTO }) => {
        const isSeller = user?.userId && item.sellerId.toString() === user.userId;
        const otherUserId = isSeller ? item.buyerId : item.sellerId;

        console.log('Rendering chat item:', {
            chatId: item.id,
            lastMessage: item.lastMessage,
            lastMessageBody: item.lastMessage?.body,
            latestMessageFromState: latestMessages[item.id],
            lastMessageAt: item.lastMessageAt,
            hasLastMessage: !!item.lastMessage,
            hasLatestMessageFromState: !!latestMessages[item.id]
        });

        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => handleChatPress(item.id)}
                activeOpacity={0.7}
            >
                <Avatar
                    firstName={otherUsers[otherUserId]?.firstName || (isSeller ? 'B' : 'S')}
                    lastName={otherUsers[otherUserId]?.lastName || ''}
                    size={50}
                />

                <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatTitle}>
                            {otherUsers[otherUserId] ? `${otherUsers[otherUserId].firstName} ${otherUsers[otherUserId].lastName}` : (isSeller ? `Buyer ${otherUserId}` : `Seller ${otherUserId}`)}
                        </Text>
                        {item.lastMessageAt && (
                            <Text style={styles.chatTime}>
                                {formatTime(item.lastMessageAt)}
                            </Text>
                        )}
                    </View>

                    <Text style={styles.chatPreview} numberOfLines={1}>
                        {latestMessages[item.id] || 'No messages yet'}
                    </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Redirect href="/(public)" />;
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: insets.top,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            height: 60,
        },
        headerTitle: {
            ...typography.title,
            fontSize: 20,
            fontWeight: '600',
            color: colors.text.primary,
        },
        content: {
            flex: 1,
        },
        chatItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        chatAvatar: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
        },
        chatContent: {
            flex: 1,
        },
        chatHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xs,
        },
        chatTitle: {
            ...typography.title,
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.primary,
        },
        chatTime: {
            ...typography.caption,
            color: colors.text.secondary,
            fontSize: 12,
        },
        chatPreview: {
            ...typography.body,
            color: colors.text.secondary,
            fontSize: 14,
        },
        loadingContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.xxl,
        },
        loadingText: {
            ...typography.body,
            color: colors.text.secondary,
            marginTop: spacing.sm,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.xxl,
        },
        emptyText: {
            ...typography.title,
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary,
            marginTop: spacing.md,
        },
        emptySubtext: {
            ...typography.body,
            color: colors.text.secondary,
            marginTop: spacing.xs,
            textAlign: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            <View style={styles.content}>
                {chatsLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading conversations...</Text>
                    </View>
                ) : chats.length > 0 ? (
                    <FlatList
                        data={chats}
                        keyExtractor={(item) => `chat-${item.id}`}
                        renderItem={renderChatItem}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.primary}
                                colors={[colors.primary]}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={48} color={colors.text.secondary} />
                        <Text style={styles.emptyText}>No conversations yet</Text>
                        <Text style={styles.emptySubtext}>Start a conversation by messaging a seller</Text>
                    </View>
                )}
            </View>
        </View>
    );
}