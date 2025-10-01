'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  UserCredential 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; // Import from the new config file

interface UserData {
  height?: number;
  weight?: number;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  updateUserData: (data: UserData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          // Create a new user document if it doesn't exist
          const initialData = { height: 0, weight: 0 };
          await setDoc(userRef, initialData);
          setUserData(initialData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const updateUserData = async (data: UserData) => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, data, { merge: true });
      setUserData(prevData => ({ ...prevData, ...data }));
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};