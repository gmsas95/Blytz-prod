import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LiveStreamViewerScreen from '../screens/LiveStream/viewer/LiveStreamViewerScreen';
import LiveStreamHostScreen from '../screens/LiveStream/seller/LiveStreamHostScreen';
import ScheduleStreamScreen from '../screens/LiveStream/seller/ScheduleStreamScreen';
import PreviousStreamsScreen from '../screens/LiveStream/viewer/PreviousStreamsScreen';
import StreamEndedScreen from '../screens/LiveStream/viewer/StreamEndedScreen';

const Stack = createNativeStackNavigator();

export const LiveStreamNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="LiveStreamHost" component={LiveStreamHostScreen} />
      <Stack.Screen
        name="LiveStreamViewer"
        component={LiveStreamViewerScreen}
      />
      <Stack.Screen name="ScheduleStream" component={ScheduleStreamScreen} />
      <Stack.Screen name="PreviousStreams" component={PreviousStreamsScreen} />
      <Stack.Screen name="StreamEnded" component={StreamEndedScreen} />
    </Stack.Navigator>
  );
};
