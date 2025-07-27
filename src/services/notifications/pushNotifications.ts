import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFcmToken();
  }
}

export async function getFcmToken() {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
  } else {
    console.log('Failed to get FCM token');
  }
}

export function listenForMessages() {
  messaging().onMessage(async remoteMessage => {
    console.log('FCM Message Data:', remoteMessage.data);
    Alert.alert(
      remoteMessage.notification?.title || 'New Message',
      remoteMessage.notification?.body || 'You have a new message.',
    );
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
    // Navigate to specific screen based on remoteMessage.data
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
        // Navigate to specific screen based on remoteMessage.data
      }
    });
}
