
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, type User } from '../services/firebaseService';

// Global state to sync across all hook instances
let globalUser: User | null = null;
let globalLoading = true;
const listeners = new Set<(state: { user: User | null; loading: boolean }) => void>();

const updateGlobalState = (user: User | null, loading: boolean) => {
    globalUser = user;
    globalLoading = loading;
    listeners.forEach(l => l({ user, loading }));
};

export const useAuth = () => {
    const [state, setState] = useState({ user: globalUser, loading: globalLoading });

    useEffect(() => {
        const listener = (newState: { user: User | null; loading: boolean }) => setState(newState);
        listeners.add(listener);

        // Check for Guest Mode immediately on mount
        const guestFlag = localStorage.getItem('infinity_guest_active');
        if (guestFlag === 'true') {
            updateGlobalState({
                uid: 'guest-bypass-2026',
                email: 'guest@infinity.ai',
                displayName: 'Guest Operative',
                photoURL: null,
                emailVerified: true
            } as any, false);
        }

        // Initialize Firebase listener only once
        if (listeners.size === 1 && !guestFlag) {
            if (auth && typeof auth.onAuthStateChanged === 'function') {
                try {
                    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                        if (firebaseUser) {
                            const isEmailPasswordUser = firebaseUser.providerData.some(p => p.providerId === 'password');
                            if (isEmailPasswordUser && !firebaseUser.emailVerified) {
                                updateGlobalState(null, false);
                            } else {
                                updateGlobalState(firebaseUser as any, false);
                            }
                        } else {
                            updateGlobalState(null, false);
                        }
                    }, (error) => {
                        console.warn("Firebase Auth blocked/restricted:", error.message);
                        updateGlobalState(null, false);
                    });
                    
                    // Safety timeout: If Firebase doesn't respond in 3 seconds, stop loading
                    // to allow the user to see the Login/Override screen.
                    setTimeout(() => {
                        if (globalLoading) updateGlobalState(globalUser, false);
                    }, 3000);

                } catch (e) {
                    console.warn("Auth initialization failed:", e);
                    updateGlobalState(null, false);
                }
            } else {
                updateGlobalState(null, false);
            }
        } else if (guestFlag) {
             // If we are in guest mode, we are definitely not loading
             setState({ user: globalUser, loading: false });
        }

        return () => {
            listeners.delete(listener);
        };
    }, []);

    const loginAsGuest = () => {
        console.log("System Override Initiated...");
        localStorage.setItem('infinity_guest_active', 'true');
        updateGlobalState({
            uid: 'guest-bypass-2026',
            email: 'guest@infinity.ai',
            displayName: 'Guest Operative',
            photoURL: null,
            emailVerified: true
        } as any, false);
    };

    const clearGuestMode = () => {
        localStorage.removeItem('infinity_guest_active');
        updateGlobalState(null, false);
    };

    return { user: state.user, loading: state.loading, loginAsGuest, clearGuestMode };
};
