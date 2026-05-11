import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:5034/ws';

let stompClient: Client | null = null;
let stompConnected = false;
let pendingSubscriptions: Array<{ topic: string; callback: (msg: IMessage) => void; resolve: (unsub: () => void) => void }> = [];

/**
 * Procesa las suscripciones pendientes que llegaron antes de que la conexión estuviera lista.
 */
function flushPendingSubscriptions(): void {
  if (!stompClient || !stompConnected) return;
  const pending = [...pendingSubscriptions];
  pendingSubscriptions = [];
  for (const { topic, callback, resolve } of pending) {
    const sub = stompClient.subscribe(topic, callback);
    resolve(() => sub.unsubscribe());
  }
}

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
      stompConnected = true;
      flushPendingSubscriptions();
      onConnect?.();
    },
    onStompError: (frame) => {
      console.error('[STOMP] Error:', frame.headers['message']);
      stompConnected = false;
      onError?.(frame.headers['message'] || 'Error de conexión WebSocket');
    },
    onDisconnect: () => {
      console.log('[STOMP] Desconectado');
      stompConnected = false;
    },
  });

  client.activate();
  stompClient = client;
  return client;
}

/**
 * Se suscribe a un topic STOMP.
 * Si la conexión aún no está lista, encola la suscripción y la ejecuta al conectar.
 * @returns función para cancelar la suscripción
 */
export function suscribir(
  topic: string,
  callback: (message: IMessage) => void
): () => void {
  // Conexión lista → suscribir directo
  if (stompClient && stompConnected) {
    const sub = stompClient.subscribe(topic, callback);
    return () => sub.unsubscribe();
  }

  // Conexión no lista → encolar
  console.warn('[STOMP] Conexión no lista. Encolando suscripción a', topic);
  let unsub: (() => void) | null = null;
  let cancelled = false;

  pendingSubscriptions.push({
    topic,
    callback,
    resolve: (fn) => {
      if (cancelled) {
        fn(); // cancelar inmediatamente si ya se desmontó el componente
      } else {
        unsub = fn;
      }
    },
  });

  return () => {
    cancelled = true;
    unsub?.();
    // Limpiar de la cola si aún no se procesó
    pendingSubscriptions = pendingSubscriptions.filter((p) => p.topic !== topic || p.callback !== callback);
  };
}

/**
 * Envía un mensaje al servidor STOMP.
 */
export function enviar(destination: string, body: unknown): void {
  if (!stompClient || !stompConnected) {
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
    stompConnected = false;
    pendingSubscriptions = [];
  }
}

export function isConectado(): boolean {
  return stompConnected;
}
