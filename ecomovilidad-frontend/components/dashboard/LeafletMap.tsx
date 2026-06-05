'use client';

import { useEffect } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapCenterUpdater from './MapCenterUpdater';

// Fix Leaflet default marker icons (Next.js breaks the asset paths)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'];
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const busIcon = L.icon({
  iconUrl: '/bus-marker.svg',
  iconSize: [64, 52],
  iconAnchor: [32, 44],
  popupAnchor: [0, -44],
});

type LL = [number, number];

interface RutaData {
  origen: LL;
  destino: LL;
  puntos: LL[];
  color: string;
}

interface UbicacionEnVivo {
  lat: number;
  lon: number;
  timestamp: string;
}

interface Props {
  mapKey: number;
  theme: string;
  tileLayer: { attribution: string; url: string };
  busPos: LL | null;
  rutaData: RutaData | null;
  ubicacion: UbicacionEnVivo | null;
}

const CENTER: LL = [-17.7833, -63.1821];

export default function LeafletMap({
  mapKey, theme, tileLayer, busPos, rutaData, ubicacion,
}: Props) {
  return (
    <MapContainer
      key={`envivo-${mapKey}-${theme}`}
      center={busPos ?? rutaData?.origen ?? CENTER}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom
      zoomControl
    >
      <TileLayer attribution={tileLayer.attribution} url={tileLayer.url} />
      <MapCenterUpdater pos={busPos} routePoints={rutaData?.puntos} />

      {/* Traza de la ruta */}
      {rutaData && (
        <>
          <Polyline
            positions={rutaData.puntos}
            pathOptions={{ color: rutaData.color, weight: 4, opacity: 0.8 }}
          />
          <CircleMarker
            center={rutaData.origen}
            radius={8}
            pathOptions={{ color: '#fff', fillColor: '#22c55e', fillOpacity: 1, weight: 2 }}
          >
            <Popup><strong>🟢 Origen</strong></Popup>
          </CircleMarker>
          <CircleMarker
            center={rutaData.destino}
            radius={8}
            pathOptions={{ color: '#fff', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
          >
            <Popup><strong>🔴 Destino</strong></Popup>
          </CircleMarker>
        </>
      )}

      {/* Marcador GPS del bus */}
      {busPos && (
        <Marker position={busPos} icon={busIcon}>
          <Popup>
            <strong>🚌 Bus en vivo</strong><br />
            <span style={{ fontSize: 11, color: '#6B7280' }}>
              {busPos[0].toFixed(5)}, {busPos[1].toFixed(5)}
            </span>
            {ubicacion && (
              <>
                <br />
                <span style={{ fontSize: 11, color: '#10b981' }}>
                  {new Date(ubicacion.timestamp).toLocaleTimeString('es-BO')}
                </span>
              </>
            )}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
