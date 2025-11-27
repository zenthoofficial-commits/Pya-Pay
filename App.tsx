
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onChildAdded, query as dbQuery, orderByChild, equalTo, update, remove, onValue, set, serverTimestamp, get, off } from 'firebase/database';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
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
            <div className="absolute inset-0 bg-black/30 z-20" onClick={onClose}></div>
            <div className="absolute bottom-24 left-4 right-4 bg-white border border-gray-200 rounded-xl p-4 shadow-xl z-20 space-y-2 animate-slide-up">
                 {QUICK_REPLIES.map((reply, index) => (
                    <button
                        key={index}
                        onClick={() => onSend(reply)}
                        className="w-full text-left bg-gray-50 text-slate-800 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm border border-gray-200"
                    >
                        {reply}
                    </button>
                ))}
                <div className="border-t border-gray-200 pt-2">
                     <button
                        onClick={onOpenChat}
                        className="w-full text-center bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);

  // Dynamic Fees
  const [fees, setFees] = useState({ commissionRate: 14, platformFee: 100 });

  const [onTripUIVisible, setOnTripUIVisible] = useState(true);
  const [viewingTripSummary, setViewingTripSummary] = useState<Trip | null>(null);

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
    const dataListeners: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        dataListeners.forEach(l => l());
        dataListeners.length = 0;

        setUser(currentUser);
        setDriverId(null);
        setIsOnline(false);
        setTripHistory([]);
        setTransactions([]);
        setActiveTrip(null);
        setTripStage(null);
        setIsDataLoaded(false);
        setTripRequests([]);

        if (currentUser) {
            const currentDriverId = currentUser.uid;
            setDriverId(currentDriverId);

            try {
                // Fetch Settings first
                const settingsRef = ref(db, 'settings/fees');
                const settingsListener = onValue(settingsRef, (snap) => {
                    if(snap.exists()) setFees(snap.val());
                });
                dataListeners.push(() => off(settingsRef, 'value', settingsListener));

                const driverProfileRef = ref(db, `drivers/${currentDriverId}`);
                const profileSnap = await get(driverProfileRef);
                if (!profileSnap.exists()) {
                     console.error("Driver profile not found. Logging out.");
                     await auth.signOut();
                     return;
                }

                // 1. Listen for Profile (Bans & Online Status)
                const driverRef = ref(db, `drivers/${currentDriverId}`);
                const profileListener = onValue(driverRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        // BAN CHECK
                        if (data.bannedUntil && data.bannedUntil > Date.now()) {
                            alert(`Your account has been suspended until ${new Date(data.bannedUntil).toLocaleDateString()}.`);
                            auth.signOut();
                            return;
                        }
                        setIsOnline(data.isOnline || false);
                    } else {
                        auth.signOut();
                    }
                });
                dataListeners.push(() => off(driverRef, 'value', profileListener));

                // 2. Listen for Completed Trips (tripHistory) & Auto Delete
                const completedTripsRef = ref(db, `completedTrips/${currentDriverId}`);
                const historyListener = onValue(completedTripsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const tripsData = snapshot.val();
                        const tripsArray = Object.values(tripsData) as Trip[];
                        
                        const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
                        tripsArray.forEach(trip => {
                             if (trip.completedAt && trip.completedAt < twoDaysAgo) {
                                 remove(ref(db, `completedTrips/${currentDriverId}/${trip.id}`));
                             }
                        });

                        setTripHistory(tripsArray.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)));
                    } else {
                        setTripHistory([]);
                    }
                });
                dataListeners.push(() => off(completedTripsRef, 'value', historyListener));

                // 3. Listen for Transactions
                const transactionsRef = ref(db, `transactions/${currentDriverId}`);
                const txListener = onValue(transactionsRef, (snapshot) => {
                    if (snapshot.exists()) {
                         const txData = snapshot.val();
                         const txArray = Object.keys(txData).map(key => ({ id: key, ...txData[key] }));
                         setTransactions(txArray.sort((a,b) => b.date - a.date));
                    } else {
                        setTransactions([]);
                    }
                });
                dataListeners.push(() => off(transactionsRef, 'value', txListener));

                // 4. Check for active trip
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
        unsubscribeAuth();
        dataListeners.forEach(l => l());
    };
}, []);

  useEffect(() => {
    let currentBalance = 0;

    transactions.forEach(tx => {
        if (tx.type === 'topup' && tx.status === 'approved') {
            currentBalance += tx.amount;
        } else if (tx.type === 'withdraw') {
             currentBalance -= tx.amount;
        }
    });

    tripHistory.forEach(trip => {
        // Calculate based on dynamic rates, but preferably utilize stored values on trip if available
        // For new trips, we store the commissionAmount. For legacy, we compute.
        // Formula: platformFee + ((fare - platformFee) * rate/100)
        
        let deduction = 0;
        // @ts-ignore - Check if trip has stored commission data
        if (trip.commissionAmount) {
             // @ts-ignore
            deduction = trip.commissionAmount;
        } else {
            // Fallback to current settings if not stored
            deduction = fees.platformFee + Math.round((trip.fare - fees.platformFee) * (fees.commissionRate / 100));
        }
        currentBalance -= deduction;
    });

    setBalance(currentBalance);
  }, [tripHistory, transactions, fees]);


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

    const listener = onValue(q, async (snapshot) => {
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
            if (!details.pickupLeg || !details.dropoffLeg) return null;

            const validTrip: Trip = { ...trip, ...details };
            return validTrip;
          });
        
        const resolvedTrips = (await Promise.all(potentialTripsPromises)).filter((t): t is Trip => t !== null);
        setTripRequests(resolvedTrips.sort((a,b) => b.fare - a.fare));
      } else {
        setTripRequests([]); 
      }
    }, (error) => {
      console.error("RTDB listener error:", error);
    });
    
    return () => listener();
  }, [isOnline, activeTrip, driverId]);


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

  // Listen for cancellation
  useEffect(() => {
    if (!activeTrip || !activeTrip.id) return;

    const tripRef = ref(db, `trips/${activeTrip.id}`);
    const unsubscribe = onValue(tripRef, (snapshot) => {
        if (snapshot.exists()) {
            const updatedTripData = snapshot.val() as Trip;
            if (updatedTripData.status === 'cancelled') {
                const cancellationFee = updatedTripData.cancellationFee || null;
                setCancellationAlert({ show: true, fee: cancellationFee });
            }
        }
    });

    return () => unsubscribe();
  }, [activeTrip]);

  // Update driver location
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
    if (tripRequestAudioRef.current) {
        tripRequestAudioRef.current.load();
    }
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        await window.DeviceOrientationEvent.requestPermission();
    }
    if (Notification.permission !== "granted") {
        await Notification.requestPermission();
    }
    
    const driverRef = ref(db, `drivers/${driverId}`);
    await update(driverRef, { isOnline: true, isAvailable: !activeTrip });
    setIsOnline(true);
  }

  const handleGoOffline = () => {
    if (driverId) {
        remove(ref(db, `driverLocations/${driverId}`));
        const driverRef = ref(db, `drivers/${driverId}`);
        update(driverRef, { isOnline: false, isAvailable: false });
    }
    setIsOnline(false);
  };

  const handleDeclineTrip = (tripId: string) => {
      setTripRequests(prev => prev.filter(t => t.id !== tripId));
  };
  
  const handleArrivedAtPickup = async () => {
    if (!activeTrip) return;
    try {
        const tripRef = ref(db, `trips/${activeTrip.id}`);
        await update(tripRef, { status: 'at_pickup' });
        setTripStage('at_pickup');
    } catch (e) {
        console.error("Failed to update trip status to at_pickup:", e);
    }
  };

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    try {
        const tripRef = ref(db, `trips/${activeTrip.id}`);
        await update(tripRef, { status: 'to_dropoff' });
        setTripStage('to_dropoff');
    } catch (e) {
        console.error("Failed to update trip status to to_dropoff:", e);
    }
  };

  const handleCompleteTrip = async () => {
    if (activeTrip && driverId) {
        // Calculate commission to snapshot it
        const commissionAmount = fees.platformFee + Math.round((activeTrip.fare - fees.platformFee) * (fees.commissionRate / 100));

        const completedTrip = { 
            ...activeTrip, 
            completedAt: Date.now(),
            commissionAmount: commissionAmount,
            appliedRate: fees.commissionRate,
            appliedPlatformFee: fees.platformFee
        };
        
        const completedTripRef = ref(db, `completedTrips/${driverId}/${activeTrip.id}`);
        await set(completedTripRef, completedTrip);

        const passengerHistoryRef = ref(db, `passengers/${activeTrip.passengerId}/completedTrips/${activeTrip.id}`);
        await set(passengerHistoryRef, completedTrip);

        await remove(ref(db, `trips/${activeTrip.id}`));
        
        const driverRef = ref(db, `drivers/${driverId}`);
        await update(driverRef, { isAvailable: true });

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
    alert("အရေးပေါ်အချက်ပေး ပို့လိုက်ပါပြီ။ သင်၏တည်နေရာကို ဘေးကင်းရေးအဖွဲ့ထံ မျှဝေလိုက်ပါသည်။");
  }

  const handleToggleQuickReplies = () => {
      setShowQuickReplies(prev => !prev);
  };

  const handleSendQuickReply = async (message: string) => {
      if (!activeTrip) return;
      await sendMessage(activeTrip.id, message);
      setLastSentMessage(message);
      setShowQuickReplies(false);
      setTimeout(() => {
          setLastSentMessage(null);
      }, 3000); 
  };

  const handleOpenFullChat = () => {
      setShowQuickReplies(false);
      setIsChatOpen(true);
  };

  const handleCloseCancellationAlert = async () => {
    if (!driverId) return;
    setCancellationAlert({ show: false, fee: null });
    setActiveTrip(null);
    setTripStage(null);

    const driverRef = ref(db, `drivers/${driverId}`);
    await update(driverRef, { isAvailable: true });
  };

  if (isAuthenticating || (user && !isDataLoaded)) return <LoadingScreen />;
  if (!user) return <LoginScreen />;
  if (!location) return <LoadingScreen />;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-blue-50 text-slate-800 font-sans">
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
          onToggleVisibility={() => {
              setOnTripUIVisible(v => !v);
              setShowQuickReplies(false);
          }}
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
      {showEarnings && driverId && 
        <EarningsModal 
            driverId={driverId} 
            onClose={() => setShowEarnings(false)} 
            balance={balance} 
            tripHistory={tripHistory} 
            transactions={transactions} 
            onViewTripDetails={handleViewTripDetails} 
            commissionRate={fees.commissionRate}
            platformFee={fees.platformFee}
        />
      }
      {viewingTripSummary && 
        <TripSummaryModal 
            trip={viewingTripSummary} 
            onClose={handleCloseTripSummary} 
            // Use snapshot values if available, else current settings
            // @ts-ignore
            commissionRate={viewingTripSummary.appliedRate ?? fees.commissionRate}
            // @ts-ignore
            platformFee={viewingTripSummary.appliedPlatformFee ?? fees.platformFee}
        />
      }
      {isChatOpen && activeTrip && <ChatModal tripId={activeTrip.id} onClose={() => setIsChatOpen(false)} />}
      {cancellationAlert.show && <CancellationAlertModal fee={cancellationAlert.fee} onClose={handleCloseCancellationAlert} />}
      {showSOSConfirm && <ConfirmModal title="Emergency Alert" message="Are you sure you want to trigger the emergency alert? This will contact our safety team." onConfirm={handleSOSConfirm} onCancel={() => setShowSOSConfirm(false)} />}
      {showQuickReplies && activeTrip && <QuickReplyPopup onSend={handleSendQuickReply} onOpenChat={handleOpenFullChat} onClose={() => setShowQuickReplies(false)} />}

      {tripRequests.length > 0 && isOnline && !activeTrip && <TripRequestAlert trip={tripRequests[0]} onAccept={handleAcceptTrip} onDecline={handleDeclineTrip} />}

      {!activeTrip && !viewingTripSummary && (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center space-y-2 pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
                {isOnline ? (
                    <button onClick={handleGoOffline} className="w-full bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105">
                        အော့ဖ်လိုင်း (Go Offline)
                    </button>
                ) : (
                    <button onClick={handleGoOnline} className="w-full bg-red-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-red-500 transition-all duration-300">
                        အွန်လိုင်း (Go Online)
                    </button>
                )}
            </div>
        </div>
      )}

      {!viewingTripSummary && (
          <div className={`absolute right-4 flex flex-col space-y-3 z-10 transition-all duration-500 ${activeTrip ? 'top-4' : 'top-24'}`}>
              <SOSButton onClick={() => setShowSOSConfirm(true)} />
              <button
                  onClick={() => mapRef.current?.recenter()}
                  className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-100"
                  aria-label="Recenter map"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#39FF14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500"><path d="M12 8V4H8" stroke="none"/><path d="M12 20v-4h4" stroke="none"/><path d="M4 12H8v4" stroke="none"/><path d="M20 12h-4V8" stroke="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="3" stroke="none"/></svg>
              </button>
          </div>
      )}

      {firestoreError && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 border border-yellow-300 p-4 rounded-md z-20">{firestoreError}</div>}
      {locationError && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-100 text-red-800 border border-red-300 p-2 rounded-md z-20">{locationError}</div>}
    </div>
  );
};

const SOSButton: React.FC<{onClick: () => void}> = ({onClick}) => (
    <button onClick={onClick} className="bg-red-600 p-3 rounded-full shadow-lg z-10 border border-red-400 hover:bg-red-500 transition-all animate-pulse">
        <SOSIcon className="h-6 w-6 text-white" />
    </button>
)


export default App;
