
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getAuth,
    setPersistence,
    browserLocalPersistence, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    type User as FirebaseUser
} from "firebase/auth";

export type User = FirebaseUser;

/**
 * Firebase Project Configuration
 * Project ID: infinity---ai-2026
 * Note: If you see 'Identity Toolkit API' errors, the API must be enabled in the Google Cloud Console.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBll12h2t9UU_5fqjk2VopsG4OkAKdWKHU",
  authDomain: "infinity---ai-2026.firebaseapp.com",
  projectId: "infinity---ai-2026",
  storageBucket: "infinity---ai-2026.firebasestorage.app",
  messagingSenderId: "671917188786",
  appId: "1:671917188786:web:678fd373fdf6be184be7cf",
  measurementId: "G-6XN2H9N5XW"
};

// Singleton initialization pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth explicitly with the app instance
export const auth = getAuth(app);

// Enable local persistence for better user session management
setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Firebase Auth: Local persistence not supported.", err);
});

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const handleSignOut = () => signOut(auth);

export { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification 
};
