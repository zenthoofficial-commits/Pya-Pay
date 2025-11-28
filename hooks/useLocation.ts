
import { useState, useEffect } from 'react';
import { LatLngLiteral } from '../types';

const useLocation = () => {
  const [location, setLocation] = useState<LatLngLiteral | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;

    const startWatching = (highAccuracy: boolean) => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported.");
            return;
        }

        watchId = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setError(null);
            },
            (err) => {
                console.warn(`Geolocation error (${highAccuracy ? 'High' : 'Low'}): ${err.message}`);
                // If high accuracy fails, try low accuracy
                if (highAccuracy) {
                     navigator.geolocation.clearWatch(watchId);
                     startWatching(false);
                } else {
                     setError(`Location Error: ${err.message}`);
                }
            },
            {
                enableHighAccuracy: highAccuracy,
                timeout: highAccuracy ? 5000 : 10000,
                maximumAge: 0, 
            }
        );
    };

    // 1. Attempt to get a quick cached position first for immediate UI feedback
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => { console.log("No cached position available"); },
        { maximumAge: Infinity, timeout: 1000, enableHighAccuracy: false }
    );

    // 2. Start watching (High Accuracy first)
    startWatching(true);

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let newHeading: number | null = null;

      // iOS devices provide webkitCompassHeading which is an absolute heading.
      if ((event as any).webkitCompassHeading !== undefined) {
        newHeading = (event as any).webkitCompassHeading;
      } 
      // For standard-compliant browsers, alpha is the compass direction.
      else if (event.alpha !== null && event.absolute === true) {
        newHeading = event.alpha;
      }

      if (newHeading !== null) {
        setHeading(newHeading);
      }
    };

    if ('DeviceOrientationEvent' in window) {
       window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if ('DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  return { location, heading, error };
};

export default useLocation;
