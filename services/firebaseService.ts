
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getAuth,
    setPersistence,
    inMemoryPersistence, 
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
  apiKey: "AIzaSyBsSZ7G0GXFxC_Sbv4uK-1QIKzPn6RaVxI",
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
// The registration of the 'auth' component happens when 'firebase/auth' is imported and getAuth is called.
export const auth = getAuth(app);

// Apply inMemoryPersistence to handle environments where localStorage/sessionStorage are restricted.
setPersistence(auth, inMemoryPersistence).catch((err) => {
    console.warn("Firebase Auth: Could not set in-memory persistence", err);
});

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const handleSignOut = () => signOut(auth);

export { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification 
};
