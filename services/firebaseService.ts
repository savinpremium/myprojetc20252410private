
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

const firebaseConfig = {
  apiKey: "AIzaSyBll12h2t9UU_5fqjk2VopsG4OkAKdWKHU",
  authDomain: "infinity---ai-2026.firebaseapp.com",
  projectId: "infinity---ai-2026",
  storageBucket: "infinity---ai-2026.firebasestorage.app",
  messagingSenderId: "1081153014110",
  appId: "1:1081153014110:web:678fd373fdf6be184be7cf",
  measurementId: "G-6XN2H9N5XW"
};

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
// Note: importing 'firebase/auth' registers the component. Calling getAuth(app) uses it.
const authInstance = getAuth(app);

// Use local persistence for better user experience in supported environments
setPersistence(authInstance, browserLocalPersistence).catch((err) => {
    console.warn("Firebase Auth: Local persistence not supported, falling back.", err);
});

export const auth = authInstance;

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const handleSignOut = () => signOut(auth);

export { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification 
};
