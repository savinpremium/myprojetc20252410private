
// FIX: Refactor to use Firebase v9 compat libraries to fix module export errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// Re-export the User type for other components. `firebase.User` is the correct type for the compat library.
export type User = firebase.User;

// Your web app's Firebase configuration - Updated for 2026 Release
const firebaseConfig = {
  apiKey: "AIzaSyBsSZ7G0GXFxC_Sbv4uK-1QIKzPn6RaVxI",
  authDomain: "infinity---ai-2026.firebaseapp.com",
  projectId: "infinity---ai-2026",
  storageBucket: "infinity---ai-2026.firebasestorage.app",
  messagingSenderId: "1081153014110",
  appId: "1:1081153014110:web:678fd373fdf6be184be7cf",
  measurementId: "G-6XN2H9N5XW"
};

// Initialize Firebase using compat style, checking if it's already initialized.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get auth instance and set persistence
export const auth = firebase.auth();
// FIX: Changed persistence to `NONE` to resolve "operation-not-supported-in-this-environment" error.
// This error occurs in environments where localStorage is disabled or restricted.
// `NONE` persistence stores auth state in memory for the session only.
auth.setPersistence(firebase.auth.Auth.Persistence.NONE);

// Configure Google provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Export auth functions
export const signInWithGoogle = () => auth.signInWithPopup(googleProvider);
export const handleSignOut = () => auth.signOut();
