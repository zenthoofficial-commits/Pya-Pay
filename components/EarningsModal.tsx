
import React, { useState, useEffect } from 'react';
import { Trip } from '../types';
import { CloseIcon, WalletIcon } from './Icons';
import { getShortLocationName } from '../utils/addressUtils';
import { push, ref, serverTimestamp, get } from 'firebase/database';
import { db } from '../services/firebase';

interface EarningsModalProps {
  onClose: () => void;
  balance: number;
  tripHistory: Trip[];
  transactions: any[];
  onViewTripDetails: (trip: Trip) => void;
  driverId: string;
  commissionRate: number;
  platformFee: number;
}

const EarningsModal: React.FC<EarningsModalProps> = ({ onClose, balance, tripHistory, transactions, onViewTripDetails, driverId, commissionRate, platformFee }) => {
  const [showTopupForm, setShowTopupForm] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'KPay' | 'WavePay'>('KPay');
  const [txId, setTxId] = useState('');
  const [senderName, setSenderName] = useState('');
  
  // Dynamic Payment Info State
  const [paymentInfo, setPaymentInfo] = useState({ KPay: "Loading...", WavePay: "Loading..." });

  useEffect(() => {
      const fetchPaymentInfo = async () => {
          try {
              const snap = await get(ref(db, 'settings/contact_info'));
              if (snap.exists()) {
                  const data = snap.val();
                  setPaymentInfo({
                      KPay: data.kpay || "No Info",
                      WavePay: data.wave || "No Info"
                  });
              } else {
                  setPaymentInfo({ KPay: "Admin Contact", WavePay: "Admin Contact" });
              }
          } catch(e) { console.error(e); }
      };
      fetchPaymentInfo();
  }, []);

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
          alert('Phone number copied!');
      });
  };

  const handleRequestTopup = async () => {
      if(!amount || parseInt(amount) <= 0) return alert("ပမာဏ မှန်ကန်စွာ ထည့်သွင်းပါ။");
      if(!txId || !senderName) return alert("ငွေလွှဲ ID နှင့် ပေးပို့သူအမည် ထည့်သွင်းပါ။");

      setIsRequesting(true);
      try {
          await push(ref(db, `transactions/${driverId}`), {
              amount: parseInt(amount),
              type: 'topup',
              status: 'pending',
              method: paymentMethod,
              txId: txId,
              senderName: senderName,
              date: serverTimestamp()
          });
          alert("ငွေဖြည့်ရန် တောင်းဆိုမှု ပေးပို့လိုက်ပါပြီ။ Admin မှ အတည်ပြုပေးပါမည်။");
          setAmount('');
          setTxId('');
          setSenderName('');
          setShowTopupForm(false);
      } catch(e) {
          alert("Error requesting top-up");
      } finally {
          setIsRequesting(false);
      }
  };

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
      <div className="bg-white rounded-2xl w-full max-w-md p-6 text-slate-800 shadow-2xl flex flex-col max-h-[95vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-800">ပိုက်ဆံအိတ်</h2>
          <button onClick={onClose} className="hover:text-red-500 transition-colors bg-gray-100 p-2 rounded-full">
            <CloseIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 mb-6 text-center flex-shrink-0 shadow-lg text-white">
            <p className="text-sm text-blue-100 opacity-90 font-medium tracking-wide">လက်ရှိ လက်ကျန်ငွေ (Balance)</p>
            <p className="text-4xl font-extrabold my-2 drop-shadow-md">{balance.toLocaleString()} MMK</p>
            
            {!showTopupForm ? (
                <button 
                    onClick={() => setShowTopupForm(true)}
                    className="mt-4 bg-white text-blue-600 px-6 py-2 rounded-full font-bold shadow hover:bg-blue-50 transition"
                >
                    + ငွေဖြည့်မည်
                </button>
            ) : (
                <div className="mt-4 bg-white text-slate-800 rounded-lg p-4 text-left shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-blue-600">ငွေဖြည့်ဖောင်</h4>
                        <button onClick={() => setShowTopupForm(false)} className="text-xs text-red-500">ပယ်ဖျက်မည်</button>
                    </div>
                    
                    <div className="mb-3 p-2 bg-blue-50 rounded text-xs border border-blue-100 space-y-1">
                        <p className="font-bold mb-1">ငွေလွှဲရန် Admin ဖုန်းနံပါတ်များ:</p>
                        <div className="flex justify-between items-center">
                            <p>KPay: <span className="font-mono font-bold text-blue-600">{paymentInfo.KPay}</span></p>
                            <button onClick={() => handleCopy(paymentInfo.KPay)} className="text-gray-400 hover:text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <p>Wave: <span className="font-mono font-bold text-blue-600">{paymentInfo.WavePay}</span></p>
                            <button onClick={() => handleCopy(paymentInfo.WavePay)} className="text-gray-400 hover:text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <select 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-500"
                        >
                            <option value="KPay">KBZPay</option>
                            <option value="WavePay">WavePay</option>
                        </select>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="ငွေပမာဏ (MMK)"
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                        <input 
                            type="text" 
                            value={txId}
                            onChange={e => setTxId(e.target.value)}
                            placeholder="ငွေလွှဲ ID (နောက်ဆုံးဂဏန်းများ)"
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                        <input 
                            type="text" 
                            value={senderName}
                            onChange={e => setSenderName(e.target.value)}
                            placeholder="ငွေပို့သူ အမည် / ဖုန်း"
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                        <button 
                            onClick={handleRequestTopup}
                            disabled={isRequesting}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded mt-2 shadow disabled:opacity-50"
                        >
                            {isRequesting ? 'ပို့ဆောင်နေသည်...' : 'ငွေဖြည့်ရန် တောင်းဆိုမည်'}
                        </button>
                    </div>
                </div>
            )}
        </div>

        <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 flex-shrink-0 text-slate-700">ငွေကြေး မှတ်တမ်း</h3>
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {historyItems.length > 0 ? (
                historyItems.map((item, index) => {
                    if (item.type === 'trip') {
                        const trip = item.data as Trip;
                        const appliedRate = trip.appliedRate ?? commissionRate;
                        const appliedFee = trip.appliedPlatformFee ?? platformFee;
                        const deduction = trip.commissionAmount || (appliedFee + Math.round((trip.fare - appliedFee) * (appliedRate / 100)));

                        return (
                            <div key={`trip-${trip.id}`} onClick={() => onViewTripDetails(trip)} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 p-2 rounded-full"><WalletIcon className="w-5 h-5 text-red-500"/></div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <p className="font-semibold text-slate-700 text-sm">ကော်မရှင် ဖြတ်တောက်ခြင်း</p>
                                            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 rounded font-bold">{trip.token}</span>
                                        </div>
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
                        const isWithdraw = tx.type === 'withdraw';
                        const isCredit = tx.type === 'credit';
                        const isDebit = tx.type === 'debit';
                        const isPending = tx.status === 'pending';
                        
                        const isPositive = isTopup || isCredit;
                        
                        let amountColor = isPending ? 'text-yellow-600' : (isPositive ? 'text-green-600' : 'text-red-500');
                        let sign = isPositive ? '+' : '-';
                        
                        let label = 'ငွေစာရင်း';
                        if(isTopup) label = 'ငွေဖြည့် တောင်းဆိုမှု';
                        if(isWithdraw) label = 'ငွေထုတ်';
                        if(isCredit) label = 'Admin ထည့်သွင်းငွေ';
                        if(isDebit) label = 'Admin နှုတ်ယူငွေ';
                        
                        if (isPending) label += ' (ဆိုင်းငံ့)';

                        return (
                            <div key={`tx-${index}`} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${isPending ? 'bg-yellow-100' : (isPositive ? 'bg-green-100' : 'bg-red-100')}`}>
                                        <WalletIcon className={`w-5 h-5 ${isPending ? 'text-yellow-600' : (isPositive ? 'text-green-600' : 'text-red-500')}`}/>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700 text-sm">{label}</p>
                                        <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                        {isPending && <p className="text-[10px] text-slate-400">{tx.method} • {tx.txId}</p>}
                                        {tx.reason && <p className="text-[10px] text-slate-500 italic">"{tx.reason}"</p>}
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
