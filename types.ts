
export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface TripLeg {
  distance: string;
  duration: string;
}

export interface Trip {
  id: string;
  pickup: LatLngLiteral;
  dropoff: LatLngLiteral;
  pickupAddress: string;
  dropoffAddress: string;
  fare: number;
  // FIX: Added 'at_pickup' and 'to_dropoff' to the status to reflect all possible trip states.
  status: 'pending' | 'accepted' | 'at_pickup' | 'to_dropoff' | 'completed' | 'cancelled';
  driverId?: string;
  passengerId: string; // Passenger ID is required for a trip to be created.
  passengerPhone?: string;
  pickupLeg: TripLeg;
  dropoffLeg: TripLeg;
  createdAt?: number; 
  completedAt?: number;
  cancellationFee?: number;
  // New fields
  requestedDriverId?: string;
  declinedDriverIds?: string[];
  token?: string;
  commissionAmount?: number;
  appliedRate?: number;
  appliedPlatformFee?: number;
}

export interface Message {
    id: string;
    text: string;
    timestamp: number; 
    sender: 'driver' | 'passenger';
}
