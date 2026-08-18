import { useCallback, useEffect, useState } from 'react';
import { WebSocketClient, type WebSocketMessage } from '@mattermost/client';
import config from 'config';

const wsConnectionUrl = `${config.mattermostUrl}/api/v4/websocket`;

export interface UseChatMessengerClientWsReturn {
  mmWsClient: WebSocketClient | null;
  isConnected: boolean;
  addMessageListener: (listener: (message: WebSocketMessage) => void) => void;
  removeMessageListener: (
    listener: (message: WebSocketMessage) => void,
  ) => void;
}

export function useChatMessengerClientWs(
  token: string | null,
): UseChatMessengerClientWsReturn {
  const [mmWsClient, setMmWsClient] = useState<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let wsClient: WebSocketClient | null = null;

    const initializeWebSocket = () => {
      if (!token) {
        setMmWsClient(null);
        setIsConnected(false);
        return;
      }

      try {
        wsClient = new WebSocketClient();
        wsClient.initialize(wsConnectionUrl, token, true);

        setMmWsClient(wsClient);
        setIsConnected(true);
      } catch (error) {
        console.error('Error initializing WebSocket client:', error);
        setMmWsClient(null);
        setIsConnected(false);
      }
    };

    initializeWebSocket();

    return () => {
      if (wsClient) {
        wsClient.close();
        setMmWsClient(null);
        setIsConnected(false);
      }
    };
  }, [token]);

  const addMessageListener = useCallback(
    (listener: (message: WebSocketMessage) => void) => {
      if (mmWsClient) {
        mmWsClient.addMessageListener(listener);
      }
    },
    [mmWsClient],
  );

  const removeMessageListener = useCallback(
    (listener: (message: WebSocketMessage) => void) => {
      if (mmWsClient) {
        mmWsClient.removeMessageListener(listener);
      }
    },
    [mmWsClient],
  );

  return {
    mmWsClient,
    isConnected,
    addMessageListener,
    removeMessageListener,
  };
}
