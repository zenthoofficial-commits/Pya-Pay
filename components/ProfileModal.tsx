
import React, { useState, useRef } from 'react';
import { CloseIcon } from './Icons';
import { auth, db } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { ref, update } from 'firebase/database';

interface ProfileModalProps {
  driverId: string;
  onClose: () => void;
  isOnline: boolean;
  onGoOnline: () => void;
  onGoOffline: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ driverId, onClose, isOnline, onGoOnline, onGoOffline }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localProfilePic, setLocalProfilePic] = useState<string | null>(null);

    const handleLogout = () => {
        signOut(auth).catch(error => {
            console.error("Logout failed:", error);
            alert("ထွက်ခွာရာတွင် အမှားအယွင်းဖြစ်နေပါသည်။");
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                // Limit size to prevent database issues (approx 100kb limit logic would be good, but simple here)
                if (base64String.length > 500000) {
                     alert("ဓာတ်ပုံဖိုင်ဆိုဒ် ကြီးလွန်းပါသည်။");
                     return;
                }
                setLocalProfilePic(base64String);
                
                // Update in DB
                try {
                    const driverRef = ref(db, `drivers/${driverId}`);
                    await update(driverRef, { profilePic: base64String });
                } catch (err) {
                    console.error("Failed to update profile pic", err);
                    alert("ပုံပြောင်းလဲမရနိုင်ပါ");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <img 
                    src={localProfilePic || `https://i.pravatar.cc/150?u=${driverId}`} 
                    alt="Driver" 
                    className="w-16 h-16 rounded-full border-4 border-white shadow-sm object-cover" 
                />
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">My Profile</h3>
                <p className="text-sm text-slate-500 font-medium">Rating: <span className="text-orange-500">4.8 ★</span></p>
                <div className="mt-1 text-sm text-slate-600">
                    <p className="text-xs text-blue-500 cursor-pointer" onClick={triggerFileInput}>Change Photo</p>
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
