import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const ScheduleStreamScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Schedule Stream Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default ScheduleStreamScreen;
