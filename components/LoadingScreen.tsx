
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#06B9FF] text-white">
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
      <div className="text-5xl md:text-7xl font-extrabold tracking-widest animate-pulse-logo mb-4 text-white">
        Pyapay
      </div>
      <div className="w-12 h-12 border-4 border-blue-200 border-t-white rounded-full animate-spin"></div>
      <p className="mt-4 text-white font-medium tracking-wider">Driver App</p>
    </div>
  );
};

export default LoadingScreen;
