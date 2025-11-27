
import React, { useState } from 'react';
import { CloseIcon } from './Icons';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

interface ProfileModalProps {
  driverId: string;
  onClose: () => void;
  isOnline: boolean;
  onGoOnline: () => void;
  onGoOffline: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ driverId, onClose, isOnline, onGoOnline, onGoOffline }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [autoAccept, setAutoAccept] = useState(false);

    const handleLogout = () => {
        signOut(auth).catch(error => {
            console.error("Logout failed:", error);
            alert("ထွက်ခွာရာတွင် အမှားအယွင်းဖြစ်နေပါသည်။");
        });
    };

  return (
    <div className="absolute inset-0 bg-black/60 z-20 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-11/12 max-w-md p-6 text-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Profile</h2>
          <button onClick={onClose} className="hover:text-red-500 bg-gray-100 p-2 rounded-full">
            <CloseIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <img src={`https://i.pravatar.cc/80?u=${driverId}`} alt="Driver" className="w-16 h-16 rounded-full border-4 border-white shadow-sm" />
            <div>
                <h3 className="text-xl font-bold text-slate-800">ကိုဇော်</h3>
                <p className="text-sm text-slate-500 font-medium">Rating: <span className="text-orange-500">4.8 ★</span></p>
                <div className="mt-1 text-sm text-slate-600">
                    <p>Toyota Aqua • <span className="font-mono font-bold text-blue-600">5Q/1234</span></p>
                </div>
            </div>
        </div>

        <div className="space-y-5">
            <h4 className="text-lg font-bold text-slate-700 border-b border-gray-100 pb-2">Settings</h4>
             <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">Online Status</span>
                <button onClick={isOnline ? onGoOffline : onGoOnline} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-6' : ''}`} />
                </button>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">Notifications</span>
                <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : ''}`} />
                </button>
            </div>
             <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">Auto Accept</span>
                <button onClick={() => setAutoAccept(!autoAccept)} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${autoAccept ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${autoAccept ? 'translate-x-6' : ''}`} />
                </button>
            </div>
        </div>

        <button 
            onClick={handleLogout}
            className="mt-8 w-full bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
        >
            Log Out
        </button>

      </div>
    </div>
  );
};

export default ProfileModal;
