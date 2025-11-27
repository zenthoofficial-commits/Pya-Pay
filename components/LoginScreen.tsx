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
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-blue-50 text-slate-800 p-4">
            <div className="login-container relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                <div className="text-5xl md:text-7xl font-extrabold tracking-widest text-blue-600 mb-4 drop-shadow-md">
                    Pyapay
                </div>
                <p className="text-slate-500 mb-10 font-semibold">Driver App</p>

                <form 
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm bg-white/90 backdrop-blur-sm border border-blue-200 rounded-2xl p-8 shadow-xl space-y-6"
                >
                    <h1 className="text-2xl font-bold text-center text-blue-800 mb-2">Login</h1>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        {isLoading ? 'လုပ်ဆောင်နေသည်...' : 'Login ဝင်ပါ'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;