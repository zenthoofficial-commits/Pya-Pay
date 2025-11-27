
import React from 'react';
import { Trip } from '../types';
import { TripStage } from '../App';
import { ChatIcon } from './Icons';
import { getCleanAddress } from '../utils/addressUtils';

interface OnTripUIProps {
  trip: Trip;
  tripStage: TripStage;
  onArrivedAtPickup: () => void;
  onStartTrip: () => void;
  onCompleteTrip: () => void;
  onOpenChat: () => void;
  lastSentMessage: string | null;
  isVisible: boolean;
  onToggleVisibility: () => void;
  isLoading?: boolean;
}

const OnTripUI: React.FC<OnTripUIProps> = ({ trip, tripStage, onArrivedAtPickup, onStartTrip, onCompleteTrip, onOpenChat, lastSentMessage, isVisible, onToggleVisibility, isLoading = false }) => {
  
  const getStageDetails = () => {
    switch(tripStage) {
      case 'to_pickup':
        return {
          title: "Going to Pickup",
          addressLabel: "PICKUP LOCATION",
          address: getCleanAddress(trip.pickupAddress),
          buttonText: isLoading ? "Processing..." : "Arrived at Pickup",
          buttonAction: onArrivedAtPickup,
          colorClass: "bg-amber-500 hover:bg-amber-600"
        };
      case 'at_pickup':
        return {
          title: "Waiting for Passenger",
          addressLabel: "PICKUP LOCATION",
          address: getCleanAddress(trip.pickupAddress),
          buttonText: isLoading ? "Starting Trip..." : "Start Trip",
          buttonAction: onStartTrip,
          colorClass: "bg-green-600 hover:bg-green-700"
        };
      case 'to_dropoff':
        return {
          title: "Driving to Dropoff",
          addressLabel: "DROPOFF LOCATION",
          address: getCleanAddress(trip.dropoffAddress),
          buttonText: isLoading ? "ပြီးဆုံးအောင် လုပ်ဆောင်နေသည်..." : "Complete Trip",
          buttonAction: onCompleteTrip,
          colorClass: "bg-blue-600 hover:bg-blue-700"
        };
      default:
        return {
          title: "ON ROAD",
          addressLabel: "DESTINATION",
          address: getCleanAddress(trip.dropoffAddress),
          buttonText: "Complete Trip",
          buttonAction: onCompleteTrip,
          colorClass: "bg-gray-800"
        };
    }
  };

  const { title, addressLabel, address, buttonText, buttonAction, colorClass } = getStageDetails();

  const handleCall = () => {
    if (trip.passengerPhone) {
      window.location.href = `tel:${trip.passengerPhone}`;
    } else {
      alert('ခရီးသည်၏ ဖုန်းနံပါတ်ကို မတွေ့ပါ။');
    }
  };

  return (
    <>
    <div className={`absolute bottom-0 left-0 right-0 p-4 z-10 transition-transform duration-500 ease-in-out transform ${isVisible ? 'translate-y-0' : 'translate-y-[calc(100%-86px)]'}`}>
      <div className="bg-white rounded-2xl p-5 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border border-gray-100">
        <div onClick={onToggleVisibility} className="flex justify-between items-center mb-3 cursor-pointer" role="button" aria-expanded={isVisible}>
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded border border-blue-100">
                    Token: {(trip as any).token || 'N/A'}
                </span>
            </div>
            <div className="bg-gray-100 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isVisible ? 'rotate-180' : ''}`}>
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-5">
            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">{addressLabel}</p>
            <p className="font-bold text-slate-800 text-lg leading-tight">{address}</p>
        </div>

        <div className="flex justify-around items-center mb-5">
          <button onClick={handleCall} className="flex flex-col items-center space-y-1 group">
            <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <span className="text-xs font-medium text-slate-600">Call</span>
          </button>
          
          <div className="h-10 w-px bg-gray-200"></div>

          <div className="relative">
             <button onClick={onOpenChat} className="flex flex-col items-center space-y-1 group">
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                    <ChatIcon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">Chat</span>
            </button>
             {lastSentMessage && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-slate-800 text-white text-xs rounded-lg px-3 py-1 shadow-lg animate-fade-in-out-subtle">
                    <p className="truncate">✓ "{lastSentMessage}"</p>
                </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={buttonAction}
          disabled={isLoading}
          className={`w-full ${colorClass} text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {buttonText}
        </button>
      </div>
    </div>
    <style>{`
        @keyframes fade-in-out-subtle {
            0% { opacity: 0; transform: translateY(10px) translateX(-50%); }
            15% { opacity: 1; transform: translateY(0) translateX(-50%); }
            85% { opacity: 1; transform: translateY(0) translateX(-50%); }
            100% { opacity: 0; transform: translateY(10px) translateX(-50%); }
        }
        .animate-fade-in-out-subtle {
            animation: fade-in-out-subtle 3s ease-in-out forwards;
        }
    `}</style>
    </>
  );
};

export default OnTripUI;
