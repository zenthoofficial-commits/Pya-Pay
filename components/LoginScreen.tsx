
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email || !password) {
            setError("Email နှင့် Password ထည့်သွင်းပါ။");
            setIsLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // If successful, onAuthStateChanged in App.tsx will handle the rest.
        } catch (signInError) {
            const authError = signInError as AuthError;

            if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
                setError('အကောင့်မရှိပါ သို့မဟုတ် Password မှားယွင်းနေပါသည်။ အက်မင်ထံတွင် အကောင့်ဖွင့်ပါ။');
            } else if (authError.code === 'auth/invalid-email') {
                setError('Email ပုံစံမမှန်ပါ။');
            }
            else {
                 setError('Login ဝင်ရာတွင် အမှားအယွင်းဖြစ်နေပါသည်။');
                 console.error("Sign in error:", authError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-green-300 p-4">
             <style>{`
                .login-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: url('https://images.unsplash.com/photo-1533109721025-d1ae7de8c782?q=80&w=2940&auto=format&fit=crop');
                    background-size: cover;
                    background-position: center;
                    filter: blur(8px) brightness(0.4);
                    z-index: -1;
                }
                 @keyframes pulse-light {
                    0%, 100% {
                        opacity: 1;
                        text-shadow: 0 0 5px #39FF14, 0 0 10px #39FF14;
                    }
                    50% {
                        opacity: 0.7;
                        text-shadow: 0 0 10px #39FF14, 0 0 20px #39FF14;
                    }
                }
                .animate-pulse-light {
                    animation: pulse-light 2.5s ease-in-out infinite;
                }
            `}</style>
            <div className="login-container relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                <div className="text-5xl md:text-7xl font-extrabold tracking-widest animate-pulse-light mb-4">
                    Pyapay
                </div>
                <p className="text-green-200 mb-10">Driver App</p>

                <form 
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm bg-black/50 backdrop-blur-sm border border-green-500/50 rounded-2xl p-8 shadow-lg shadow-green-500/20 space-y-6"
                >
                    <h1 className="text-2xl font-bold text-center text-green-300 mb-2">Login</h1>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-green-200 mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-green-200 mb-1">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-400 bg-red-900/50 border border-red-500/50 rounded-md p-2 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-black font-bold py-3 px-4 rounded-lg hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        {isLoading ? 'လုပ်ဆောင်နေသည်...' : 'Login ဝင်ပါ'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
