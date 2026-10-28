import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as fbUpdateProfile,
  deleteUser as fbDeleteUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local fallback user for immediate offline/demo testing if Firebase keys are not added yet
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

  useEffect(() => {
    if (!isFirebaseReady) {
      // In offline/demo mode, provide the active demo user session so the developer can navigate immediately
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
            console.warn('Firestore user fetch note:', e);
          }
        }

        setUser({
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: profileName,
          createdAt,
          isEmailVerified: fbUser.emailVerified,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseReady]);

  const login = async (email: string, pass: string) => {
    if (!isFirebaseReady) {
      if (email && pass.length >= 6) {
        setUser({
          ...DEMO_USER,
          email,
          displayName: email.split('@')[0] || 'Demo Designer',
        });
        return { success: true };
      }
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    try {
      await signInWithEmailAndPassword(auth!, email.trim(), pass);
      return { success: true };
    } catch (err: any) {
      let message = 'Failed to sign in. Please verify your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed attempts. Try again later.';
      }
      return { success: false, error: message };
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    if (!isFirebaseReady) {
      setUser({
        uid: `demo-${Date.now()}`,
        email,
        displayName: name.trim() || 'Demo Designer',
        createdAt: new Date().toISOString(),
        isEmailVerified: true,
      });
      return { success: true };
    }

    try {
      const res = await createUserWithEmailAndPassword(auth!, email.trim(), pass);
      await fbUpdateProfile(res.user, { displayName: name.trim() });
      if (db) {
        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          email: res.user.email,
          displayName: name.trim(),
          createdAt: new Date().toISOString(),
        });
      }
      try {
        await sendEmailVerification(res.user);
      } catch (e) {
        console.warn('Email verification send note:', e);
      }
      return { success: true };
    } catch (err: any) {
      let message = 'Could not create account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    if (isFirebaseReady && auth) {
      await fbSignOut(auth);
    }
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    if (!isFirebaseReady) {
      return { success: true };
    }
    try {
      await sendPasswordResetEmail(auth!, email.trim());
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Could not send reset email' };
    }
  };

  const resendVerification = async () => {
    if (!isFirebaseReady || !auth?.currentUser) {
      return { success: true };
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Could not resend email' };
    }
  };

  const deleteAccount = async () => {
    if (!isFirebaseReady || !auth?.currentUser) {
      setUser(null);
      return { success: true };
    }
    try {
      const current = auth.currentUser;
      if (db) {
        await deleteDoc(doc(db, 'users', current.uid));
      }
      await fbDeleteUser(current);
      setUser(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Requires recent login before account deletion' };
    }
  };

  const refreshUser = async () => {
    if (isFirebaseReady && auth?.currentUser) {
      await auth.currentUser.reload();
      const current = auth.currentUser;
      setUser(prev => prev ? { ...prev, isEmailVerified: current.emailVerified } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseReady,
        login,
        signup,
        logout,
        forgotPassword,
        resendVerification,
        deleteAccount,
        refreshUser,
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
