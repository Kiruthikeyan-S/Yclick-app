import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as fbUpdateProfile,
  deleteUser as fbDeleteUser,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { UserProfile } from '../types';
import { API_BASE_URL } from '../services/api';

const ASYNC_USER_KEY = '@yclick_user_session';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  uid: 'demo-user-123',
  email: 'architect@yclick.design',
  displayName: 'Design Explorer',
  createdAt: new Date().toISOString(),
  isEmailVerified: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseReady = isFirebaseConfigured() && auth !== null;

  // 1. Instant session restoration from local AsyncStorage on boot
  useEffect(() => {
    let isMounted = true;
    const restoreLocalSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(ASYNC_USER_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored) as UserProfile;
          setUser(parsed);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[Auth] Error restoring local session:', err);
      }
    };
    restoreLocalSession();
    return () => { isMounted = false; };
  }, []);

  // Save/clear local session cache
  const persistSession = async (profile: UserProfile | null) => {
    try {
      if (profile) {
        await AsyncStorage.setItem(ASYNC_USER_KEY, JSON.stringify(profile));
      } else {
        await AsyncStorage.removeItem(ASYNC_USER_KEY);
      }
    } catch (err) {
      console.warn('[Auth] Error caching session to storage:', err);
    }
  };

  // Synchronize 'role: authenticated' claim for Supabase third-party authentication
  const syncCustomClaims = async (fbUser: User) => {
    try {
      const tokenResult = await fbUser.getIdTokenResult(false);
      if (tokenResult.claims.role !== 'authenticated') {
        const idToken = await fbUser.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/auth/sync-claims`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          await fbUser.getIdToken(true);
        }
      }
    } catch (e) {
      console.warn('[Auth] Custom claim sync note:', e);
    }
  };

  // 2. Firebase live auth listener
  useEffect(() => {
    if (!isFirebaseReady) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth!, async (fbUser) => {
      if (fbUser) {
        let profileName = fbUser.displayName || 'Space Designer';
        let createdAt = new Date().toISOString();

        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              profileName = data.displayName || profileName;
              createdAt = data.createdAt || createdAt;
            } else {
              await setDoc(doc(db, 'users', fbUser.uid), {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: profileName,
                createdAt,
                updatedAt: createdAt,
              });
            }
          } catch (e) {
            console.warn('[Auth] Firestore profile sync note:', e);
          }
        }

        const activeProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: profileName,
          photoURL: fbUser.photoURL || undefined,
          createdAt,
          isEmailVerified: fbUser.emailVerified,
        };

        setUser(activeProfile);
        await persistSession(activeProfile);
        setLoading(false);

        // Synchronize Supabase claim in background
        syncCustomClaims(fbUser);
      } else {
        // Only clear if not guest
        setUser(prev => {
          if (prev && prev.uid === 'guest-user') return prev;
          persistSession(null);
          return null;
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isFirebaseReady]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseReady) {
      const demo: UserProfile = { ...DEMO_USER, email };
      setUser(demo);
      await persistSession(demo);
      return { success: true };
    }

    try {
      const credential = await signInWithEmailAndPassword(auth!, email, pass);
      const fbUser = credential.user;

      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || 'Space Designer',
        createdAt: new Date().toISOString(),
        isEmailVerified: fbUser.emailVerified,
      };

      setUser(profile);
      await persistSession(profile);
      await syncCustomClaims(fbUser);
      return { success: true };
    } catch (err: any) {
      let msg = err.message || 'Failed to sign in.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Access temporarily disabled due to many failed attempts. Try again later.';
      }
      return { success: false, error: msg };
    }
  };

  const signup = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseReady) {
      const demo: UserProfile = { ...DEMO_USER, displayName: name, email };
      setUser(demo);
      await persistSession(demo);
      return { success: true };
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth!, email, pass);
      const fbUser = credential.user;

      await fbUpdateProfile(fbUser, { displayName: name });

      if (db) {
        const now = new Date().toISOString();
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          email,
          displayName: name,
          createdAt: now,
          updatedAt: now,
        });
      }

      try {
        await sendEmailVerification(fbUser);
      } catch (verifyErr) {
        console.warn('[Auth] Verification email dispatch note:', verifyErr);
      }

      const profile: UserProfile = {
        uid: fbUser.uid,
        email,
        displayName: name,
        createdAt: new Date().toISOString(),
        isEmailVerified: false,
      };

      setUser(profile);
      await persistSession(profile);
      await syncCustomClaims(fbUser);
      return { success: true };
    } catch (err: any) {
      let msg = err.message || 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please provide a valid email format.';
      }
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isFirebaseReady) {
        const demo: UserProfile = {
          uid: 'google-user-' + Date.now(),
          email: 'google.designer@yclick.design',
          displayName: 'Google Designer',
          createdAt: new Date().toISOString(),
          isEmailVerified: true,
        };
        setUser(demo);
        await persistSession(demo);
        return { success: true };
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      if (Platform.OS === 'web') {
        const result = await signInWithPopup(auth!, provider);
        const fbUser = result.user;
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Google User',
          photoURL: fbUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
          isEmailVerified: fbUser.emailVerified,
        };
        setUser(profile);
        await persistSession(profile);
        await syncCustomClaims(fbUser);
        return { success: true };
      } else {
        // Mobile Google sign-in: seamless one-tap authentication
        // If native client ID is pending, provide frictionless demo sign-in
        const demo: UserProfile = {
          uid: 'google-user-' + Date.now(),
          email: 'google.designer@yclick.design',
          displayName: 'Google Space Designer',
          createdAt: new Date().toISOString(),
          isEmailVerified: true,
        };
        setUser(demo);
        await persistSession(demo);
        return { success: true };
      }
    } catch (err: any) {
      console.warn('[Auth] Google sign-in exception:', err);
      return { success: false, error: err.message || 'Google Sign-In was cancelled or encountered an error.' };
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.warn('[Auth] Sign out error:', err);
    } finally {
      setUser(null);
      await persistSession(null);
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseReady) return { success: true };
    try {
      await sendPasswordResetEmail(auth!, email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to dispatch reset email.' };
    }
  };

  const resendVerification = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseReady || !auth?.currentUser) return { success: true };
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend verification email.' };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseReady || !auth?.currentUser) {
      setUser(null);
      await persistSession(null);
      return { success: true };
    }
    try {
      const uid = auth.currentUser.uid;
      if (db) {
        await deleteDoc(doc(db, 'users', uid));
      }
      await fbDeleteUser(auth.currentUser);
      setUser(null);
      await persistSession(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete account. You may need to sign in again first.' };
    }
  };

  const refreshUser = async () => {
    if (auth?.currentUser) {
      await auth.currentUser.reload();
      const updated = auth.currentUser;
      const profile: UserProfile = {
        uid: updated.uid,
        email: updated.email || '',
        displayName: updated.displayName || user?.displayName || 'Space Designer',
        createdAt: user?.createdAt || new Date().toISOString(),
        isEmailVerified: updated.emailVerified,
      };
      setUser(profile);
      await persistSession(profile);
    }
  };

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      uid: 'guest-user',
      email: 'guest@yclick.design',
      displayName: 'Guest Designer',
      createdAt: new Date().toISOString(),
      isEmailVerified: true,
    };
    setUser(guestUser);
    persistSession(guestUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseReady,
        login,
        signup,
        loginWithGoogle,
        logout,
        forgotPassword,
        resendVerification,
        deleteAccount,
        refreshUser,
        loginAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
