
import React, { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { db } from '../services/firebase';

const LoadingScreen: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const fetchBranding = async () => {
        try {
            const snapshot = await get(ref(db, 'settings/branding/driverLoadingLogo'));
            if (snapshot.exists()) {
                setLogoUrl(snapshot.val());
            }
        } catch (error) {
            console.error("Error fetching branding:", error);
        } finally {
            setHasChecked(true);
        }
    };
    fetchBranding();
  }, []);

  if (!hasChecked) return <div className="h-screen w-screen bg-[#06B9FF]"></div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#06B9FF]">
      <style>{`
        @keyframes pulse-light {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-pulse-logo { animation: pulse-light 2s ease-in-out infinite; }
      `}</style>
      
      {/* Container for Logo Only - Spinner Removed */}
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
              <div className="h-10"></div>
          )}
      </div>
    </div>
  );
};

export default LoadingScreen;
