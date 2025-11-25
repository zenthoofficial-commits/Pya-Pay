
import { useState, useEffect } from 'react';
import { LatLngLiteral } from '../types';

const useLocation = () => {
  const [location, setLocation] = useState<LatLngLiteral | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;

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
          setError(`Geolocation error: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let newHeading: number | null = null;

      // iOS devices provide webkitCompassHeading which is an absolute heading.
      if ((event as any).webkitCompassHeading !== undefined) {
        newHeading = (event as any).webkitCompassHeading;
      } 
      // For standard-compliant browsers, alpha is the compass direction.
      // We must check if the reading is absolute, otherwise it's useless for a compass.
      else if (event.alpha !== null && event.absolute === true) {
        // The alpha value is 0-360, with 0 being North.
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
