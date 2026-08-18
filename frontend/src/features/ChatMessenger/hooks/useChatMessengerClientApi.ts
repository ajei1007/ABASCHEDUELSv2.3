import { useEffect, useState } from 'react';
import type { UserProfile } from '@mattermost/types/users';
import config from 'config';
import { MmApiClient } from '../services/mmApiClient';

export interface UseChatMessengerClientApiProps {
  token: string | null;
  mmUserId: string | undefined;
}

export interface UseChatMessengerClientApiReturn {
  mmApiClient: MmApiClient | null;
  mmUser: UserProfile | null;
  isReady: boolean;
}

export function useChatMessengerClientApi({
  token,
  mmUserId,
}: UseChatMessengerClientApiProps): UseChatMessengerClientApiReturn {
  const [mmApiClient, setMmApiClient] = useState<MmApiClient | null>(null);
  const [mmUser, setMmUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApiClient = async () => {
      if (!token || !mmUserId) {
        setMmApiClient(null);
        setMmUser(null);
        setIsReady(false);
        return;
      }

      try {
        const apiClient = new MmApiClient({
          baseUrl: `${config.mattermostUrl}/api/v4`,
          authToken: token,
        });

        const userProfile = await apiClient.makeRequest<UserProfile>({
          url: `users/${mmUserId}`,
          method: 'get',
        });

        setMmApiClient(apiClient);
        setMmUser(userProfile);
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing Mattermost API client:', error);
        setMmApiClient(null);
        setMmUser(null);
        setIsReady(false);
      }
    };

    initializeApiClient();
  }, [token, mmUserId]);

  return {
    mmApiClient,
    mmUser,
    isReady,
  };
}
