import React from 'react';
import { Trip } from '../types';
import { CloseIcon } from './Icons';
import { getShortLocationName } from '../utils/addressUtils';

// Fix: Defined the missing EarningsModalProps interface.
interface EarningsModalProps {
  onClose: () => void;
  balance: number;
  tripHistory: Trip[];
  onViewTripDetails: (trip: Trip) => void;
}

const EarningsModal: React.FC<EarningsModalProps> = ({ onClose, balance, tripHistory, onViewTripDetails }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 z-20 flex justify-center items-center p-4">
      <div className="bg-gray-900 border border-green-500 rounded-lg w-full max-w-md p-6 text-green-300 shadow-lg shadow-green-500/20 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold">ဝင်ငွေ</h2>
          <button onClick={onClose} className="hover:text-green-500">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-center flex-shrink-0">
            <p className="text-sm text-gray-400">လက်ရှိ လက်ကျန်ငွေ</p>
            <p className="text-4xl font-bold text-white my-2">{balance.toLocaleString()} MMK</p>
            <button 
                onClick={() => alert('ငွေထုတ်ခြင်း လုပ်ဆောင်ချက် မကြာမီလာမည်!')}
                className="mt-2 w-full bg-green-600 text-black font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-colors"
            >
                ငွေထုတ်ရန်
            </button>
        </div>

        <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4 flex-shrink-0">ခရီးစဉ် မှတ်တမ်း</h3>
        <div className="flex-grow overflow-y-auto space-y-3 pr-2">
            {tripHistory.length > 0 ? (
                tripHistory.map((trip) => {
                    const driverGets = trip.fare - 100 - Math.round((trip.fare - 100) * 0.14);
                    return (
                        <div key={trip.id} onClick={() => onViewTripDetails(trip)} className="flex justify-between items-center bg-gray-800 p-3 rounded-md hover:bg-gray-700 cursor-pointer transition-colors">
                            <div>
                                <p className="font-semibold text-white truncate max-w-xs">{getShortLocationName(trip.pickupAddress)} to {getShortLocationName(trip.dropoffAddress)}</p>
                                <p className="text-xs text-gray-400">{new Date(trip.completedAt!).toLocaleString()}</p>
                            </div>
                            <p className="text-lg font-bold text-green-400">+{driverGets.toLocaleString()} MMK</p>
                        </div>
                    )
                })
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>ခရီးစဉ်မှတ်တမ်း မရှိပါ။</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EarningsModal;