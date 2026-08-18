import config from 'config';
import type { TChatMessengerEventBus } from '../context/ChatMessengerEventBusContext';
import { useChatMessengerClientAuth } from './useChatMessengerClientAuth';
import { useChatMessengerClientUser } from './useChatMessengerClientUser';
import { useChatMessengerClientApi } from './useChatMessengerClientApi';
import { useChatMessengerClientWs } from './useChatMessengerClientWs';
import { useChatMessengerClientWsSubscription } from './useChatMessengerClientWsSubscription';

export function useChatMessengerClient({
  eventBus,
}: {
  eventBus: TChatMessengerEventBus;
}) {
  // Use the individual hooks
  const { token, isAuthenticated } = useChatMessengerClientAuth();
  const { mmUserId, mmUserTeamId, hasValidUser } = useChatMessengerClientUser();

  const { mmApiClient, mmUser } = useChatMessengerClientApi({
    token,
    mmUserId,
  });

  const { mmWsClient, isConnected, addMessageListener, removeMessageListener } =
    useChatMessengerClientWs(token);

  // Handle WebSocket events
  useChatMessengerClientWsSubscription({
    addMessageListener,
    removeMessageListener,
    eventBus,
    mmUserId,
    isConnected: isConnected && hasValidUser && isAuthenticated,
  });

  return {
    mmUrl: config.mattermostUrl,
    mmUser,
    mmUserId,
    mmUserTeamId: mmUserTeamId || '',
    mmApiClient,
    mmWsClient,
  };
}
