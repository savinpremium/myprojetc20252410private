
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, type User } from '../services/firebaseService';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Modular onAuthStateChanged takes the auth instance as the first argument
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const isEmailPasswordUser = firebaseUser.providerData.some(p => p.providerId === 'password');
                // The main app should only be accessible to verified users if using email/password
                if (isEmailPasswordUser && !firebaseUser.emailVerified) {
                    setUser(null);
                } else {
                    setUser(firebaseUser);
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
