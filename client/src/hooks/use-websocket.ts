import { useEffect, useRef, useCallback } from 'react';
import { queryClient } from '@/lib/queryClient';

type WebSocketMessage = {
  type: 'BET_PLACED' | 'PRICE_UPDATE';
  bet?: any;
  market?: any;
};

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'BET_PLACED':
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['/api/bets/recent'] });
              queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
              queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
              break;
              
            case 'PRICE_UPDATE':
              // Update specific market in cache
              if (message.market) {
                queryClient.setQueryData(['/api/markets'], (old: any) => {
                  if (!old) return old;
                  return old.map((m: any) => 
                    m.id === message.market.id ? message.market : m
                  );
                });
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        wsRef.current = null;
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
