
import React, { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { db } from '../services/firebase';

const LoadingScreen: React.FC = () => {
  // Initialize state directly from localStorage for instant render
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('driverLoadingLogo');
  });

  useEffect(() => {
    const fetchBranding = async () => {
        try {
            const snapshot = await get(ref(db, 'settings/branding/driverLoadingLogo'));
            if (snapshot.exists()) {
                const url = snapshot.val();
                // Update state and cache for next time
                setLogoUrl(url);
                localStorage.setItem('driverLoadingLogo', url);
            }
        } catch (error) {
            console.error("Error fetching branding:", error);
        }
    };
    // Fetch in background
    fetchBranding();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#06B9FF]">
      <style>{`
        @keyframes pulse-light {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-pulse-logo { animation: pulse-light 2s ease-in-out infinite; }
      `}</style>
      
      <div className="flex flex-col items-center gap-6">
          {logoUrl ? (
              <div className="flex items-center justify-center mb-4">
                  <img 
                    src={logoUrl} 
                    alt="Loading" 
                    className="w-48 h-auto object-contain animate-pulse-logo" 
                  />
              </div>
          ) : (
             <div className="text-white text-2xl font-bold tracking-widest animate-pulse">PYAPAY</div>
          )}
      </div>
    </div>
  );
};

export default LoadingScreen;
