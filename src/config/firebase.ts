import { firebase } from '@react-native-firebase/app';

// Firebase is auto-initialized on Android/iOS with google-services.json
// This file ensures it's ready before we use it

const initializeFirebase = async () => {
  try {
    // Check if already initialized
    if (!firebase.apps.length) {
      console.log('Firebase not initialized, but should auto-initialize from google-services.json');
    } else {
      console.log('Firebase already initialized');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

initializeFirebase();

export default firebase;
