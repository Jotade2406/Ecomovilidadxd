'use client';

import { useMapEvents } from 'react-leaflet';

interface MapClickHandlerProps {
  onClick: (lat: number, lon: number) => void;
}

// This component MUST be a child of MapContainer
// It uses react-leaflet's useMapEvents hook to capture map clicks
export default function MapClickHandler({ onClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
