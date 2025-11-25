
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-green-300">
      <style>{`
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
          animation: pulse-light 2s ease-in-out infinite;
        }
      `}</style>
      <div className="text-4xl md:text-6xl font-extrabold tracking-widest animate-pulse-light">
        Pyapay
      </div>
      <p className="mt-4 text-lg animate-pulse">ကြိုဆိုပါတယ်</p>
    </div>
  );
};

export default LoadingScreen;
