import React from 'react';
import { Trip } from '../types';

interface TripSummaryModalProps {
  trip: Trip;
  onClose: () => void;
}

const FareRow: React.FC<{ label: string; amount: number; isSub?: boolean; isTotal?: boolean }> = ({ label, amount, isSub = false, isTotal = false }) => (
    <div className={`flex justify-between items-center py-2 ${isSub ? 'pl-4 text-sm' : ''} ${isTotal ? 'font-bold text-lg border-t border-green-700 mt-2 pt-3' : ''}`}>
        <p className={isSub ? 'text-gray-400' : 'text-green-300'}>{label}</p>
        <p className={`${isTotal ? 'text-green-300' : 'text-white'}`}>{amount.toLocaleString()} MMK</p>
    </div>
);

const TripSummaryModal: React.FC<TripSummaryModalProps> = ({ trip, onClose }) => {
    // Calculations based on user request
    const totalFare = trip.fare;
    const platformFee = 100;
    const tripMoney = totalFare - platformFee;
    const commission = Math.round(tripMoney * 0.14);
    const driverGets = tripMoney - commission;

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 z-20 flex justify-center items-center p-4 animate-fade-in">
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
            <div className="bg-gray-900 border border-green-500 rounded-xl w-full max-w-md p-6 text-green-300 shadow-lg shadow-green-500/30">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold">ခရီးစဉ် ပြီးဆုံးပါပြီ</h2>
                    <p className="text-gray-400">ဝင်ငွေ အသေးစိတ်</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 space-y-1">
                    <FareRow label="စုစုပေါင်း ခရီးစဉ်ခ" amount={totalFare} />
                    
                    <div className="flex justify-end items-center py-1">
                       <div className="border-t border-dashed border-gray-600 flex-grow ml-24"></div>
                       <p className="text-xs text-gray-500 mx-2">Breakdown</p>
                    </div>

                    <FareRow label="ခရီးစဉ်အတွက် ငွေသား" amount={tripMoney} isSub />
                    <FareRow label="ပလက်ဖောင်း ဝန်ဆောင်မှုခ" amount={-platformFee} isSub />
                    <FareRow label="ကော်မရှင် (14%)" amount={-commission} isSub />

                    <FareRow label="သင်ရရှိငွေ" amount={driverGets} isTotal />
                </div>
                
                <button 
                    onClick={onClose}
                    className="mt-8 w-full bg-green-600 text-black font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors"
                >
                    ပြီးပြီ
                </button>
            </div>
        </div>
    );
};

export default TripSummaryModal;