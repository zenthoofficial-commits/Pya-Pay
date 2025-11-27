
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-blue-50 text-slate-800">
      <style>{`
        @keyframes pulse-light {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        .animate-pulse-logo {
          animation: pulse-light 2s ease-in-out infinite;
        }
      `}</style>
      <div className="text-5xl md:text-7xl font-extrabold tracking-widest animate-pulse-logo text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 mb-4">
        Pyapay
      </div>
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingScreen;
