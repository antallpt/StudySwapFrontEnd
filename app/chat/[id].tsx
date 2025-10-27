import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../components/LoadingScreen';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, ChatDTO, MessageDTO } from '../../services/api';

export default function ChatPage() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id, sellerName, sellerId } = useLocalSearchParams<{ id: string; sellerName?: string; sellerId?: string }>();
    const [chat, setChat] = useState<ChatDTO | null>(null);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState<{ firstName: string; lastName: string } | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (id && isAuthenticated) {
            fetchChatAndMessages();
        }
    }, [id, isAuthenticated]);

    // Fetch user data if not available or if user changes
    useEffect(() => {
        if (isAuthenticated) {
            console.log('User changed, fetching fresh user profile...', user);
            fetchUserProfile();
        }
    }, [isAuthenticated, user?.userId]); // Listen for userId changes

    const fetchUserProfile = async () => {
        try {
            const userData = await apiService.getUserProfile();
            console.log('Fetched user profile in chat:', userData);
            setCurrentUserId(userData.userId);
        } catch (error) {
            console.error('Error fetching user profile in chat:', error);
        }
    };

    const fetchChatAndMessages = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const chatId = parseInt(id);

            // Fetch chat details and messages in parallel
            const [chatData, messagesData] = await Promise.all([
                apiService.getChat(chatId),
                apiService.getMessages(chatId, 0, 50)
            ]);

            console.log('Chat data:', chatData);
            console.log('Messages data:', messagesData);

            setChat(chatData);
            setMessages(messagesData || []);

            // Fetch other user's information
            const isSeller = user?.userId && chatData.sellerId.toString() === user.userId;
            const otherUserId = isSeller ? chatData.buyerId : chatData.sellerId;

            try {
                const otherUserData = await apiService.getUserById(otherUserId);
                console.log('Other user data received:', otherUserData);
                setOtherUser({
                    firstName: otherUserData.firstName,
                    lastName: otherUserData.lastName
                });
            } catch (error) {
                console.error('Error fetching other user data:', error);
                setOtherUser(null);
            }
        } catch (error: any) {
            console.error('Error fetching chat and messages:', error);
            Alert.alert('Error', `Failed to load chat: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !id || sending) return;

        const messageText = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            const chatId = parseInt(id);
            const sentMessage = await apiService.sendMessage(chatId, messageText);
            console.log('Message sent:', sentMessage);

            // Add the new message to the list
            setMessages(prev => [sentMessage, ...prev]);

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

        } catch (error: any) {
            console.error('Error sending message:', error);
            Alert.alert('Error', `Failed to send message: ${error.message || 'Unknown error'}`);
            // Restore the message text if sending failed
            setNewMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }: { item: MessageDTO }) => {
        const isOwnMessage = currentUserId && item.senderId === currentUserId;

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                    ]}>
                        {item.body}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
                    ]}>
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

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
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary,
        },
        messagesContainer: {
            flex: 1,
            paddingHorizontal: spacing.md,
        },
        messageContainer: {
            marginVertical: spacing.xs,
        },
        ownMessageContainer: {
            alignItems: 'flex-end',
        },
        otherMessageContainer: {
            alignItems: 'flex-start',
        },
        messageBubble: {
            maxWidth: '80%',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 16,
        },
        ownMessageBubble: {
            backgroundColor: colors.primary,
            borderBottomRightRadius: 4,
        },
        otherMessageBubble: {
            backgroundColor: colors.border,
            borderBottomLeftRadius: 4,
        },
        messageText: {
            fontSize: 16,
            lineHeight: 20,
        },
        ownMessageText: {
            color: colors.background,
        },
        otherMessageText: {
            color: colors.text.primary,
        },
        messageTime: {
            fontSize: 12,
            marginTop: spacing.xs,
        },
        ownMessageTime: {
            color: colors.background,
            opacity: 0.7,
        },
        otherMessageTime: {
            color: colors.text.secondary,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
        textInput: {
            flex: 1,
            backgroundColor: colors.cardBackground,
            borderRadius: 20,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            marginRight: spacing.sm,
            fontSize: 16,
            color: colors.text.primary,
            maxHeight: 100,
        },
        sendButton: {
            backgroundColor: colors.primary,
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        sendButtonDisabled: {
            backgroundColor: colors.text.tertiary,
        },
        errorContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        errorText: {
            ...typography.title,
            color: colors.text.secondary,
        },
    });

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Redirect href="/(public)" />;
    }

    if (!chat) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chat</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Chat not found</Text>
                </View>
            </View>
        );
    }

    const isSeller = user?.userId && chat.sellerId.toString() === user.userId;
    const otherUserId = isSeller ? chat.buyerId : chat.sellerId;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : (sellerName || (isSeller ? `Buyer ${otherUserId}` : `Seller ${otherUserId}`))}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                ref={flatListRef}
                style={styles.messagesContainer}
                data={messages.slice().reverse()} // Manually reverse the array
                keyExtractor={(item) => `message-${item.id}`}
                renderItem={renderMessage}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: spacing.sm }}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.text.tertiary}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!newMessage.trim() || sending) && styles.sendButtonDisabled
                    ]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color={colors.background} />
                    ) : (
                        <Ionicons name="send" size={20} color={colors.background} />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
