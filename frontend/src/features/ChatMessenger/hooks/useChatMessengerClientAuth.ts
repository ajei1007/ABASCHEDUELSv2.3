import axios from 'axios';
import { useEffect, useState } from 'react';

export interface UseChatMessengerClientAuthReturn {
  token: string | null;
  isAuthenticated: boolean;
  refreshToken: () => Promise<string | null>;
  isLoading: boolean;
}

async function retrieveToken(): Promise<string | null> {
  const storedToken = localStorage.getItem('mmToken');
  if (storedToken) {
    return storedToken;
  }

  try {
    const response = await axios.get('/chat/token');
    const fetchedToken = response.data.token;
    if (!fetchedToken) {
      return null;
    }

    localStorage.setItem('mmToken', fetchedToken);
    return fetchedToken;
  } catch (error) {
    console.error('Error retrieving Mattermost token:', error);
    return null;
  }
}

export function useChatMessengerClientAuth(): UseChatMessengerClientAuthReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const authToken = await retrieveToken();
      setToken(authToken);
      setIsLoading(false);
    };

    initializeAuth();
  }, [retrieveToken]);

  return {
    token,
    isAuthenticated: !!token,
    refreshToken: retrieveToken,
    isLoading,
  };
}
