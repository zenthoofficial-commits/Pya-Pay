import { LatLngLiteral, TripLeg } from '../types';

// Helper to format duration from seconds to a readable string like "10 mins"
const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
};

// Helper to format distance from meters to a readable string like "5.2 km"
const formatDistance = (meters: number): string => {
    const kilometers = (meters / 1000).toFixed(1);
    return `${kilometers} km`;
};

// Fetches an address from coordinates using the free Nominatim API.
const getAddressFromCoordinates = async (location: LatLngLiteral): Promise<string> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`);
        if (!response.ok) {
            // Throw an error with status to indicate a failed request.
            throw new Error(`Nominatim request failed with status ${response.status}`);
        }
        const data = await response.json();
        // Return the display_name, or a fallback if it doesn't exist.
        return data.display_name || 'Unknown Address';
    } catch (error) {
        console.error("Geocoding error:", error);
        return 'Unknown Address'; // Fallback on any error
    }
};

// Fetches route details (distance, duration) using the free OSRM API.
const getRouteDetails = async (start: LatLngLiteral, end: LatLngLiteral): Promise<TripLeg | null> => {
    try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=false`);
        if (!response.ok) {
            throw new Error(`OSRM request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            console.error("OSRM routing error:", data.message || 'No route found');
            return null; // No valid route found
        }
        const route = data.routes[0];
        return {
            distance: formatDistance(route.distance),
            duration: formatDuration(route.duration),
        };
    } catch (error) {
        console.error("Routing error:", error);
        return null; // Fallback on any error
    }
};

export const calculateTripDetails = async (
  driverLocation: LatLngLiteral,
  pickupLocation: LatLngLiteral,
  dropoffLocation: LatLngLiteral
): Promise<{ pickupLeg: TripLeg | null; dropoffLeg: TripLeg | null; pickupAddress: string, dropoffAddress: string }> => {
    try {
        // Run all async requests in parallel for better performance
        const [pickupLeg, dropoffLeg, pickupAddress, dropoffAddress] = await Promise.all([
            getRouteDetails(driverLocation, pickupLocation),
            getRouteDetails(pickupLocation, dropoffLocation),
            getAddressFromCoordinates(pickupLocation),
            getAddressFromCoordinates(dropoffLocation),
        ]);

        return { pickupLeg, dropoffLeg, pickupAddress, dropoffAddress };

    } catch (error) {
        console.error("Error calculating trip details in parallel:", error);
        // Fallback in case Promise.all fails
        return { 
            pickupLeg: null, 
            dropoffLeg: null, 
            pickupAddress: 'Unknown', 
            dropoffAddress: 'Unknown' 
        };
    }
};
