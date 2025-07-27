import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ChatMessage } from '../../../../../types/models';

interface ChatSectionProps {
  messages: ChatMessage[];
  maxVisibleMessages?: number;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  maxVisibleMessages = 3,
}) => {
  // Get the most recent messages
  const recentMessages = messages
    .slice(-maxVisibleMessages)
    .reverse(); // Show newest at bottom

  return (
    <View style={styles.chatContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContainer}
      >
        {recentMessages.map((message) => (
          <View key={message.id} style={styles.messageWrapper}>
            <Text style={styles.chatMessage}>
              <Text style={styles.username}>{message.userName}:</Text>{' '}
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    marginBottom: 16,
    maxHeight: 120, // Limit height to prevent overlap
  },
  messagesContainer: {
    justifyContent: 'flex-end',
  },
  messageWrapper: {
    marginBottom: 4,
  },
  chatMessage: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    fontSize: 14,
  },
  username: {
    fontWeight: 'bold',
  },
});

export default ChatSection;
