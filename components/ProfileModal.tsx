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
    <div className="absolute inset-0 bg-black/40 z-20 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white border border-blue-100 rounded-xl w-11/12 max-w-md p-6 text-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">ပရိုဖိုင်နှင့် ဆက်တင်များ</h2>
          <button onClick={onClose} className="hover:text-blue-500 text-slate-500">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-8">
            <img src={`https://i.pravatar.cc/80?u=${driverId}`} alt="Driver" className="w-20 h-20 rounded-full border-2 border-blue-500 shadow-md" />
            <div>
                <h3 className="text-xl font-semibold text-slate-900">ကိုဇော်</h3>
                <p className="text-sm text-slate-500">အဆင့်သတ်မှတ်ချက်: 4.8 ★</p>
                <div className="mt-2 text-sm text-slate-700 bg-blue-50 rounded-md px-3 py-1 inline-block border border-blue-200">
                    <p>Toyota Aqua - <span className="font-mono font-bold text-blue-700">5Q/1234</span></p>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-lg font-semibold border-b border-slate-200 pb-2 text-slate-700">ဆက်တင်များ</h4>
             <div className="flex justify-between items-center">
                <span>အွန်လိုင်း အခြေအနေ</span>
                <button onClick={isOnline ? onGoOffline : onGoOnline} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isOnline ? 'translate-x-6' : ''}`} />
                </button>
            </div>
            <div className="flex justify-between items-center">
                <span>အသိပေးချက်များ ဖွင့်ရန်</span>
                <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : ''}`} />
                </button>
            </div>
             <div className="flex justify-between items-center">
                <span>ခရီးစဉ်များကို အလိုအလျောက် လက်ခံရန်</span>
                <button onClick={() => setAutoAccept(!autoAccept)} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${autoAccept ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${autoAccept ? 'translate-x-6' : ''}`} />
                </button>
            </div>
        </div>

        <button 
            onClick={handleLogout}
            className="mt-8 w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors shadow-lg"
        >
            ထွက်မည်
        </button>

      </div>
    </div>
  );
};

export default ProfileModal;