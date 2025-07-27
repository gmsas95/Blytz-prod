import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
}

interface ChatSectionComponentProps {
  messages?: ChatMessage[];
}

const ChatSectionComponent: React.FC<ChatSectionComponentProps> = ({
  messages = [
    { id: '1', username: 'Hotspurs', message: 'love this!' },
    { id: '2', username: 'Moneymain', message: 'gotta get this!!' },
  ],
}) => {
  return (
    <View style={styles.container}>
      {messages.map((msg) => (
        <Text key={msg.id} style={styles.chatMessage}>
          <Text style={styles.username}>{msg.username}:</Text> {msg.message}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  chatMessage: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  username: {
    fontWeight: 'bold',
  },
});

export default ChatSectionComponent;
