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
    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
      <div className={`bg-white border-2 ${isDirectRequest ? 'border-amber-400 shadow-amber-500/30' : 'border-blue-500 shadow-blue-500/30'} rounded-xl p-4 shadow-2xl`}>
        <div className="flex justify-between items-center mb-3">
            <div>
                 <h2 className={`text-xl font-bold ${isDirectRequest ? 'text-amber-600' : 'text-blue-800'}`}>
                    {isDirectRequest ? 'သီးသန့်ငှားရမ်းခြင်း (Direct Booking)' : 'ခရီးစဉ် တောင်းဆိုမှုအသစ်'}
                 </h2>
                 {isDirectRequest && <p className="text-xs text-slate-500">ခရီးသည်မှ သင့်ကို တိုက်ရိုက်ရွေးချယ်ထားပါသည်</p>}
            </div>
          <button className={`${isDirectRequest ? 'text-amber-500' : 'text-blue-600'} animate-ping`}>
            <AlarmIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="text-slate-500 text-xs uppercase font-bold">ခေါ်ရန် (ခရီးသည်ဆီသို့)</p>
            <p className="font-bold text-slate-900 text-lg">{getCleanAddress(trip.pickupAddress)}</p>
            <p className="text-blue-600 font-semibold">{trip.pickupLeg.distance} အကွာ، ~{trip.pickupLeg.duration}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="text-slate-500 text-xs uppercase font-bold">ပို့ရန် (ခရီးစဉ်)</p>
            <p className="font-bold text-slate-900 text-lg">{getCleanAddress(trip.dropoffAddress)}</p>
            <p className="text-blue-600 font-semibold">{trip.dropoffLeg.distance}, ~{trip.dropoffLeg.duration}</p>
          </div>
        </div>

        <div className="text-center my-4 bg-emerald-50 rounded-lg p-2 border border-emerald-100">
          <p className="text-3xl font-extrabold text-emerald-600">{trip.fare.toLocaleString()} MMK</p>
          <p className="text-xs text-emerald-800 font-semibold">ခန့်မှန်း ခရီးစဉ်ခ</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleDeclineClick}
            className="w-full bg-white border-2 border-red-500 text-red-600 font-bold py-3 px-4 rounded-lg hover:bg-red-50 transition-colors"
          >
            ငြင်းပယ်ပါ
          </button>
          <button
            onClick={handleAcceptClick}
            className={`w-full ${isDirectRequest ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center shadow-md`}
          >
            လက်ခံပါ
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripRequestAlert;