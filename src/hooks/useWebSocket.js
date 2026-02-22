import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook genérico para conexión WebSocket con reconexión automática y heartbeat.
 * @param {string} path - Ruta del WebSocket (ej: '/ws/orders/')
 * @param {Object} options
 * @param {Function} options.onMessage - Callback cuando se recibe un mensaje
 * @param {boolean} [options.enabled=true] - Si la conexión está habilitada
 * @returns {{ isConnected: boolean, error: string|null, sendMessage: Function, reconnect: Function }}
 */
export function useWebSocket(path, { onMessage, enabled = true }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const buildWsUrl = useCallback((wsPath) => {
    const wsBaseUrl = import.meta.env.VITE_WS_URL;
    if (wsBaseUrl) {
      let base = wsBaseUrl.trim().replace(/\/+$/, "");
      if (base.startsWith("http://")) {
        base = base.replace("http://", "ws://");
      } else if (base.startsWith("https://")) {
        base = base.replace("https://", "wss://");
      } else if (!base.startsWith("ws://") && !base.startsWith("wss://")) {
        const protocol =
          window.location.protocol === "https:" ? "wss://" : "ws://";
        base = `${protocol}${base}`;
      }
      return `${base}${wsPath}`;
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiBaseUrl) {
      const wsProtocol = apiBaseUrl.startsWith("https") ? "wss:" : "ws:";
      const urlWithoutProtocol = apiBaseUrl.replace(/^https?:\/\//, "");
      const urlWithoutApi = urlWithoutProtocol.replace(/\/api\/v1.*$/, "");
      return `${wsProtocol}//${urlWithoutApi}${wsPath}`;
    }

    // Fallback: desarrollo local
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    let port = window.location.port;
    if (!port || port === "5173" || port === "3000") {
      port = import.meta.env.VITE_WS_PORT || "8000";
    }
    return `${protocol}//${host}:${port}${wsPath}`;
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !path) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const wsUrl = buildWsUrl(path);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        ws.send(JSON.stringify({ type: "ping" }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong") return;
          onMessageRef.current?.(data);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = () => {
        setError("Error de conexión WebSocket");
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);

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
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError("Error al crear conexión WebSocket");
      setIsConnected(false);
    }
  }, [path, enabled, buildWsUrl]);

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
    if (enabled && path) {
      connect();
    }
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, path]);

  // Heartbeat cada 30 segundos
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      sendMessage({ type: "ping" });
    }, 30000);
    return () => clearInterval(interval);
  }, [isConnected, sendMessage]);

  return { isConnected, error, sendMessage, reconnect: connect };
}
