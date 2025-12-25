
import React, { useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { RayBackground } from './RayBackground';
import { GoogleIcon, CodeIcon, ImageIcon, ChatIcon, WarningIcon } from './Icons';
import { 
    signInWithGoogle, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    auth
} from '../services/firebaseService';

export const LoginView: FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [verificationSent, setVerificationSent] = useState(false);
    const [formKey, setFormKey] = useState(0); 

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error("Auth Error:", err);
            
            const isToolkitError = 
                err.message?.toLowerCase().includes('identitytoolkit.googleapis.com') || 
                err.message?.toLowerCase().includes('has not been used') ||
                err.code === 'auth/api-key-not-valid';

            if (isToolkitError) {
                setError(
                    <div className="flex flex-col gap-3 p-2">
                        <div className="flex items-center gap-2 text-red-400 font-bold">
                            <WarningIcon className="w-5 h-5" />
                            <span>Configuration Required</span>
                        </div>
                        <p className="text-xs text-gray-300">The Identity Toolkit API is not enabled for project 671917188786. This is required for authentication to function.</p>
                        <a 
                            href="https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=671917188786"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-600/20 text-center uppercase tracking-wider"
                        >
                            Fix in Google Cloud Console
                        </a>
                        <p className="text-[10px] text-gray-500 italic">Note: It may take a few minutes for changes to propagate after enabling.</p>
                    </div>
                );
            } else if (err.code === 'auth/operation-not-supported-in-this-environment') {
                setError("Google Sign-In is not supported in this environment. Please use Email/Password.");
            } else {
                setError(err.message || "An error occurred during authentication.");
            }
        }
    };

    const handleEmailSignUp = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError(null);
        setVerificationSent(false);
        if(password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await sendEmailVerification(userCredential.user);
            }
            setVerificationSent(true);
            switchMode('signin');
        } catch (err: any) {
             setError(err.message || "Failed to sign up.");
        }
    };

    const handleEmailSignIn = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
             if(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError("Invalid email or password.");
             } else {
                setError(err.message || "Failed to sign in.");
             }
        }
    };
    
    const switchMode = (newMode: 'signin' | 'signup') => {
        setMode(newMode);
        setError(null);
        setVerificationSent(false);
        setFormKey(prev => prev + 1);
    };

    const Feature: FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-900/50 border border-white/10 rounded-lg flex items-center justify-center text-blue-400">{icon}</div>
            <div>
                <h3 className="font-semibold text-white text-lg">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="w-screen h-screen bg-black text-gray-200 flex items-center justify-center p-4 overflow-hidden">
            <RayBackground />
            <div className="auth-panel-enhanced w-full max-w-6xl rounded-3xl grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl shadow-blue-500/10">
                <div className="p-8 md:p-12 bg-black/30 flex-col justify-between hidden md:flex">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            <span className="text-blue-400">InfinityAI</span> Studio
                        </h1>
                        <p className="text-gray-300 mb-10 text-base">
                            Proprietary intelligence suite by Infinity Team. v3.0 Fusion Edition. Designed for the 2026 update.
                        </p>
                        <div className="space-y-8">
                            <Feature icon={<ChatIcon className="w-7 h-7"/>} title="Proprietary AI" description="Infinity Reasoning engine built for the next generation of tasks." />
                            <Feature icon={<ImageIcon className="w-7 h-7"/>} title="Smart Visuals" description="High-performance image generation system developed in-house." />
                            <Feature icon={<CodeIcon className="w-7 h-7"/>} title="Expert Coding" description="Advanced software development tools built into the platform." />
                        </div>
                    </div>
                    <div className="mt-auto pt-8">
                        <p className="text-xs text-gray-500 text-left">
                            © 2026 InfinityAI. Developed by Infinity Team.
                        </p>
                    </div>
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center bg-gray-900/40">
                    <div key={formKey} className="animate-form-fade-in">
                        <h2 className="text-3xl font-bold text-center text-white mb-2">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
                        <p className="text-gray-400 text-center mb-8">{mode === 'signin' ? 'Log in to your workspace.' : 'Sign up to start creating.'}</p>
                        
                        {error && (
                          <div className="flex flex-col items-center justify-center gap-2 text-red-300 font-medium mb-4 p-4 w-full bg-red-900/40 rounded-xl text-center text-sm">
                                {error}
                          </div>
                        )}

                        {verificationSent && (
                            <div className="bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-sm mb-6 text-center">
                                A verification email has been sent. Please check your inbox.
                            </div>
                        )}

                        <form className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-gray-900/50 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-900/50 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>

                            <button 
                                onClick={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest mt-2"
                            >
                                {mode === 'signin' ? 'Access Workspace' : 'Create Intelligence Profile'}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0f1115] px-4 text-gray-500 font-bold tracking-widest">Digital ID Proxy</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleGoogleSignIn}
                            className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 uppercase tracking-widest"
                        >
                            <GoogleIcon />
                            Google Auth Core
                        </button>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                                className="ml-2 text-blue-400 font-bold hover:underline"
                            >
                                {mode === 'signin' ? 'Request Access' : 'Sign In Now'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                .auth-panel-enhanced {
                    background: rgba(15, 17, 21, 0.7);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                @keyframes form-fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-form-fade-in {
                    animation: form-fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
