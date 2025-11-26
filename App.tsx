import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, query as dbQuery, orderByChild, equalTo, update, remove, onValue, set, serverTimestamp, get, off } from 'firebase/database';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Trip, LatLngLiteral } from './types';
import { calculateTripDetails } from './services/tripService';
import { sendMessage } from './services/chatService';
import useLocation from './hooks/useLocation';

import { SOSIcon } from './components/Icons';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import ProfileModal from './components/ProfileModal';
import MapComponent, { MapHandles } from './components/MapComponent';
import TripRequestAlert from './components/TripRequestAlert';
import OnTripUI from './components/OnTripUI';
import EarningsModal from './components/EarningsModal';
import TripSummaryModal from './components/TripSummaryModal';
import DestinationInput from './components/DestinationInput';
import ChatModal from './components/ChatModal';
import ConfirmModal from './components/ConfirmModal';
import CancellationAlertModal from './components/CancellationAlertModal';
import LoginScreen from './components/LoginScreen';


declare global {
  interface Window {
    DeviceOrientationEvent: {
      prototype: DeviceOrientationEvent;
      new(type: string, eventInitDict?: DeviceOrientationEventInit): DeviceOrientationEvent;
      requestPermission?(): Promise<'granted' | 'denied'>;
    };
  }
}

export type TripStage = 'to_pickup' | 'at_pickup' | 'to_dropoff';

const QUICK_REPLIES = [
    "ခဏစောင့်ပါ၊ လာနေပါပြီ။",
    "ကျွန်တော်ရောက်ပါပြီ။",
    "ဘယ်နေရာမှာ စောင့်နေတာလဲ ခင်ျဗာ။",
    "လမ်းပိတ်နေလို့ ခဏလောက်စောင့်ပေးပါနော်။",
    "ဟုတ်ကဲ့၊ ကျေးဇူးတင်ပါတယ်။",
];

const QuickReplyPopup: React.FC<{onSend: (msg: string) => void, onOpenChat: () => void, onClose: () => void}> = ({ onSend, onOpenChat, onClose }) => {
    return (
        <>
            <div className="absolute inset-0 bg-black/60 z-20" onClick={onClose}></div>
            <div className="absolute bottom-16 left-4 right-4 bg-gray-900 border border-green-500 rounded-xl p-4 shadow-lg z-20 space-y-2 animate-slide-up">
                 {QUICK_REPLIES.map((reply, index) => (
                    <button
                        key={index}
                        onClick={() => onSend(reply)}
                        className="w-full text-left bg-gray-800 text-green-300 p-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                        {reply}
                    </button>
                ))}
                <div className="border-t border-gray-700 pt-2">
                     <button
                        onClick={onOpenChat}
                        className="w-full text-center bg-gray-700 text-green-400 p-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold"
                    >
                        Chat Box ဖွင့်ပါ
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </>
    )
}

const getHaversineDistance = (p1: LatLngLiteral, p2: LatLngLiteral): number => {
    const R = 6371e3; // Earth's radius in metres
    const φ1 = p1.lat * Math.PI/180;
    const φ2 = p2.lat * Math.PI/180;
    const Δφ = (p2.lat-p1.lat) * Math.PI/180;
    const Δλ = (p2.lng-p1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEarnings, setShowEarnings] = useState(false);
  const [tripRequests, setTripRequests] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripStage, setTripStage] = useState<TripStage | null>(null);
  const { location, heading, error: locationError } = useLocation();
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [balance, setBalance] = useState(0);

  const [onTripUIVisible, setOnTripUIVisible] = useState(true);
  const [viewingTripSummary, setViewingTripSummary] = useState<Trip | null>(null);

  const [destinationFilter, setDestinationFilter] = useState<{ address: string; location: LatLngLiteral } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState<string | null>(null);
  const [cancellationAlert, setCancellationAlert] = useState<{ show: boolean; fee: number | null }>({ show: false, fee: null });

  const tripRequestAudioRef = useRef<HTMLAudioElement | null>(null);
  const locationRef = useRef(location);
  const mapRef = useRef<MapHandles>(null);
  const hasPlayedSoundForCurrentRequests = useRef(false);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);
  
  // Main effect for auth and data loading
  useEffect(() => {
    let profileUnsubscribe: (() => void) | undefined;
    let historyUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        // Cleanup previous listeners if any
        if (profileUnsubscribe) profileUnsubscribe();
        if (historyUnsubscribe) historyUnsubscribe();

        setUser(currentUser);
        setDriverId(null);
        setIsOnline(false);
        setTripHistory([]);
        setActiveTrip(null);
        setTripStage(null);
        setIsDataLoaded(false);
        setTripRequests([]);
        setBalance(0);

        if (currentUser) {
            const currentDriverId = currentUser.uid;
            setDriverId(currentDriverId);

            try {
                // Ensure driver profile exists
                const driverProfileRef = ref(db, `drivers/${currentDriverId}`);
                const profileSnap = await get(driverProfileRef);
                
                // If profile is deleted by Admin (or doesn't exist), force logout
                if (!profileSnap.exists()) {
                     alert("Account not found. Please contact Admin.");
                     await signOut(auth);
                     setIsAuthenticating(false);
                     return;
                }

                // 1. Listen for Profile changes (isOnline, walletBalance, Ban check)
                profileUnsubscribe = onValue(driverProfileRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setIsOnline(data.isOnline || false);
                        setBalance(data.walletBalance || 0); // Update balance from DB
                    } else {
                        // Account deleted while logged in
                        alert("Account disabled by Admin.");
                        signOut(auth);
                    }
                });

                // 2. Listen for Completed Trips (tripHistory)
                const completedTripsRef = ref(db, `completedTrips/${currentDriverId}`);
                historyUnsubscribe = onValue(completedTripsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const tripsData = snapshot.val();
                        const tripsArray = Object.values(tripsData) as Trip[];
                        setTripHistory(tripsArray.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)));
                    } else {
                        setTripHistory([]);
                    }
                });

                // 3. Check for active trip
                const activeTripQuery = dbQuery(ref(db, 'trips'), orderByChild('driverId'), equalTo(currentDriverId));
                const tripSnapshot = await get(activeTripQuery);

                if (tripSnapshot.exists()) {
                    const trips = tripSnapshot.val();
                    const ongoingTripEntry = Object.entries(trips).find(([_id, trip]) => 
                        ['accepted', 'at_pickup', 'to_dropoff'].includes((trip as Trip).status)
                    );

                    if (ongoingTripEntry && locationRef.current) {
                        const [id, tripData] = ongoingTripEntry;
                        const tripToResume = { id, ...(tripData as Omit<Trip, 'id'>) };
                        const details = await calculateTripDetails(locationRef.current, tripToResume.pickup, tripToResume.dropoff);
                        const fullTripData = { ...tripToResume, ...details };
                        
                        setActiveTrip(fullTripData);
                        switch(fullTripData.status) {
                            case 'accepted': setTripStage('to_pickup'); break;
                            case 'at_pickup': setTripStage('at_pickup'); break;
                            case 'to_dropoff': setTripStage('to_dropoff'); break;
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load driver data:", e);
                setFirestoreError("Could not load driver data.");
            } finally {
                setIsDataLoaded(true);
                setIsAuthenticating(false);
            }
        } else {
            setIsDataLoaded(true);
            setIsAuthenticating(false);
        }
    });

    return () => {
        authUnsubscribe();
        if (profileUnsubscribe) profileUnsubscribe();
        if (historyUnsubscribe) historyUnsubscribe();
    };
  }, []);


  useEffect(() => {
    tripRequestAudioRef.current = new Audio("data:audio/wav;base64,UklGRlFFT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUFENQDI7PAA8gDwAPUA9ADzAPIBAAIEAwQDBAIBAAAAAP8A/gD4APUA8gDxAPIA8gDzAO8A7ADoAN4A2gDYANoA3gDkAO0A9AEAAv9//wD+APwA+gD7AP0AAQIDBAUGBwgJCgsMDQ4PDxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==");
  }, []);

  // Listen for trip requests
  useEffect(() => {
    if (!isOnline || activeTrip || !driverId) {
      setTripRequests([]);
      return;
    }
      
    const tripsRef = ref(db, "trips");
    const q = dbQuery(tripsRef, orderByChild("status"), equalTo("pending"));

    const unsubscribe = onValue(q, async (snapshot) => {
      const tripsData = snapshot.val();
      if (tripsData) {
        const potentialTripsPromises = Object.entries(tripsData)
          .map(([id, data]) => ({ id, ...(data as any) }))
          .filter(trip => {
             if (trip.requestedDriverId && trip.requestedDriverId !== driverId) return false;
             return !trip.driverId;
          })
          .map(async (trip) => {
            const currentLocation = locationRef.current;
            if (!currentLocation) return null;

            const details = await calculateTripDetails(currentLocation, trip.pickup, trip.dropoff);
            // Even if route calculation fails, show the trip but with default values to avoid hiding requests
            const validTrip: Trip = { 
                ...trip, 
                ...details,
                // Fallback details if calculation failed
                pickupLeg: details.pickupLeg || { distance: 'Unknown', duration: 'Unknown' },
                dropoffLeg: details.dropoffLeg || { distance: 'Unknown', duration: 'Unknown' }
            };

            if (destinationFilter && !trip.requestedDriverId) {
              const pickupToDriverDist = getHaversineDistance(
                currentLocation,
                validTrip.pickup
              );
              if (pickupToDriverDist > 5000) return null;
            }
            return validTrip;
          });
        
        const resolvedTrips = (await Promise.all(potentialTripsPromises)).filter((t): t is Trip => t !== null);
        setTripRequests(resolvedTrips.sort((a,b) => b.fare - a.fare));
      } else {
        setTripRequests([]);
      }
    });
    
    return () => unsubscribe();
  }, [isOnline, activeTrip, destinationFilter, driverId]);

  // Audio Notifications
  useEffect(() => {
    if (isOnline && !activeTrip) {
      if (tripRequests.length > 0 && !hasPlayedSoundForCurrentRequests.current) {
        tripRequestAudioRef.current?.play().catch(e => console.warn("Audio autoplay failed.", e));
        hasPlayedSoundForCurrentRequests.current = true;
      } else if (tripRequests.length === 0) {
        hasPlayedSoundForCurrentRequests.current = false;
      }
    }
  }, [isOnline, activeTrip, tripRequests.length]);

  // Active Trip Cancellation Listener
  useEffect(() => {
    if (!activeTrip || !activeTrip.id) return;
    const tripRef = ref(db, `trips/${activeTrip.id}`);
    const unsubscribe = onValue(tripRef, async (snapshot) => {
        if (snapshot.exists()) {
            const updatedTripData = snapshot.val() as Trip;
            if (updatedTripData.status === 'cancelled') {
                const cancellationFee = updatedTripData.cancellationFee || null;
                setCancellationAlert({ show: true, fee: cancellationFee });
                
                if (cancellationFee && cancellationFee > 0 && driverId) {
                     // Update balance directly (simulating backend logic)
                     const newBal = balance + cancellationFee;
                     await update(ref(db, `drivers/${driverId}`), { walletBalance: newBal });
                }
            }
        }
    });
    return () => unsubscribe();
  }, [activeTrip, balance, driverId]);

  // Update Driver Location
  useEffect(() => {
    if (isOnline && location && driverId) {
      const driverLocationRef = ref(db, `driverLocations/${driverId}`);
      const locationData = {
        lat: location.lat,
        lng: location.lng,
        heading: heading ?? 0,
        isAvailable: !activeTrip,
        timestamp: serverTimestamp()
      };
      set(driverLocationRef, locationData);
    }
  }, [location, heading, isOnline, driverId, activeTrip]);

  const handleAcceptTrip = async (tripId: string) => {
    if (!driverId) return;
    const tripToAccept = tripRequests.find(t => t.id === tripId);
    if (!tripToAccept) return;
    setActiveTrip(tripToAccept);
    setTripStage('to_pickup');
    setTripRequests([]);
    const tripRef = ref(db, `trips/${tripId}`);
    try {
        await update(tripRef, { status: 'accepted', driverId: driverId });
        const driverRef = ref(db, `drivers/${driverId}`);
        await update(driverRef, { isAvailable: false });
    } catch (e) {
        console.error("Error accepting trip: ", e);
        alert("Trip could not be accepted. Please try again.");
        setActiveTrip(null);
        setTripStage(null);
    }
  };
  
  const handleGoOnline = async () => {
    if (!driverId) return;
    if (tripRequestAudioRef.current) tripRequestAudioRef.current.load();
    if (typeof window.DeviceOrientationEvent?.requestPermission === 'function') await window.DeviceOrientationEvent.requestPermission();
    if (Notification.permission !== "granted") await Notification.requestPermission();
    
    await update(ref(db, `drivers/${driverId}`), { isOnline: true, isAvailable: !activeTrip });
    setIsOnline(true);
  }

  const handleGoOffline = () => {
    if (driverId) {
        remove(ref(db, `driverLocations/${driverId}`));
        update(ref(db, `drivers/${driverId}`), { isOnline: false, isAvailable: false });
    }
    setIsOnline(false);
  };

  const handleDeclineTrip = (tripId: string) => setTripRequests(prev => prev.filter(t => t.id !== tripId));
  
  const handleArrivedAtPickup = async () => {
    if (!activeTrip) return;
    await update(ref(db, `trips/${activeTrip.id}`), { status: 'at_pickup' });
    setTripStage('at_pickup');
  };

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    await update(ref(db, `trips/${activeTrip.id}`), { status: 'to_dropoff' });
    setTripStage('to_dropoff');
  };

  const handleCompleteTrip = async () => {
    if (activeTrip && driverId) {
        const completedTrip = { ...activeTrip, completedAt: Date.now() };
        
        // 1. Save History
        await set(ref(db, `completedTrips/${driverId}/${activeTrip.id}`), completedTrip);
        await set(ref(db, `passengers/${activeTrip.passengerId}/completedTrips/${activeTrip.id}`), completedTrip);

        // 2. Update Balance (Simulated Backend Logic)
        // 14% Commission deduction logic
        const driverGets = activeTrip.fare - Math.round(activeTrip.fare * 0.14);
        const newBalance = balance + driverGets;
        await update(ref(db, `drivers/${driverId}`), { walletBalance: newBalance, isAvailable: true });

        // 3. Cleanup Active Trip
        await remove(ref(db, `trips/${activeTrip.id}`));
        
        setViewingTripSummary(completedTrip);
        setOnTripUIVisible(true);
    }
  };
  
  const handleCloseTripSummary = () => {
    setViewingTripSummary(null);
    setActiveTrip(null);
    setTripStage(null);
  };
  
  const handleViewTripDetails = (trip: Trip) => {
      setShowEarnings(false);
      setViewingTripSummary(trip);
  }

  const handleSOSConfirm = () => {
    setShowSOSConfirm(false);
    alert("အရေးပေါ်အချက်ပေး ပို့လိုက်ပါပြီ။");
  }

  const handleToggleQuickReplies = () => setShowQuickReplies(prev => !prev);

  const handleSendQuickReply = async (message: string) => {
      if (!activeTrip) return;
      await sendMessage(activeTrip.id, message);
      setLastSentMessage(message);
      setShowQuickReplies(false);
      setTimeout(() => setLastSentMessage(null), 3000);
  };

  const handleOpenFullChat = () => { setShowQuickReplies(false); setIsChatOpen(true); };

  const handleCloseCancellationAlert = async () => {
    if (!driverId) return;
    setCancellationAlert({ show: false, fee: null });
    setActiveTrip(null);
    setTripStage(null);
    await update(ref(db, `drivers/${driverId}`), { isAvailable: true });
  };

  if (isAuthenticating || (user && !isDataLoaded)) return <LoadingScreen />;
  if (!user) return <LoginScreen />;
  if (!location) return <LoadingScreen />;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-green-300">
      <MapComponent ref={mapRef} userLocation={location} userHeading={heading} activeTrip={activeTrip} tripStage={tripStage} />
      
      {activeTrip && tripStage && !viewingTripSummary ? (
        <OnTripUI 
          trip={activeTrip} 
          tripStage={tripStage}
          onArrivedAtPickup={handleArrivedAtPickup}
          onStartTrip={handleStartTrip}
          onCompleteTrip={handleCompleteTrip} 
          onOpenChat={handleToggleQuickReplies}
          lastSentMessage={lastSentMessage}
          isVisible={onTripUIVisible}
          onToggleVisibility={() => { setOnTripUIVisible(v => !v); setShowQuickReplies(false); }}
        />
      ) : (
         <Header balance={balance} onProfileClick={() => setShowProfile(true)} onWalletClick={() => setShowEarnings(true)} />
      )}
      
      {showProfile && driverId && 
        <ProfileModal 
          driverId={driverId} 
          onClose={() => setShowProfile(false)} 
          isOnline={isOnline} 
          onGoOnline={handleGoOnline}
          onGoOffline={handleGoOffline}
        />
      }
      {showEarnings && driverId && <EarningsModal driverId={driverId} onClose={() => setShowEarnings(false)} balance={balance} tripHistory={tripHistory} onViewTripDetails={handleViewTripDetails} />}
      {viewingTripSummary && <TripSummaryModal trip={viewingTripSummary} onClose={handleCloseTripSummary} />}
      {isChatOpen && activeTrip && <ChatModal tripId={activeTrip.id} onClose={() => setIsChatOpen(false)} />}
      {cancellationAlert.show && <CancellationAlertModal fee={cancellationAlert.fee} onClose={handleCloseCancellationAlert} />}
      {showSOSConfirm && <ConfirmModal title="Emergency Alert" message="Are you sure you want to trigger the emergency alert?" onConfirm={handleSOSConfirm} onCancel={() => setShowSOSConfirm(false)} />}
      {showQuickReplies && activeTrip && <QuickReplyPopup onSend={handleSendQuickReply} onOpenChat={handleOpenFullChat} onClose={() => setShowQuickReplies(false)} />}

      {tripRequests.length > 0 && isOnline && !activeTrip && <TripRequestAlert trip={tripRequests[0]} onAccept={handleAcceptTrip} onDecline={handleDeclineTrip} />}

      {!activeTrip && !viewingTripSummary && (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center space-y-2 pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
                 {isOnline && <DestinationInput onDestinationSet={setDestinationFilter} />}
                 <div className="h-2"></div>
                {isOnline && tripRequests.length === 0 && (
                    <p className="text-green-300 bg-black/60 px-3 py-1 rounded-full text-sm mb-2 shadow-md text-center">ခရီးစဉ်များ ရှာဖွေနေသည်...</p>
                )}
                {isOnline ? (
                    <button onClick={handleGoOffline} className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-500 transition-all duration-300">
                        အော့ဖ်လိုင်းသို့ သွားပါ
                    </button>
                ) : (
                    <button onClick={handleGoOnline} className="w-full bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105">
                        အွန်လိုင်းသို့ သွားပါ
                    </button>
                )}
            </div>
        </div>
      )}

      {!viewingTripSummary && (
          <div className={`absolute right-4 flex flex-col space-y-3 z-10 transition-all duration-500 ${activeTrip ? 'top-4' : 'top-24'}`}>
              <SOSButton onClick={() => setShowSOSConfirm(true)} />
              <button onClick={() => mapRef.current?.recenter()} className="bg-black/70 p-3 rounded-full shadow-lg border border-gray-700 hover:bg-gray-800" aria-label="Recenter map">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="#39FF14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-300"><path d="M12 8V4H8" stroke="none"/><path d="M12 20v-4h4" stroke="none"/><path d="M4 12H8v4" stroke="none"/><path d="M20 12h-4V8" stroke="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="3" stroke="none"/></svg>
              </button>
          </div>
      )}
      {firestoreError && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-500 text-black p-4 rounded-md z-20">{firestoreError}</div>}
      {locationError && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white p-2 rounded-md z-20">{locationError}</div>}
    </div>
  );
};

const SOSButton: React.FC<{onClick: () => void}> = ({onClick}) => (
    <button onClick={onClick} className="bg-red-600/80 p-3 rounded-full shadow-lg z-10 border border-red-400 hover:bg-red-500 transition-all animate-pulse"><SOSIcon className="h-6 w-6 text-white" /></button>
)

export default App;