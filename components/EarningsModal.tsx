import React from 'react';
import { Trip } from '../types';
import { CloseIcon } from './Icons';
import { getShortLocationName } from '../utils/addressUtils';

interface EarningsModalProps {
  onClose: () => void;
  balance: number;
  tripHistory: Trip[];
  onViewTripDetails: (trip: Trip) => void;
}

const EarningsModal: React.FC<EarningsModalProps> = ({ onClose, balance, tripHistory, onViewTripDetails }) => {
  return (
    <div className="absolute inset-0 bg-black/40 z-20 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white border border-blue-200 rounded-lg w-full max-w-md p-6 text-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-blue-900">ဝင်ငွေ</h2>
          <button onClick={onClose} className="hover:text-blue-600 text-slate-500">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-blue-600 rounded-lg p-4 mb-6 text-center flex-shrink-0 shadow-md">
            <p className="text-sm text-blue-100">လက်ရှိ လက်ကျန်ငွေ</p>
            <p className="text-4xl font-bold text-white my-2">{balance.toLocaleString()} MMK</p>
            <button 
                onClick={() => alert('ငွေထုတ်ခြင်း လုပ်ဆောင်ချက် မကြာမီလာမည်!')}
                className="mt-2 w-full bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
            >
                ငွေထုတ်ရန်
            </button>
        </div>

        <h3 className="text-lg font-semibold border-b border-slate-200 pb-2 mb-4 flex-shrink-0 text-slate-700">ခရီးစဉ် မှတ်တမ်း</h3>
        <div className="flex-grow overflow-y-auto space-y-3 pr-2">
            {tripHistory.length > 0 ? (
                tripHistory.map((trip) => {
                    const driverGets = trip.fare - 100 - Math.round((trip.fare - 100) * 0.14);
                    return (
                        <div key={trip.id} onClick={() => onViewTripDetails(trip)} className="flex justify-between items-center bg-slate-50 p-3 rounded-md hover:bg-blue-50 cursor-pointer transition-colors border border-slate-100">
                            <div>
                                <p className="font-semibold text-slate-800 truncate max-w-xs">{getShortLocationName(trip.pickupAddress)} to {getShortLocationName(trip.dropoffAddress)}</p>
                                <p className="text-xs text-slate-500">{new Date(trip.completedAt!).toLocaleString()}</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-600">+{driverGets.toLocaleString()} MMK</p>
                        </div>
                    )
                })
            ) : (
                <div className="text-center py-8 text-slate-400">
                    <p>ခရီးစဉ်မှတ်တမ်း မရှိပါ။</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EarningsModal;