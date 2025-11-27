import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon } from './Icons';
import { auth, db } from '../services/firebase';
// @ts-ignore
import { signOut } from 'firebase/auth';
import { ref, update, get } from 'firebase/database';

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
    const [carDetails, setCarDetails] = useState({ model: 'Loading...', plate: '' });

    useEffect(() => {
        // Fetch driver details to show car model/plate
        const fetchDetails = async () => {
            try {
                const snapshot = await get(ref(db, `drivers/${driverId}`));
                if(snapshot.exists()) {
                    const data = snapshot.val();
                    setCarDetails({
                        model: data.carModel || 'မသိရှိပါ',
                        plate: data.carPlate || ''
                    });
                    setLocalProfilePic(data.profilePic);
                }
            } catch (e) {
                console.error("Error fetching driver details", e);
            }
        };
        fetchDetails();
    }, [driverId]);

    const handleLogout = () => {
        if(confirm("အကောင့်ထွက်ရန် သေချာပါသလား?")) {
            signOut(auth).catch(error => {
                console.error("Logout failed:", error);
                alert("ထွက်ခွာရာတွင် အမှားအယွင်းဖြစ်နေပါသည်။");
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                if (base64String.length > 500000) {
                     alert("ဓာတ်ပုံဖိုင်ဆိုဒ် ကြီးလွန်းပါသည်။");
                     return;
                }
                setLocalProfilePic(base64String);
                
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
    <div className="absolute inset-0 bg-black/60 z-20 flex justify-center items-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">ပရိုဖိုင် (Profile)</h2>
          <button onClick={onClose} className="hover:text-red-500 bg-gray-100 p-2 rounded-full">
            <CloseIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="relative group cursor-pointer flex-shrink-0" onClick={triggerFileInput}>
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
            <div className="overflow-hidden">
                <h3 className="text-lg font-bold text-slate-800 truncate">ယာဉ်မောင်း</h3>
                <p className="text-sm text-slate-600 font-medium truncate">{carDetails.model}</p>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">{carDetails.plate}</span>
                <p className="text-xs text-blue-500 cursor-pointer mt-1" onClick={triggerFileInput}>ပုံပြောင်းရန်</p>
            </div>
        </div>

        <div className="space-y-5">
            <h4 className="text-base font-bold text-slate-500 border-b border-gray-100 pb-2">ဆက်တင်များ</h4>
             <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">အွန်လိုင်း အခြေအနေ</span>
                <button onClick={isOnline ? onGoOffline : onGoOnline} className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-5' : ''}`} />
                </button>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">အသိပေးချက်များ</span>
                <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-5' : ''}`} />
                </button>
            </div>
        </div>

        <button 
            onClick={handleLogout}
            className="mt-8 w-full bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
        >
            အကောင့်ထွက်မည်
        </button>

      </div>
    </div>
  );
};

export default ProfileModal;