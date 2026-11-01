import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  // @ts-ignore getReactNativePersistence is available in react-native entrypoint of firebase/auth
  getReactNativePersistence,
  Auth, 
  User, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail as fbSendReset,
  sendEmailVerification as fbSendVerify,
  updateProfile as fbUpdateProfile,
  deleteUser as fbDeleteUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { UserProfile, DesignProject } from '../types';

// YClick Firebase Production Configuration
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBhA8-3Ks1TIVa4fPSf-Q4eCUklO7-mKSU',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'yclick-59688.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'yclick-59688',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'yclick-59688.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '178172664634',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:178172664634:web:9a5b6f3238c1adfb8a0e03',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-280EXLJHGD',
};

export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey !== 'demo-api-key'
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Auth with AsyncStorage persistence for React Native / mobile (Problem 2 Fix)
    if (Platform.OS === 'web') {
      try {
        auth = getAuth(app);
      } catch {
        auth = initializeAuth(app);
      }
    } else {
      try {
        if (typeof getReactNativePersistence === 'function') {
          auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage)
          });
        } else {
          auth = getAuth(app);
        }
      } catch {
        auth = getAuth(app);
      }
    }
    
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn('Firebase initialization error, running in demo/offline mode:', err);
  }
}

export { 
  app, 
  auth, 
  db, 
  storage, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential 
};
