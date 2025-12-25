import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    setPersistence, 
    browserSessionPersistence,
    createUserWithEmailAndPassword as firebaseCreateUser,
    signInWithEmailAndPassword as firebaseSignIn,
    sendEmailVerification as firebaseVerify
} from "firebase/auth";

// Re-export specific User type
export type User = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
};

const firebaseConfig = {
  apiKey: "AIzaSyBsSZ7G0GXFxC_Sbv4uK-1QIKzPn6RaVxI",
  authDomain: "infinity---ai-2026.firebaseapp.com",
  projectId: "infinity---ai-2026",
  storageBucket: "infinity---ai-2026.firebasestorage.app",
  messagingSenderId: "1081153014110",
  appId: "1:1081153014110:web:678fd373fdf6be184be7cf",
  measurementId: "G-6XN2H9N5XW"
};

// Initialize Firebase modularly
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use session persistence to avoid issues with blocked cookies/localstorage in some frames
setPersistence(auth, browserSessionPersistence).catch(err => console.warn("Persistence error:", err));

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const handleSignOut = () => signOut(auth);
export const createUserWithEmailAndPassword = firebaseCreateUser;
export const signInWithEmailAndPassword = firebaseSignIn;
export const sendEmailVerification = firebaseVerify;
