import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const ReactionComponent = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Text style={styles.reaction}>❤️</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.reaction}>🔥</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.reaction}>👍</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 80,
    right: 16,
  },
  reaction: {
    fontSize: 30,
    marginHorizontal: 8,
  },
});

export default ReactionComponent;
