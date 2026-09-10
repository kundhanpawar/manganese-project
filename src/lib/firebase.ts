import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and Auth
export const storage = getStorage(app);
export const auth = getAuth(app);

// Authenticate anonymously so we can write to storage
signInAnonymously(auth).catch((error) => {
  console.warn("Anonymous auth failed:", error);
});

