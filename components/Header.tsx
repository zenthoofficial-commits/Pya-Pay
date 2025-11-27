
import React from 'react';
import { WalletIcon, ProfileIcon } from './Icons';

interface HeaderProps {
  balance: number;
  onProfileClick: () => void;
  onWalletClick: () => void;
  profilePic?: string | null;
}

const Header: React.FC<HeaderProps> = ({ balance, onProfileClick, onWalletClick, profilePic }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
      <button onClick={onWalletClick} aria-label="View earnings" className="pointer-events-auto bg-white p-2 rounded-full flex items-center space-x-3 shadow-lg border border-gray-100 hover:bg-gray-50 transition-all group">
        <div className="bg-blue-100 p-1 rounded-full group-hover:bg-blue-200 transition-colors">
            <WalletIcon className="h-5 w-5 text-blue-600" />
        </div>
        <span className="font-bold text-lg text-slate-800 pr-2">
            {balance.toLocaleString()} Ks
        </span>
      </button>
      <button onClick={onProfileClick} aria-label="View profile and settings" className="pointer-events-auto bg-white p-1 rounded-full hover:bg-gray-50 transition-all shadow-lg border border-gray-100 text-slate-700 overflow-hidden w-12 h-12 flex items-center justify-center">
        {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
        ) : (
            <ProfileIcon className="h-6 w-6" />
        )}
      </button>
    </header>
  );
};

export default Header;
