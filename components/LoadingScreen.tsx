import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-blue-50 text-blue-600">
      <style>{`
        @keyframes pulse-light {
          0%, 100% {
            opacity: 1;
            text-shadow: 0 0 5px #3b82f6, 0 0 10px #3b82f6;
          }
          50% {
            opacity: 0.7;
            text-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6;
          }
        }
        .animate-pulse-light {
          animation: pulse-light 2s ease-in-out infinite;
        }
      `}</style>
      <div className="text-4xl md:text-6xl font-extrabold tracking-widest animate-pulse-light text-blue-600">
        Pyapay
      </div>
      <p className="mt-4 text-lg animate-pulse text-slate-600">ကြိုဆိုပါတယ်</p>
    </div>
  );
};

export default LoadingScreen;