import { useState, useEffect } from 'react';
// FIX: onAuthStateChanged is now a method on the auth object from firebaseService, so the direct import is removed.
import { auth, type User } from '../services/firebaseService';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // FIX: Use the v8-compat onAuthStateChanged method from the auth instance.
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                const isEmailPasswordUser = user.providerData.some(p => p.providerId === 'password');
                // The main app should only be accessible to verified users
                if (isEmailPasswordUser && !user.emailVerified) {
                    setUser(null);
                } else {
                    setUser(user);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { user, loading };
};