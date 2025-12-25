
import React, { useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { RayBackground } from './RayBackground';
import { GoogleIcon, CodeIcon, ImageIcon, ChatIcon, WarningIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';
import { 
    auth,
    signInWithGoogle, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from '../services/firebaseService';

export const LoginView: FC = () => {
    const { loginAsGuest } = useAuth();
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
            console.error("Google Auth Error:", err);
            
            const isBlockedError = 
                err.message?.toLowerCase().includes('identitytoolkit') || 
                err.message?.toLowerCase().includes('blocked') ||
                err.code === 'auth/api-key-not-valid' ||
                err.code === 'auth/internal-error';

            if (isBlockedError) {
                setError(
                    <div className="flex flex-col gap-3 p-2">
                        <div className="flex items-center justify-center gap-2 text-red-400 font-bold">
                            <WarningIcon className="w-5 h-5" />
                            <span>Cloud Services Restricted</span>
                        </div>
                        <p className="text-[11px] leading-tight text-gray-400">
                            The Identity Toolkit is currently blocked in your Firebase project configuration. Use the override below.
                        </p>
                        <div className="pt-2">
                            <button 
                                onClick={() => loginAsGuest()}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 uppercase tracking-[0.2em] text-[11px] ring-2 ring-indigo-400/20"
                            >
                                Force System Override (Bypass Login)
                            </button>
                        </div>
                    </div>
                );
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
            setError("Security Threshold: Password must be at least 6 characters.");
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
             handleManualError(err);
        }
    };

    const handleEmailSignIn = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
             handleManualError(err);
        }
    };

    const handleManualError = (err: any) => {
        if(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
            setError("Access Denied: Invalid email or password.");
        } else if (err.message?.toLowerCase().includes('identitytoolkit') || err.message?.toLowerCase().includes('blocked')) {
            setError(
                <div className="flex flex-col gap-2 p-1">
                    <p className="text-red-400 font-bold">API Initialization Blocked</p>
                    <button onClick={() => loginAsGuest()} className="text-blue-400 underline font-black uppercase text-[10px] tracking-widest">Use Guest Override</button>
                </div>
            );
        } else {
            setError(err.message || "Failed to sign in.");
        }
    }
    
    const switchMode = (newMode: 'signin' | 'signup') => {
        setMode(newMode);
        setError(null);
        setVerificationSent(false);
        setFormKey(prev => prev + 1);
    };

    const Feature: FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-900/50 border border-white/10 rounded-xl flex items-center justify-center text-blue-400">{icon}</div>
            <div>
                <h3 className="font-bold text-white text-lg tracking-tight">{title}</h3>
                <p className="text-sm text-gray-400 leading-snug">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="w-screen h-screen bg-black text-gray-200 flex items-center justify-center p-4 overflow-hidden font-inter">
            <RayBackground />
            <div className="auth-panel-enhanced w-full max-w-6xl rounded-[3rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/10">
                {/* Left Side: Branding */}
                <div className="p-8 md:p-12 bg-black/40 flex flex-col justify-between hidden md:flex border-r border-white/5">
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase">
                                <span className="text-blue-400">InfinityAI</span>
                            </h1>
                            <p className="text-gray-400 font-medium text-lg opacity-80">
                                Proprietary Intelligence Suite. v3.0 Fusion.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <Feature icon={<ChatIcon className="w-7 h-7"/>} title="Neural Dialog" description="Gemini 3 Flash reasoning engine for complex instruction following." />
                            <Feature icon={<ImageIcon className="w-7 h-7"/>} title="Pixel Forge" description="Masterpiece visual generation system powered by Imagen 4." />
                            <Feature icon={<CodeIcon className="w-7 h-7"/>} title="Logic Canvas" description="Expert software development and code synthesis interface." />
                        </div>
                    </div>
                    <div className="mt-auto pt-8 border-t border-white/5">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">
                            © 2026 Infinity Systems • Non-Attributed AI
                        </p>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center bg-gray-900/40 backdrop-blur-3xl relative">
                    <div key={formKey} className="animate-form-fade-in max-w-md mx-auto w-full">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
                                {mode === 'signin' ? 'Verify Identity' : 'Initialize Profile'}
                            </h2>
                            <p className="text-gray-400 font-medium">
                                {mode === 'signin' ? 'Unlock your neural workspace.' : 'Register for the 2026 intelligence tier.'}
                            </p>
                        </div>
                        
                        {error && (
                          <div className="mb-6 p-4 w-full bg-red-900/30 border border-red-500/30 rounded-2xl text-center text-sm font-medium">
                                {error}
                          </div>
                        )}

                        {verificationSent && (
                            <div className="mb-6 p-4 w-full bg-emerald-900/20 border border-emerald-500/20 rounded-2xl text-center text-sm font-bold text-emerald-300">
                                Verification core initiated. Check your secure inbox.
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleSignIn}
                                className="w-full flex items-center justify-center gap-3 bg-white text-black font-black rounded-2xl px-6 py-4 text-xs glowing-btn uppercase tracking-widest transition-transform active:scale-95"
                            >
                                <GoogleIcon className="w-5 h-5" />
                                Google Auth Protocol
                            </button>
                            
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-white/5"></div>
                                <span className="flex-shrink mx-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Internal Proxy</span>
                                <div className="flex-grow border-t border-white/5"></div>
                            </div>
                            
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-1">
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm" 
                                        placeholder="Terminal ID (Email)" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input 
                                        type="password" 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)} 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm" 
                                        placeholder="Access Key (Password)" 
                                    />
                                </div>

                                <button 
                                    onClick={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} 
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs mt-2"
                                >
                                    {mode === 'signin' ? 'Authorize Session' : 'Initialize Profile'}
                                </button>
                            </form>

                            <button 
                                onClick={() => loginAsGuest()}
                                className="w-full bg-white/5 border border-dashed border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/30 font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-[11px] mt-4"
                            >
                                EXECUTE EMERGENCY SYSTEM OVERRIDE
                            </button>
                        </div>

                        <p className="text-center text-xs font-bold text-gray-500 mt-8 uppercase tracking-widest">
                            {mode === 'signin' ? "New operative?" : "Existing operative?"}
                            <button 
                                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')} 
                                className="font-black text-blue-400 hover:text-blue-300 ml-2 transition-colors"
                            >
                                {mode === 'signin' ? 'Request Access' : 'Return to Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                .auth-panel-enhanced {
                    background: rgba(10, 10, 10, 0.7);
                    backdrop-filter: blur(40px);
                }
                
                @keyframes form-fade-in {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-form-fade-in {
                    animation: form-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};
