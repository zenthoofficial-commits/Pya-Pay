
import React from 'react';
import { Trip } from '../types';
import { AlarmIcon } from './Icons';
import { getCleanAddress } from '../utils/addressUtils';
import { auth } from '../services/firebase';

interface TripRequestAlertProps {
  trip: Trip;
  onAccept: (tripId: string) => void;
  onDecline: (tripId: string) => void;
}

const TripRequestAlert: React.FC<TripRequestAlertProps> = ({ trip, onAccept, onDecline }) => {

  const handleAcceptClick = () => {
    onAccept(trip.id);
  };

  const handleDeclineClick = () => {
    onDecline(trip.id);
  };

  const isDirectRequest = trip.requestedDriverId === auth.currentUser?.uid;

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
      {/* Changed background to bg-blue-50 (Light Blue) as requested */}
      <div className={`bg-blue-50 border-2 ${isDirectRequest ? 'border-amber-400 shadow-amber-200' : 'border-blue-500 shadow-blue-200'} rounded-2xl p-5 shadow-2xl`}>
        <div className="flex justify-between items-center mb-4">
            <div>
                 <h2 className={`text-xl font-extrabold ${isDirectRequest ? 'text-amber-600' : 'text-blue-700'}`}>
                    {isDirectRequest ? 'တိုက်ရိုက် ငှားရမ်းမှု!' : 'ခရီးစဉ် အသစ်'}
                 </h2>
                 <p className="text-xs bg-white text-slate-600 px-2 py-1 rounded inline-block mt-1 font-bold border border-slate-200 shadow-sm">
                    Token: {trip.token || 'N/A'}
                 </p>
                 {isDirectRequest && <p className="text-xs text-slate-500 mt-1">ခရီးသည်က သင့်ကို ရွေးချယ်ထားပါသည်</p>}
            </div>
          <div className={`${isDirectRequest ? 'bg-amber-100 text-amber-500' : 'bg-white text-blue-600'} p-2 rounded-full animate-pulse border border-blue-100`}>
            <AlarmIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-3 text-sm mb-4">
          <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">စတင်မည့်နေရာ (Pick Up)</p>
            <p className="font-bold text-slate-800 text-base">{getCleanAddress(trip.pickupAddress)}</p>
            <p className="text-blue-500 font-medium mt-1 text-xs">{trip.pickupLeg.distance} အကွာ • {trip.pickupLeg.duration}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">ပို့ဆောင်ရမည့်နေရာ (Drop Off)</p>
            <p className="font-bold text-slate-800 text-base">{getCleanAddress(trip.dropoffAddress)}</p>
            <p className="text-slate-500 font-medium mt-1 text-xs">{trip.dropoffLeg.distance} • {trip.dropoffLeg.duration}</p>
          </div>
        </div>

        <div className="text-center mb-5 bg-green-100 p-2 rounded-lg border border-green-200">
          <p className="text-3xl font-extrabold text-green-700">{trip.fare.toLocaleString()} Ks</p>
          <p className="text-xs text-green-800 font-bold">ခန့်မှန်း ကျသင့်ငွေ</p>
        </div>

        {/* Buttons are now equal size (flex-1) */}
        <div className="flex gap-3">
          <button
            onClick={handleDeclineClick}
            className="flex-1 bg-white text-red-600 border border-red-200 font-bold py-3 px-4 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
          >
            ငြင်းပယ်မည်
          </button>
          <button
            onClick={handleAcceptClick}
            className={`flex-1 ${isDirectRequest ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg`}
          >
            လက်ခံမည်
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripRequestAlert;
