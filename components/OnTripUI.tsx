
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
}

const OnTripUI: React.FC<OnTripUIProps> = ({ trip, tripStage, onArrivedAtPickup, onStartTrip, onCompleteTrip, onOpenChat, lastSentMessage, isVisible, onToggleVisibility }) => {
  
  const getStageDetails = () => {
    switch(tripStage) {
      case 'to_pickup':
        return {
          title: "ခရီးသည်ဆီသို့ သွားနေသည်",
          addressLabel: "ခေါ်ရန်နေရာ",
          address: getCleanAddress(trip.pickupAddress),
          buttonText: "ခေါ်ရန်နေရာသို့ ရောက်ပါပြီ",
          buttonAction: onArrivedAtPickup
        };
      case 'at_pickup':
        return {
          title: "ခရီးသည်ကို စောင့်နေသည်",
          addressLabel: "ခေါ်ရန်နေရာ",
          address: getCleanAddress(trip.pickupAddress),
          buttonText: "ခရီးစဉ် စတင်ပါ",
          buttonAction: onStartTrip
        };
      case 'to_dropoff':
        return {
          title: "ပို့ဆောင်ရန်နေရာသို့ သွားနေသည်",
          addressLabel: "ပို့ရန်နေရာ",
          address: getCleanAddress(trip.dropoffAddress),
          buttonText: "ခရီးစဉ် ပြီးဆုံးပါပြီ",
          buttonAction: onCompleteTrip
        };
      default:
        return {
          title: "ON ROAD",
          addressLabel: "DESTINATION",
          address: getCleanAddress(trip.dropoffAddress),
          buttonText: "Complete Trip",
          buttonAction: onCompleteTrip
        };
    }
  };

  const { title, addressLabel, address, buttonText, buttonAction } = getStageDetails();

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
      <div className="bg-gray-900 border border-green-500 rounded-xl p-4 shadow-lg shadow-green-500/20">
        <div onClick={onToggleVisibility} className="flex justify-between items-center mb-2 cursor-pointer" role="button" aria-expanded={isVisible}>
            <h2 className="text-xl font-bold text-center text-green-300">{title}</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-6 w-6 text-green-300 transition-transform duration-300 ${isVisible ? 'rotate-180' : ''}`}>
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-md mb-4">
            <p className="text-sm text-gray-400">{addressLabel}</p>
            <p className="font-semibold text-white">{address}</p>
        </div>

        <div className="flex justify-around items-center mb-4">
          <button onClick={handleCall} className="flex flex-col items-center space-y-1 text-green-300 hover:text-green-500">
            <div className="bg-green-500 p-3 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div>
            <span className="text-xs">ခေါ်ဆိုရန်</span>
          </button>
          <div className="relative">
             <button onClick={onOpenChat} className="flex flex-col items-center space-y-1 text-green-300 hover:text-green-500">
                <div className="bg-green-500 p-3 rounded-full">
                    <ChatIcon className="w-6 h-6 text-black" />
                </div>
                <span className="text-xs">Chat</span>
            </button>
             {lastSentMessage && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-green-800 border border-green-600 text-green-100 text-xs rounded-lg px-3 py-1 shadow-lg animate-fade-in-out-subtle">
                    <p className="truncate">✓ "{lastSentMessage}"</p>
                </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={buttonAction}
          className="w-full bg-green-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-colors"
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
