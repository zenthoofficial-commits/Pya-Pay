
import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
// @ts-ignore
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                // Settings is now public read per rules
                const snapshot = await get(ref(db, 'settings/branding/driverLoadingLogo'));
                if (snapshot.exists()) {
                    setLogoUrl(snapshot.val());
                }
            } catch (e) {
                console.error("Error fetching logo", e);
            }
        };
        fetchLogo();
    }, []);

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
            const authError = signInError as any;

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
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#06B9FF] p-4">
             <style>{`
                 @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
            
            <div className="mb-8 animate-float flex flex-col items-center">
                {logoUrl ? (
                    <img 
                        src={logoUrl} 
                        alt="Pyapay Driver" 
                        className="w-48 h-auto object-contain drop-shadow-md"
                    />
                ) : (
                    <>
                        <div className="text-5xl md:text-7xl font-extrabold tracking-widest text-white drop-shadow-md">
                            Pyapay
                        </div>
                        <p className="text-white/80 mt-2 font-medium">Driver Partner App</p>
                    </>
                )}
            </div>

            <form 
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl border border-white/20 space-y-6"
            >
                <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">ကြိုဆိုပါတယ်</h1>
                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B9FF] focus:border-transparent transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B9FF] focus:border-transparent transition"
                        required
                    />
                </div>
                
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center font-medium">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#06B9FF] text-white font-bold py-4 px-4 rounded-xl hover:bg-[#05a0de] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/30"
                >
                    {isLoading ? 'လုပ်ဆောင်နေသည်...' : 'Login ဝင်ပါ'}
                </button>
            </form>
        </div>
    );
};

export default LoginScreen;
