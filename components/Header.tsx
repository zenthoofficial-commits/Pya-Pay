import React from 'react';
import { WalletIcon, ProfileIcon } from './Icons';

interface HeaderProps {
  balance: number;
  onProfileClick: () => void;
  onWalletClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ balance, onProfileClick, onWalletClick }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
      <button onClick={onWalletClick} aria-label="View earnings" className="bg-white/90 backdrop-blur-sm p-2 rounded-full flex items-center space-x-3 shadow-md border border-blue-100 hover:bg-blue-50 transition-all">
        <WalletIcon className="h-6 w-6 text-blue-600" />
        <span className="font-bold text-lg text-slate-800 pr-2">
            {balance.toLocaleString()} MMK
        </span>
      </button>
      <button onClick={onProfileClick} aria-label="View profile and settings" className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-blue-50 transition-all shadow-md border border-blue-100 text-slate-700">
        <ProfileIcon className="h-6 w-6" />
      </button>
    </header>
  );
};

export default Header;