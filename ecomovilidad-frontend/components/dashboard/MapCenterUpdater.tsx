'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

type LL = [number, number];

interface Props {
  pos: LL | null;
  routePoints?: LL[];
}

export default function MapCenterUpdater({ pos, routePoints }: Props) {
  const map = useMap();

  // Follow GPS position in real time
  useEffect(() => {
    if (pos) map.setView(pos, map.getZoom(), { animate: true });
  }, [pos, map]);

  // Fit map to route bounds when route loads (no GPS yet)
  useEffect(() => {
    if (pos || !routePoints || routePoints.length < 2) return;
    try {
      map.fitBounds(routePoints as [number, number][], { padding: [40, 40], animate: true });
    } catch {/* ignore */}
  }, [routePoints, pos, map]);

  return null;
}
