
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
      <div className={`bg-gray-900 border-2 ${isDirectRequest ? 'border-amber-400 shadow-amber-500/30' : 'border-green-500 shadow-green-500/30'} rounded-xl p-4 shadow-lg`}>
        <div className="flex justify-between items-center mb-3">
            <div>
                 <h2 className={`text-xl font-bold ${isDirectRequest ? 'text-amber-400' : 'text-green-300'}`}>
                    {isDirectRequest ? 'သီးသန့်ငှားရမ်းခြင်း (Direct Booking)' : 'ခရီးစဉ် တောင်းဆိုမှုအသစ်'}
                 </h2>
                 {isDirectRequest && <p className="text-xs text-white">ခရီးသည်မှ သင့်ကို တိုက်ရိုက်ရွေးချယ်ထားပါသည်</p>}
            </div>
          <button className={`${isDirectRequest ? 'text-amber-400' : 'text-green-400'} animate-ping`}>
            <AlarmIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="bg-gray-800 p-2 rounded-md">
            <p className="text-gray-400">ခေါ်ရန် (ခရီးသည်ဆီသို့)</p>
            <p className="font-semibold text-white">{getCleanAddress(trip.pickupAddress)}</p>
            <p className="text-green-400">{trip.pickupLeg.distance} အကွာ، ~{trip.pickupLeg.duration}</p>
          </div>
          <div className="bg-gray-800 p-2 rounded-md">
            <p className="text-gray-400">ပို့ရန် (ခရီးစဉ်)</p>
            <p className="font-semibold text-white">{getCleanAddress(trip.dropoffAddress)}</p>
            <p className="text-green-400">{trip.dropoffLeg.distance}, ~{trip.dropoffLeg.duration}</p>
          </div>
        </div>

        <div className="text-center my-3">
          <p className="text-3xl font-bold text-green-300">{trip.fare} MMK</p>
          <p className="text-xs text-gray-500">ခန့်မှန်း ခရီးစဉ်ခ</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleDeclineClick}
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-500 transition-colors"
          >
            ငြင်းပယ်ပါ
          </button>
          <button
            onClick={handleAcceptClick}
            className={`w-full ${isDirectRequest ? 'bg-amber-500 hover:bg-amber-400' : 'bg-green-500 hover:bg-green-400'} text-black font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center`}
          >
            လက်ခံပါ
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripRequestAlert;
