'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { conectar, suscribir, desconectar } from '@/lib/stompClient';
import type { IMessage } from '@stomp/stompjs';

interface UbicacionEnVivo {
  lat: number;
  lon: number;
  timestamp: string;
}

interface UseUbicacionEnVivoReturn {
  ubicacion: UbicacionEnVivo | null;
  conectado: boolean;
  error: string | null;
}

/**
 * Hook para suscribirse a la ubicación en vivo de un bus en un viaje.
 * Se conecta automáticamente al WebSocket STOMP y se suscribe al topic del viaje.
 */
export function useUbicacionEnVivo(viajeId: string | null): UseUbicacionEnVivoReturn {
  const [ubicacion, setUbicacion] = useState<UbicacionEnVivo | null>(null);
  const [conectado, setConectado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const handleMessage = useCallback((msg: IMessage) => {
    try {
      const data = JSON.parse(msg.body);
      setUbicacion({
        lat: data.lat,
        lon: data.lon,
        timestamp: data.timestamp,
      });
    } catch {
      console.error('[useUbicacionEnVivo] Error parseando mensaje:', msg.body);
    }
  }, []);

  useEffect(() => {
    if (!viajeId) return;

    const topic = `/topic/ubicacion/${viajeId}`;

    const client = conectar(
      () => {
        setConectado(true);
        setError(null);
        // Suscribirse al topic del viaje
        unsubRef.current = suscribir(topic, handleMessage);
      },
      (err) => {
        setConectado(false);
        setError(err);
      }
    );

    // La suscripción se maneja dentro del callback onConnect
    // y el stompClient encola si la conexión no está lista aún

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
      // No desconectamos el client global aquí para que otros hooks puedan seguir usando
    };
  }, [viajeId, handleMessage]);

  return { ubicacion, conectado, error };
}
