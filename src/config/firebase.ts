import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('your_firebase_api_key')
);

const isNewApp = !getApps().some((a) => a.name === '[DEFAULT]');
const app = isNewApp ? initializeApp(firebaseConfig) : getApps().find((a) => a.name === '[DEFAULT]')!;

export const auth = getAuth(app);

let firestoreInstance;
try {
  firestoreInstance = isNewApp
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      })
    : getFirestore(app);
} catch {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

export const getSecondaryAuth = () => {
  const secondaryApp =
    getApps().find((a) => a.name === 'Secondary') || initializeApp(firebaseConfig, 'Secondary');
  return getAuth(secondaryApp);
};

export const getFirebaseMessagingSafe = async () => {
  try {
    if (await isSupported()) {
      return getMessaging(app);
    }
  } catch {
    return null;
  }
  return null;
};

export default app;
