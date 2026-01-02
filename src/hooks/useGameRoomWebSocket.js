import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook para manejar conexión WebSocket con una sala de juego
 * @param {number|string} roomId - ID de la sala
 * @param {Function} onRoomUpdate - Callback cuando se recibe actualización de la sala
 * @param {boolean} enabled - Si la conexión está habilitada
 */
export function useGameRoomWebSocket(roomId, onRoomUpdate, enabled = true) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled || !roomId) return;

    try {
      // Obtener la URL base (ws://localhost:8000 o wss://...)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      // Para desarrollo, usar el mismo puerto del backend (8000)
      // En producción, usar el mismo host y puerto del frontend
      let port = window.location.port;
      if (!port || port === '5173' || port === '3000') {
        // Si estamos en desarrollo (Vite/React dev server), usar puerto del backend
        port = import.meta.env.VITE_WS_PORT || '8000';
      }
      const wsUrl = `${protocol}//${host}:${port}/ws/game/room/${roomId}/`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket conectado');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Enviar ping inicial
        ws.send(JSON.stringify({ type: 'ping' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'pong') {
            // Responder a pong (heartbeat)
            return;
          }
          
          if (data.type === 'room_update' && data.data) {
            onRoomUpdate(data.data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Error de conexión WebSocket');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        // Intentar reconectar si no fue un cierre intencional
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reintentando conexión (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Error al crear conexión WebSocket');
      setIsConnected(false);
    }
  }, [roomId, enabled, onRoomUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (enabled && roomId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, roomId, connect, disconnect]);

  // Heartbeat para mantener la conexión viva
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000); // Cada 30 segundos

    return () => clearInterval(heartbeatInterval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    error,
    sendMessage,
    reconnect: connect,
  };
}

