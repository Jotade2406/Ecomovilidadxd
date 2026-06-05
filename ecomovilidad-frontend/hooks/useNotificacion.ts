'use client';

import { useNotificacionContext, type NotificationType } from '@/context/NotificacionContext';
import { useCallback } from 'react';

/**
 * Hook para disparar notificaciones desde cualquier componente.
 * 
 * @example
 * const { notificar, notificarExito, notificarError } = useNotificacion();
 * notificarExito('Ruta guardada correctamente');
 * notificarError('Error al conectar con el servidor');
 */
export function useNotificacion() {
  const { showNotificacion } = useNotificacionContext();

  const notificar = useCallback(
    (message: string, type: NotificationType = 'info', duration?: number) => {
      showNotificacion(message, type, duration);
    },
    [showNotificacion]
  );

  const notificarExito = useCallback(
    (message: string) => showNotificacion(message, 'success'),
    [showNotificacion]
  );

  const notificarError = useCallback(
    (message: string) => showNotificacion(message, 'error', 8000),
    [showNotificacion]
  );

  const notificarAviso = useCallback(
    (message: string) => showNotificacion(message, 'warning', 6000),
    [showNotificacion]
  );

  return { notificar, notificarExito, notificarError, notificarAviso };
}
