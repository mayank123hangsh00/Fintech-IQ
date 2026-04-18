import { useEffect, useRef, useState, useCallback } from 'react';
import { SSE_URL } from '../services/api';

export function useSSE() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('fintech_token');
    if (!token) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${SSE_URL}?token=${token}`;
    // Use Authorization header via a custom EventSource or fallback
    const es = new EventSource(`${SSE_URL}`, {
      withCredentials: false,
    });

    // Since EventSource doesn't support custom headers, we use a workaround
    // In production: use a token in query param or cookie
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.addEventListener('connected', (e) => {
      setConnected(true);
    });

    es.addEventListener('notification', (e) => {
      try {
        const data = JSON.parse(e.data);
        setNotifications(prev => [{ ...data, id: Date.now() }, ...prev].slice(0, 50));
      } catch {}
    });

    es.onerror = () => {
      setConnected(false);
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    };
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    // SSE will be connected after user logs in
    const token = localStorage.getItem('fintech_token');
    if (token) connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return { notifications, connected, dismissNotification, connect };
}
