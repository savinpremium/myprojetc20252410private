import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, type User } from '../services/firebaseService';

// Global state to sync across multiple hook instances
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

        // Initialize Firebase listener only once
        if (listeners.size === 1) {
            const guestFlag = localStorage.getItem('infinity_guest_active');
            if (guestFlag === 'true') {
                updateGlobalState({
                    uid: 'guest-bypass-2026',
                    email: 'guest@infinity.ai',
                    displayName: 'Guest Operative',
                    photoURL: null,
                    emailVerified: true
                } as any, false);
            } else if (auth && typeof auth.onAuthStateChanged === 'function') {
                try {
                    onAuthStateChanged(auth, (firebaseUser) => {
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
                        console.warn("Auth restriction detected:", error);
                        updateGlobalState(null, false);
                    });
                } catch (e) {
                    console.warn("Auth initialization failed:", e);
                    updateGlobalState(null, false);
                }
            } else {
                updateGlobalState(null, false);
            }
        }

        return () => {
            listeners.delete(listener);
        };
    }, []);

    const loginAsGuest = () => {
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