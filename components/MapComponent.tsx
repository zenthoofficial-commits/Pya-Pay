
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Trip, LatLngLiteral } from '../types';
import { TripStage } from '../App';

// Make Leaflet available from the window object
declare const L: any;

export interface MapHandles {
  recenter: () => void;
}

interface MapComponentProps {
  userLocation: LatLngLiteral | null;
  userHeading: number | null;
  activeTrip: Trip | null;
  tripStage: TripStage | null;
}

// Leaflet DivIcon for the user marker
const getMarkerIcon = (rotation: number | null): any => {
    const svg = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .pulse-circle {
              animation: pulse-animation 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              transform-origin: 24px 24px;
            }
            @keyframes pulse-animation {
              0% { transform: scale(0.8); opacity: 0.7; }
              100% { transform: scale(1.8); opacity: 0; }
            }
          </style>
        </defs>
        <g transform="rotate(${rotation || 0} 24 24)">
          <circle class="pulse-circle" cx="24" cy="24" r="14" fill="#34d399"/>
          <g style="filter: drop-shadow(0px 0px 3px #39FF14);">
            <circle cx="24" cy="24" r="14" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
            <path d="M24 14 L19 29 L24 26 L29 29 Z" fill="#a7f3d0"/>
          </g>
        </g>
      </svg>
    `.trim();

    return L.divIcon({
        html: svg,
        className: '', // remove default styles
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });
};

const MapComponent = forwardRef<MapHandles, MapComponentProps>(({ userLocation, userHeading, activeTrip, tripStage }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any | null>(null);
  const userMarker = useRef<any | null>(null);
  const routeControl = useRef<any | null>(null);
  
  const locationRef = useRef(userLocation);
  const [isFollowingUser, setIsFollowingUser] = useState(true);

  useEffect(() => {
    locationRef.current = userLocation;
  }, [userLocation]);
  
  useImperativeHandle(ref, () => ({
    recenter: () => {
        if (leafletMap.current && locationRef.current) {
            leafletMap.current.setView(locationRef.current, 17);
            setIsFollowingUser(true);
        }
    }
  }));

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || !L || !userLocation || leafletMap.current) return;
    
    leafletMap.current = L.map(mapRef.current, {
        center: userLocation,
        zoom: 17,
        zoomControl: false, // UI is handled by app
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap.current);
    
    // Disable follow on user drag
    leafletMap.current.on('dragstart', () => {
        setIsFollowingUser(false);
    });

  }, [userLocation]);

  // Update user marker
  useEffect(() => {
    if (!leafletMap.current || !userLocation) return;

    if (!userMarker.current) {
        userMarker.current = L.marker(userLocation, {
            icon: getMarkerIcon(userHeading),
            zIndexOffset: 1000,
        }).addTo(leafletMap.current);
    } else {
        userMarker.current.setLatLng(userLocation);
        userMarker.current.setIcon(getMarkerIcon(userHeading));
    }
    
    if (isFollowingUser && !activeTrip && userLocation) {
        leafletMap.current.setView(userLocation);
    }
  }, [userLocation, userHeading, activeTrip, isFollowingUser]);

  // Handle active trip route rendering
  useEffect(() => {
    if (!leafletMap.current) return;

    // First, remove any existing route from the map
    if (routeControl.current) {
        leafletMap.current.removeControl(routeControl.current);
        routeControl.current = null;
    }

    const currentUserLocation = locationRef.current;

    if (activeTrip && currentUserLocation && L.Routing) {
        let waypoints: any[] = [];
        let routeColor = '#32CD32'; // Default to green for dropoff

        switch (tripStage) {
            case 'to_pickup':
                waypoints = [L.latLng(currentUserLocation), L.latLng(activeTrip.pickup)];
                routeColor = '#FFC300'; // Yellow for pickup
                break;
            case 'at_pickup':
                // Show route from pickup to dropoff when driver arrives
                waypoints = [L.latLng(activeTrip.pickup), L.latLng(activeTrip.dropoff)];
                break;
            case 'to_dropoff':
                waypoints = [L.latLng(currentUserLocation), L.latLng(activeTrip.dropoff)];
                break;
            default:
                break;
        }

        if (waypoints.length > 0) {
            routeControl.current = L.Routing.control({
                waypoints,
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                show: false, // Hide the turn-by-turn instructions panel
                lineOptions: {
                    styles: [{ color: routeColor, opacity: 0.9, weight: 6 }]
                },
                createMarker: () => null 
            }).addTo(leafletMap.current);
            
             // Fit bounds with padding to shift user to bottom (Navigation View)
             routeControl.current.on('routesfound', (e: any) => {
                 const routes = e.routes;
                 const bounds = L.latLngBounds(waypoints);
                 if (leafletMap.current) {
                     // Add significant bottom padding so the "user" (start) is lower
                     leafletMap.current.fitBounds(bounds, {
                         paddingTopLeft: [50, 50],
                         paddingBottomRight: [50, 300], // Push map center up, user goes down
                         animate: true
                     });
                 }
             });
        }
    }
  }, [activeTrip, tripStage]);

  return <div ref={mapRef} className="h-full w-full" />;
});

export default MapComponent;
