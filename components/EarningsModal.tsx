
import React, { useState } from 'react';
import { Trip } from '../types';
import { CloseIcon, WalletIcon } from './Icons';
import { getShortLocationName } from '../utils/addressUtils';
import { push, ref, serverTimestamp } from 'firebase/database';
import { db } from '../services/firebase';

interface EarningsModalProps {
  onClose: () => void;
  balance: number;
  tripHistory: Trip[];
  transactions: any[];
  onViewTripDetails: (trip: Trip) => void;
  driverId: string;
}

const EarningsModal: React.FC<EarningsModalProps> = ({ onClose, balance, tripHistory, transactions, onViewTripDetails, driverId }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [amount, setAmount] = useState('');

  const handleRequestTopup = async () => {
      if(!amount || parseInt(amount) <= 0) return alert("ပမာဏ မှန်ကန်စွာ ထည့်သွင်းပါ။");
      setIsRequesting(true);
      try {
          await push(ref(db, `transactions/${driverId}`), {
              amount: parseInt(amount),
              type: 'topup',
              status: 'pending',
              date: serverTimestamp()
          });
          alert("ငွေဖြည့်ရန် တောင်းဆိုမှု ပေးပို့လိုက်ပါပြီ။ Admin မှ အတည်ပြုပေးပါမည်။");
          setAmount('');
      } catch(e) {
          alert("Error requesting top-up");
      } finally {
          setIsRequesting(false);
      }
  };

  // Merge trips and transactions for a unified history view
  const historyItems = [
      ...tripHistory.map(t => ({ 
          type: 'trip', 
          date: t.completedAt || 0, 
          data: t 
      })),
      ...transactions.map(t => ({ 
          type: 'transaction', 
          date: t.date || 0, 
          data: t 
      }))
  ].sort((a,b) => b.date - a.date);

  return (
    <div className="absolute inset-0 bg-black/60 z-30 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 text-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-800">ပိုက်ဆံအိတ်</h2>
          <button onClick={onClose} className="hover:text-red-500 transition-colors bg-gray-100 p-2 rounded-full">
            <CloseIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 mb-6 text-center flex-shrink-0 shadow-lg text-white">
            <p className="text-sm text-blue-100 opacity-90 font-medium tracking-wide">လက်ရှိ လက်ကျန်ငွေ (Balance)</p>
            <p className="text-4xl font-extrabold my-2 drop-shadow-md">{balance.toLocaleString()} MMK</p>
            
            <div className="mt-4 bg-white/10 rounded-lg p-3 backdrop-blur-md border border-white/20">
                <p className="text-xs text-blue-50 mb-2 text-left">ငွေဖြည့်ရန် တောင်းဆိုမည်</p>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="ပမာဏ (MMK)"
                        className="w-full rounded px-3 py-2 text-slate-900 text-sm focus:outline-none"
                    />
                    <button 
                        onClick={handleRequestTopup}
                        disabled={isRequesting}
                        className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded text-sm font-bold shadow disabled:opacity-50"
                    >
                        {isRequesting ? '...' : 'ပို့မည်'}
                    </button>
                </div>
            </div>
        </div>

        <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 flex-shrink-0 text-slate-700">ငွေကြေး မှတ်တမ်း</h3>
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {historyItems.length > 0 ? (
                historyItems.map((item, index) => {
                    if (item.type === 'trip') {
                        const trip = item.data as Trip;
                        // Deduction = Platform Fee + 14% Commission
                        const deduction = 100 + Math.round((trip.fare - 100) * 0.14);
                        return (
                            <div key={`trip-${trip.id}`} onClick={() => onViewTripDetails(trip)} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 p-2 rounded-full"><WalletIcon className="w-5 h-5 text-red-500"/></div>
                                    <div>
                                        <p className="font-semibold text-slate-700 text-sm">Commission & Fee</p>
                                        <p className="text-xs text-gray-500">{getShortLocationName(trip.dropoffAddress)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="font-bold text-red-500">-{deduction.toLocaleString()} Ks</p>
                                     <p className="text-[10px] text-gray-400">{new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        )
                    } else {
                        const tx = item.data;
                        const isTopup = tx.type === 'topup';
                        const isPending = tx.status === 'pending';
                        
                        let amountColor = isPending ? 'text-yellow-600' : (isTopup ? 'text-green-600' : 'text-red-500');
                        let sign = isTopup ? '+' : '-';
                        let label = isTopup ? 'Top-up' : 'Withdraw';
                        if (isPending) label += ' (Pending)';

                        return (
                            <div key={`tx-${index}`} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${isPending ? 'bg-yellow-100' : (isTopup ? 'bg-green-100' : 'bg-red-100')}`}>
                                        <WalletIcon className={`w-5 h-5 ${isPending ? 'text-yellow-600' : (isTopup ? 'text-green-600' : 'text-red-500')}`}/>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700 text-sm">{label}</p>
                                        <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className={`font-bold ${amountColor}`}>{sign}{tx.amount.toLocaleString()} Ks</p>
                            </div>
                        )
                    }
                })
            ) : (
                <div className="text-center py-10 flex flex-col items-center justify-center text-gray-400">
                    <WalletIcon className="w-12 h-12 mb-2 opacity-20" />
                    <p>မှတ်တမ်း မရှိပါ။</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EarningsModal;
