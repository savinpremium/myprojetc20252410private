import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, type User } from '../services/firebaseService';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Support for "System Override" / Guest Mode
        const guestFlag = localStorage.getItem('infinity_guest_active');
        if (guestFlag === 'true') {
            setUser({
                uid: 'guest-bypass-2026',
                email: 'guest@infinity.ai',
                displayName: 'Guest Operative',
                photoURL: null,
                emailVerified: true
            } as any);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // If it's a normal user, check verification
                const isEmailPasswordUser = firebaseUser.providerData.some(p => p.providerId === 'password');
                if (isEmailPasswordUser && !firebaseUser.emailVerified) {
                    setUser(null);
                } else {
                    setUser(firebaseUser as any);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Auth state listener error (blocked?):", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginAsGuest = () => {
        localStorage.setItem('infinity_guest_active', 'true');
        setUser({
            uid: 'guest-bypass-2026',
            email: 'guest@infinity.ai',
            displayName: 'Guest Operative',
            photoURL: null,
            emailVerified: true
        } as any);
    };

    const clearGuestMode = () => {
        localStorage.removeItem('infinity_guest_active');
        setUser(null);
    };

    return { user, loading, loginAsGuest, clearGuestMode };
};