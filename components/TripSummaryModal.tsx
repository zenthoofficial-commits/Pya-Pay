
import React from 'react';
import { Trip } from '../types';

interface TripSummaryModalProps {
  trip: Trip;
  onClose: () => void;
  commissionRate: number;
  platformFee: number;
}

const FareRow: React.FC<{ label: string; amount: number; isSub?: boolean; isTotal?: boolean; isDeduction?: boolean }> = ({ label, amount, isSub = false, isTotal = false, isDeduction = false }) => (
    <div className={`flex justify-between items-center py-2 ${isSub ? 'pl-4 text-sm' : ''} ${isTotal ? 'font-bold text-lg border-t border-gray-200 mt-2 pt-3' : ''}`}>
        <p className={isSub ? 'text-slate-500' : 'text-slate-800 font-medium'}>{label}</p>
        <p className={`${isTotal ? 'text-blue-600' : (isDeduction ? 'text-red-500' : 'text-slate-800')}`}>{amount.toLocaleString()} Ks</p>
    </div>
);

const TripSummaryModal: React.FC<TripSummaryModalProps> = ({ trip, onClose, commissionRate, platformFee }) => {
    // Calculations based on dynamic settings passed via props
    const totalFare = trip.fare;
    
    // Formula: Platform Fee + (Fare - Platform Fee) * Rate%
    const commission = Math.round((totalFare - platformFee) * (commissionRate / 100));
    const totalDeduction = platformFee + commission;

    return (
        <div className="absolute inset-0 bg-black/60 z-30 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in">
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 text-slate-800 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Trip Completed!</h2>
                    <p className="text-sm font-bold bg-blue-50 text-blue-600 inline-block px-3 py-1 rounded-full mt-2">Token: {(trip as any).token || 'N/A'}</p>
                    <p className="text-slate-500 mt-1">Income Breakdown</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-1 border border-gray-100">
                    <FareRow label="Total Fare (from Passenger)" amount={totalFare} />
                    
                    <div className="flex justify-end items-center py-1">
                       <div className="border-t border-dashed border-gray-300 flex-grow ml-12"></div>
                       <p className="text-xs text-slate-400 mx-2 uppercase font-bold">Deductions</p>
                    </div>

                    <FareRow label="Platform Fee" amount={-platformFee} isSub isDeduction />
                    <FareRow label={`Commission (${commissionRate}%)`} amount={-commission} isSub isDeduction />

                    <div className="mt-4 pt-2 border-t border-gray-200">
                         <div className="flex justify-between items-center">
                            <p className="font-bold text-red-500">Total Deducted from Wallet</p>
                            <p className="font-bold text-red-500">-{totalDeduction.toLocaleString()} Ks</p>
                        </div>
                         <p className="text-xs text-gray-400 mt-1 text-right">*(You keep the cash fare)*</p>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default TripSummaryModal;
