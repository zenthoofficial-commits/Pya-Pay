
export const MAP_STYLES = [
  // Base colors
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#bdc1c6" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },

  // Water features
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },

  // Administrative boundaries and labels
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#c4c7c5" }] },

  // Points of Interest (POIs)
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283543" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#8ab493" }] },
  
  // Roads - Color-coded for hierarchy
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#4a5568" }] }, // General/local roads
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#6b7280" }] }, // Arterial roads
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f3d19c" }] }, // Highways (yellowish)
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#808080" }] },

  // Transit
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#506575" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3a4756" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
];