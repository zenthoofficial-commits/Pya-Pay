
import React from 'react';
import { WalletIcon, ProfileIcon } from './Icons';

interface HeaderProps {
  balance: number;
  onProfileClick: () => void;
  onWalletClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ balance, onProfileClick, onWalletClick }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 text-green-300">
      <button onClick={onWalletClick} aria-label="View earnings" className="bg-black bg-opacity-60 p-2 rounded-full flex items-center space-x-3 shadow-md border border-gray-700 hover:bg-gray-800 transition-all">
        <WalletIcon className="h-6 w-6 text-green-400" />
        <span className="font-bold text-lg text-white pr-2">
            {balance.toLocaleString()} MMK
        </span>
      </button>
      <button onClick={onProfileClick} aria-label="View profile and settings" className="bg-black bg-opacity-60 p-3 rounded-full hover:bg-gray-800 transition-all shadow-md border border-gray-700">
        <ProfileIcon className="h-6 w-6" />
      </button>
    </header>
  );
};

export default Header;