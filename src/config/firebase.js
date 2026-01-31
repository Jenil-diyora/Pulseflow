
import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCZvohbbe2fcsIqpoqHyrlckeaFYjQoRos",
    authDomain: "pulseflow-2a713.firebaseapp.com",
    projectId: "pulseflow-2a713",
    storageBucket: "pulseflow-2a713.firebasestorage.app",
    messagingSenderId: "371341856606",
    appId: "1:371341856606:android:8909cc946f150cc4d449cf"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Authentication with Persistence
let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (e) {
    auth = getAuth(app);
}

// Initialize Firestore with settings for better React Native compatibility
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

export { auth, db };
