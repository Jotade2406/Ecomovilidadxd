import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:5034/ws';

let stompClient: Client | null = null;

/**
 * Conecta al broker STOMP sobre WebSocket.
 * Usa SockJS como transporte fallback.
 */
export function conectar(
  onConnect?: () => void,
  onError?: (error: string) => void
): Client {
  if (stompClient?.active) return stompClient;

  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (msg) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[STOMP]', msg);
      }
    },
    onConnect: () => {
      console.log('[STOMP] Conectado a', WS_URL);
      onConnect?.();
    },
    onStompError: (frame) => {
      console.error('[STOMP] Error:', frame.headers['message']);
      onError?.(frame.headers['message'] || 'Error de conexión WebSocket');
    },
    onDisconnect: () => {
      console.log('[STOMP] Desconectado');
    },
  });

  client.activate();
  stompClient = client;
  return client;
}

/**
 * Se suscribe a un topic STOMP.
 * @returns función para cancelar la suscripción
 */
export function suscribir(
  topic: string,
  callback: (message: IMessage) => void
): () => void {
  if (!stompClient?.active) {
    console.warn('[STOMP] No conectado. Suscripción a', topic, 'pospuesta.');
    return () => {};
  }

  const sub = stompClient.subscribe(topic, callback);
  return () => sub.unsubscribe();
}

/**
 * Envía un mensaje al servidor STOMP.
 */
export function enviar(destination: string, body: unknown): void {
  if (!stompClient?.active) {
    console.warn('[STOMP] No conectado. No se puede enviar a', destination);
    return;
  }
  stompClient.publish({
    destination,
    body: JSON.stringify(body),
  });
}

/**
 * Desconecta del broker STOMP.
 */
export function desconectar(): void {
  if (stompClient?.active) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function isConectado(): boolean {
  return stompClient?.active ?? false;
}
