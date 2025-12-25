
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

let app;
let auth: any;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Attempt persistence but don't crash if it fails
    setPersistence(auth, browserSessionPersistence).catch(() => {});
} catch (e) {
    console.warn("Firebase failed to initialize. System will default to Override Mode.", e);
    // Create a mock auth object that does nothing to prevent downstream crashes
    auth = {
        onAuthStateChanged: (cb: any) => () => {},
        currentUser: null,
    };
}

export { auth };

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
    if (!auth.app) throw new Error("Auth service unavailable. Use System Override.");
    return signInWithPopup(auth, googleProvider);
};

export const handleSignOut = () => {
    if (auth.signOut) return signOut(auth);
    return Promise.resolve();
};

export const createUserWithEmailAndPassword = firebaseCreateUser;
export const signInWithEmailAndPassword = firebaseSignIn;
export const sendEmailVerification = firebaseVerify;
