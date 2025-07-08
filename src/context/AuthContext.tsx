'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  // ---- ADD THESE TWO ----
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
// ---- ADD THESE TWO ----
import { initializeApp, getApps } from 'firebase/app';

// Your Firebase config is already here, which is great.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Your app initialization is also here. Perfect.
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebase_app);

// Update the context type to include the new function
export const AuthContext = createContext<{
  user: User | null;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
  logOut: () => Promise<any>;
  signInWithGoogle: () => Promise<any>; // ---- ADD THIS ----
}>({
  user: null,
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  logOut: () => Promise.resolve(),
  signInWithGoogle: () => Promise.resolve(), // ---- ADD THIS ----
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const logOut = () => {
    return signOut(auth);
  };

  // ---- DEFINE THE GOOGLE SIGN-IN FUNCTION ----
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    // ---- ADD signInWithGoogle to the provider value ----
    <AuthContext.Provider value={{ user, signIn, signUp, logOut, signInWithGoogle }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};