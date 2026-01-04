import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook para manejar conexión WebSocket con una sala de juego
 * @param {number|string} roomId - ID de la sala
 * @param {Function} onRoomUpdate - Callback cuando se recibe actualización de la sala
 * @param {boolean} enabled - Si la conexión está habilitada
 * @param {Function} onTempRoundSelection - Callback cuando otro jugador selecciona rondas temporalmente
 */
export function useGameRoomWebSocket(
  roomId,
  onRoomUpdate,
  enabled = true,
  onTempRoundSelection = null
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const onRoomUpdateRef = useRef(onRoomUpdate);
  const onTempRoundSelectionRef = useRef(onTempRoundSelection);

  // Mantener la referencia actualizada sin recrear el callback
  useEffect(() => {
    onRoomUpdateRef.current = onRoomUpdate;
  }, [onRoomUpdate]);

  useEffect(() => {
    onTempRoundSelectionRef.current = onTempRoundSelection;
  }, [onTempRoundSelection]);

  const connect = useCallback(() => {
    if (!enabled || !roomId) return;

    // Limpiar conexión anterior si existe
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      // Construir URL de WebSocket
      let wsUrl;

      // Si hay una URL de WebSocket configurada explícitamente, usarla
      const wsBaseUrl = import.meta.env.VITE_WS_URL;
      if (wsBaseUrl) {
        // Convertir http:// a ws:// y https:// a wss:// si es necesario
        let base = wsBaseUrl.trim().replace(/\/+$/, ""); // Remover trailing slashes
        if (base.startsWith("http://")) {
          base = base.replace("http://", "ws://");
        } else if (base.startsWith("https://")) {
          base = base.replace("https://", "wss://");
        } else if (!base.startsWith("ws://") && !base.startsWith("wss://")) {
          // Si no tiene protocolo, asumir wss:// en producción, ws:// en desarrollo
          const protocol =
            window.location.protocol === "https:" ? "wss://" : "ws://";
          base = `${protocol}${base}`;
        }
        wsUrl = `${base}/ws/game/room/${roomId}/`;
      } else {
        // Construir desde API_BASE_URL si está disponible
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        if (apiBaseUrl) {
          // Convertir http:// a ws:// y https:// a wss://
          const wsProtocol = apiBaseUrl.startsWith("https") ? "wss:" : "ws:";
          const urlWithoutProtocol = apiBaseUrl.replace(/^https?:\/\//, "");
          // Remover /api/v1 si existe
          const urlWithoutApi = urlWithoutProtocol.replace(/\/api\/v1.*$/, "");
          wsUrl = `${wsProtocol}//${urlWithoutApi}/ws/game/room/${roomId}/`;
        } else {
          // Fallback: desarrollo local
          const protocol =
            window.location.protocol === "https:" ? "wss:" : "ws:";
          const host = window.location.hostname;
          let port = window.location.port;
          if (!port || port === "5173" || port === "3000") {
            port = import.meta.env.VITE_WS_PORT || "8000";
          }
          wsUrl = `${protocol}//${host}:${port}/ws/game/room/${roomId}/`;
        }
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket conectado");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Enviar ping inicial
        ws.send(JSON.stringify({ type: "ping" }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "pong") {
            // Responder a pong (heartbeat)
            return;
          }

          if (data.type === "room_update" && data.data) {
            console.log("WebSocket: Room update recibido", data.data.status);
            onRoomUpdateRef.current(data.data);
          } else if (
            data.type === "temp_round_selection" &&
            data.rounds &&
            onTempRoundSelectionRef.current
          ) {
            // Selección temporal de otro jugador
            onTempRoundSelectionRef.current(data.rounds);
          } else if (data.type !== "pong") {
            console.warn("WebSocket: Mensaje con formato inesperado", data);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err, event.data);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("Error de conexión WebSocket");
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);

        // Solo intentar reconectar si no fue un cierre intencional y el hook sigue habilitado
        if (
          enabled &&
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          wsRef.current === ws
        ) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            10000
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              `Reintentando conexión (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
            );
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError("Error al crear conexión WebSocket");
      setIsConnected(false);
    }
  }, [roomId, enabled]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, roomId]);

  // Heartbeat para mantener la conexión viva
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      sendMessage({ type: "ping" });
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
