
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
 * Temporary Development Configuration
 * NOTE: The error "Identity Toolkit API has not been used" indicates that the 
 * 'Identity Toolkit API' and 'Firebase Authentication' are disabled in your project.
 * Please visit: https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=671917188786
 * and click "ENABLE" to resolve this issue.
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

// 1. Initialize Firebase Core
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth - calling getAuth(app) triggers the registration check
// We export the initialized instance to be used throughout the app
export const auth = getAuth(app);

// 3. Configure Persistence
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
