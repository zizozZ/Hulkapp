import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { auth, db, getFirebaseMessagingSafe, isFirebaseConfigured } from '../config/firebase';
import { AppUser } from '../types';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  profile: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      unsubscribeProfile = onSnapshot(
        userRef,
        async (snap) => {
          if (!snap.exists()) {
            setError('لم يتم العثور على ملف المستخدم في قاعدة البيانات.');
            setProfile(null);
            setLoading(false);
            return;
          }

          const data = { id: snap.id, ...snap.data() } as AppUser;
          if (data.status === 'suspended') {
            setError('تم إيقاف هذا الحساب مؤقتاً من قبل الإدارة. تواصل مع الدعم.');
            await signOut(auth);
            setProfile(null);
            setLoading(false);
            return;
          }

          setError(null);
          setProfile(data);
          setLoading(false);

          try {
            const messaging = await getFirebaseMessagingSafe();
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            if (messaging && vapidKey && Notification.permission === 'granted') {
              const token = await getToken(messaging, { vapidKey });
              if (token && token !== data.fcmToken) {
                await updateDoc(userRef, { fcmToken: token });
              }
            }
          } catch {
            // Optional FCM token registration
          }
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
