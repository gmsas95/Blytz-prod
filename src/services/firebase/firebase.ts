import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';
import database from '@react-native-firebase/database';

// We don't need to initialize the app manually with this library
// as it's handled by the native configuration (google-services.json)

const app = firebase.app();

export {app, auth, firestore, storage, functions, database};
