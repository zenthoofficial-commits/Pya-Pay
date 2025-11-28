
import React, { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { db } from '../services/firebase';

const LoadingScreen: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranding = async () => {
        try {
            const snapshot = await get(ref(db, 'settings/branding/driverLoadingLogo'));
            if (snapshot.exists()) {
                setLogoUrl(snapshot.val());
            }
        } catch (error) {
            console.error("Error fetching branding:", error);
        }
    };
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
        .loading-spinner {
            border: 4px solid #eff6ff; 
            border-left-color: white; /* White for driver app on blue bg */
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      
      {/* Container for Logo and Spinner */}
      <div className="flex flex-col items-center gap-6">
          {logoUrl ? (
              <div className="h-32 flex items-center justify-center">
                  <img 
                    src={logoUrl} 
                    alt="Loading" 
                    className="w-48 h-auto object-contain animate-pulse-logo" 
                  />
              </div>
          ) : (
              // Empty div to hold space if no logo
              <div className="h-32"></div>
          )}
          
          {/* Spinner below image */}
          <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
