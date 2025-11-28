
import { useState, useEffect } from 'react';
import { LatLngLiteral } from '../types';

const useLocation = () => {
  const [location, setLocation] = useState<LatLngLiteral | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;

    const startWatching = (highAccuracy: boolean) => {
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setError(null);
                },
                (err) => {
                    if (highAccuracy && err.code === err.TIMEOUT) {
                        // If high accuracy times out, try low accuracy
                        console.warn("High accuracy timeout, switching to low accuracy");
                        navigator.geolocation.clearWatch(watchId);
                        startWatching(false);
                    } else {
                         setError(`Geolocation error: ${err.message}`);
                    }
                },
                {
                    enableHighAccuracy: highAccuracy,
                    timeout: highAccuracy ? 5000 : 10000,
                    maximumAge: 0,
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

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
