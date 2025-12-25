
import React, { useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { RayBackground } from './RayBackground';
import { GoogleIcon, CodeIcon, ImageIcon, ChatIcon, WarningIcon } from './Icons';
import { 
    auth,
    signInWithGoogle, 
} from '../services/firebaseService';

export const LoginView: FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [verificationSent, setVerificationSent] = useState(false);
    const [formKey, setFormKey] = useState(0); // Used to re-trigger animation

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error("Google Auth Error:", err);
            setError(err.message || "An error occurred during Google sign-in.");
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
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            if (userCredential.user) {
                await userCredential.user.sendEmailVerification();
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
            await auth.signInWithEmailAndPassword(email, password);
        } catch (err: any) {
             if(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
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
        setFormKey(prev => prev + 1); // Change key to re-mount and animate form
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
                {/* Left Side: "About Us" */}
                <div className="p-8 md:p-12 bg-black/30 flex-col justify-between hidden md:flex">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            <span className="text-blue-400">InfinityAI</span> Studio
                        </h1>
                        <p className="text-gray-300 mb-10 text-base">
                            The Super AI by the Infinity Team. Your all-in-one creativity suite, designed to bring your ideas to life. We are a passionate team dedicated to building intelligent systems that empower humanity.
                        </p>
                        <div className="space-y-8">
                            <Feature icon={<ChatIcon className="w-7 h-7"/>} title="Intelligent Chat" description="Engage in dynamic conversations, get instant answers, and explore complex topics." />
                            <Feature icon={<ImageIcon className="w-7 h-7"/>} title="AI Image Generation" description="Transform your text prompts into stunning, high-quality visuals in seconds." />
                            <Feature icon={<CodeIcon className="w-7 h-7"/>} title="Code Canvas" description="Generate clean, efficient, and production-ready code for any programming task." />
                        </div>
                    </div>
                    <div className="mt-auto pt-8">
                        <p className="text-xs text-gray-500 text-left">
                            © 2024 InfinityAI by Infinity Team. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Right Side: Auth */}
                <div className="p-8 md:p-12 flex flex-col justify-center bg-gray-900/40">
                    <div key={formKey} className="animate-form-fade-in">
                        <h2 className="text-3xl font-bold text-center text-white mb-2">{mode === 'signin' ? 'Welcome Back' : 'Create an Account'}</h2>
                        <p className="text-gray-400 text-center mb-8">{mode === 'signin' ? 'Sign in to continue your journey.' : 'Join us to start creating.'}</p>
                        
                        {error && (
                          <div className="flex items-center justify-center gap-2 text-red-300 font-medium mb-4 p-3 w-full bg-red-900/40 rounded-lg text-center text-sm">
                            <WarningIcon className="w-5 h-5 flex-shrink-0"/>
                            <span>{error}</span>
                          </div>
                        )}
                        {verificationSent && <div className="text-green-300 font-medium mb-4 p-3 w-full bg-green-900/40 rounded-lg text-center text-sm">Verification email sent! Please check your inbox.</div>}

                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 bg-gray-700/80 font-bold rounded-lg px-6 py-3 text-lg glowing-btn border border-white/10 hover:border-blue-500"
                        >
                            <GoogleIcon />
                            Sign In with Google
                        </button>
                        
                        <div className="flex items-center my-6">
                            <hr className="flex-grow border-gray-600"/>
                            <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
                            <hr className="flex-grow border-gray-600"/>
                        </div>
                        
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label htmlFor="email-input" className="sr-only">Email</label>
                                <input type="email" id="email-input" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" placeholder="your@email.com" />
                            </div>
                            <div>
                                <label htmlFor="password-input" className="sr-only">Password</label>
                                <input type="password" id="password-input" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" placeholder="••••••••" />
                            </div>
                            {mode === 'signin' ? (
                                <button onClick={handleEmailSignIn} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors text-lg">Sign In</button>
                            ) : (
                                <button onClick={handleEmailSignUp} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors text-lg">Sign Up</button>
                            )}
                        </form>

                        <p className="text-center text-sm text-gray-400 mt-6">
                            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')} className="font-semibold text-blue-400 hover:text-blue-300 hover:underline ml-2 transition-colors">
                                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                .auth-panel-enhanced {
                    background: rgba(17, 24, 39, 0.5);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid transparent;
                    position: relative;
                    animation: fadeIn 1s ease-out forwards;
                }

                .auth-panel-enhanced::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 24px; 
                    padding: 1px;
                    background: linear-gradient(120deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3));
                    -webkit-mask: 
                        linear-gradient(#fff 0 0) content-box, 
                        linear-gradient(#fff 0 0);
                    -webkit-mask-composite: destination-out;
                    mask-composite: exclude;
                    pointer-events: none;
                    animation: rotate-glow 5s linear infinite;
                }

                .auth-input {
                    width: 100%;
                    background-color: rgba(31, 41, 55, 0.7);
                    border: 1px solid #374151;
                    border-radius: 0.5rem;
                    padding: 0.75rem 1rem;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.2s ease-in-out;
                }

                .auth-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes rotate-glow {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                
                @keyframes form-fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-form-fade-in {
                    animation: form-fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};