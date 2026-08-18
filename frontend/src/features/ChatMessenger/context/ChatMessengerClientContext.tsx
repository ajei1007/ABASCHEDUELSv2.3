import { useMemo, useContext, createContext } from 'react';
import { useChatMessengerClient } from '../hooks/useChatMessengerClient';
import { useChatMessengerEventBusContext } from './ChatMessengerEventBusContext';
import type { WebSocketClient } from '@mattermost/client';
import type { UserProfile } from '@mattermost/types/users';
import type { MmApiClient } from '../services/mmApiClient';

export const ChatMessengerClientContext = createContext<{
  mmUrl: string;
  mmUserId: string;
  mmUser: UserProfile | null;
  mmUserTeamId: string;
  mmApiClient: MmApiClient | null;
  mmWsClient: WebSocketClient | null;
}>({
  mmUrl: '',
  mmUser: null,
  mmUserId: '',
  mmUserTeamId: '',
  mmApiClient: null,
  mmWsClient: null,
});

export const useChatMessengerClientContext = () => {
  return useContext(ChatMessengerClientContext);
};

export const ChatMessengerClientContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { eventBus } = useChatMessengerEventBusContext();

  const { mmUrl, mmUserId, mmUser, mmUserTeamId, mmApiClient, mmWsClient } =
    useChatMessengerClient({
      eventBus,
    });

  const contextValue = useMemo(
    () => ({
      mmUrl,
      mmUser,
      mmUserId,
      mmUserTeamId,
      mmApiClient,
      mmWsClient,
    }),
    [mmUrl, mmUser, mmUserId, mmUserTeamId, mmApiClient, mmWsClient],
  );

  return (
    <ChatMessengerClientContext.Provider value={contextValue}>
      {children}
    </ChatMessengerClientContext.Provider>
  );
};
