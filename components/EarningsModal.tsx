import React, { useState, useEffect } from 'react';
import { Trip } from '../types';
import { CloseIcon } from './Icons';
import { getShortLocationName } from '../utils/addressUtils';
import { db } from '../services/firebase';
import { ref, query, orderByChild, equalTo, onValue, limitToLast } from 'firebase/database';

interface EarningsModalProps {
  onClose: () => void;
  balance: number;
  tripHistory: Trip[];
  onViewTripDetails: (trip: Trip) => void;
  driverId: string;
}

const EarningsModal: React.FC<EarningsModalProps> = ({ onClose, balance, tripHistory, onViewTripDetails, driverId }) => {
  const [activeTab, setActiveTab] = useState<'trips' | 'wallet'>('trips');
  const [walletHistory, setWalletHistory] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (activeTab === 'wallet') {
        const q = query(ref(db, 'transactions'), orderByChild('driverId'), equalTo(driverId), limitToLast(20));
        unsubscribe = onValue(q, (snapshot) => {
            if (snapshot.exists()) {
                const txs = Object.values(snapshot.val());
                setWalletHistory(txs.sort((a: any, b: any) => b.timestamp - a.timestamp));
            } else {
                setWalletHistory([]);
            }
        });
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [activeTab, driverId]);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 z-20 flex justify-center items-center p-4">
      <div className="bg-gray-900 border border-green-500 rounded-lg w-full max-w-md p-6 text-green-300 shadow-lg shadow-green-500/20 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold">ဝင်ငွေ နှင့် ပိုက်ဆံအိတ်</h2>
          <button onClick={onClose} className="hover:text-green-500"><CloseIcon className="h-6 w-6" /></button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-4 text-center flex-shrink-0">
            <p className="text-sm text-gray-400">လက်ရှိ လက်ကျန်ငွေ</p>
            <p className="text-4xl font-bold text-white my-2">{balance.toLocaleString()} MMK</p>
        </div>

        <div className="flex border-b border-gray-700 mb-4 flex-shrink-0">
            <button onClick={() => setActiveTab('trips')} className={`flex-1 py-2 font-bold ${activeTab === 'trips' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'}`}>Trips</button>
            <button onClick={() => setActiveTab('wallet')} className={`flex-1 py-2 font-bold ${activeTab === 'wallet' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'}`}>Wallet History</button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-3 pr-2">
            {activeTab === 'trips' ? (
                tripHistory.length > 0 ? (
                    tripHistory.map((trip) => {
                        const driverGets = trip.fare - Math.round(trip.fare * 0.14);
                        return (
                            <div key={trip.id} onClick={() => onViewTripDetails(trip)} className="flex justify-between items-center bg-gray-800 p-3 rounded-md hover:bg-gray-700 cursor-pointer transition-colors">
                                <div>
                                    <p className="font-semibold text-white truncate max-w-xs">{getShortLocationName(trip.pickupAddress)} to {getShortLocationName(trip.dropoffAddress)}</p>
                                    <p className="text-xs text-gray-400">{new Date(trip.completedAt!).toLocaleString()}</p>
                                </div>
                                <p className="text-lg font-bold text-green-400">+{driverGets.toLocaleString()}</p>
                            </div>
                        )
                    })
                ) : <p className="text-center text-gray-500 py-8">ခရီးစဉ်မှတ်တမ်း မရှိပါ။</p>
            ) : (
                walletHistory.length > 0 ? (
                    walletHistory.map((tx, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-800 p-3 rounded-md border-l-4 border-gray-600">
                             <div>
                                <p className="font-semibold text-white uppercase">{tx.type}</p>
                                <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                                <p className="text-xs text-gray-500 truncate w-32">{tx.note}</p>
                            </div>
                            <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()}</p>
                        </div>
                    ))
                ) : <p className="text-center text-gray-500 py-8">ငွေကြေးမှတ်တမ်း မရှိပါ။</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default EarningsModal;