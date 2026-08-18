import { useEffect } from 'react';
import type { WebSocketMessage } from '@mattermost/client';
import type { ServerChannel } from '@mattermost/types/channels';
import type { TChatMessengerEventBus } from '../context/ChatMessengerEventBusContext';

function tryJsonParse<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return null;
  }
}

interface UseChatMessengerClientWsSubscriptionProps {
  addMessageListener: (listener: (message: WebSocketMessage) => void) => void;
  removeMessageListener: (
    listener: (message: WebSocketMessage) => void,
  ) => void;
  eventBus: TChatMessengerEventBus;
  mmUserId: string | undefined;
  isConnected: boolean;
}

export function useChatMessengerClientWsSubscription({
  addMessageListener,
  removeMessageListener,
  eventBus,
  mmUserId,
  isConnected,
}: UseChatMessengerClientWsSubscriptionProps): void {
  useEffect(() => {
    if (!isConnected || !mmUserId) {
      return;
    }

    const wsEventHandler = (message: WebSocketMessage) => {
      if (
        message.event === 'channel_created' &&
        message.broadcast.user_id === mmUserId
      ) {
        eventBus.emit('groupChannelCreated', {
          channelId: message.data.channel_id,
          teamId: message.data.team_id,
        });
      }

      if (message.event === 'channel_updated') {
        const channelData = tryJsonParse<ServerChannel>(message.data.channel);
        eventBus.emit('groupChannelUpdated', {
          channelId: message.broadcast?.channel_id || channelData?.id || '',
          channelData,
        });
      }

      if (message.event === 'channel_deleted') {
        eventBus.emit('groupChannelDeleted', {
          channelId: message.data.channel_id,
          deletedAt: message.data.delete_at,
        });
      }

      if (message.event === 'channel_restored') {
        eventBus.emit('groupChannelUndeleted', {
          channelId: message.data.channel_id,
        });
      }

      if (message.event === 'user_added') {
        const userId = message.data?.user_id || message.broadcast?.user_id;
        const channelId =
          message.broadcast?.channel_id || message.data?.channel_id;
        const teamId = message.data?.team_id || message.broadcast?.team_id;

        if (userId === mmUserId) {
          eventBus.emit('groupChannelCreated', {
            channelId,
            teamId,
          });
        }

        eventBus.emit('memberJoinedGroupChannel', {
          channelId,
          userId,
        });
      }

      if (message.event === 'user_removed') {
        const userId = message.broadcast.user_id || message.data.user_id;
        const removerId = message.data.remover_id;
        const channelId =
          message.data.channel_id || message.broadcast.channel_id;
        if (userId === mmUserId) {
          if (removerId !== mmUserId) {
            eventBus.emit('kickedFromGroupChannel', {
              channelId,
              removerId,
            });
          } else {
            eventBus.emit('leftGroupChannel', {
              channelId,
            });
          }
        } else {
          eventBus.emit('memberLeftGroupChannel', {
            channelId,
            removerId,
            userId,
          });
        }
      }

      if (
        message.event === 'direct_added' &&
        message.data.teammate_id === mmUserId
      ) {
        eventBus.emit('directChannelCreated', {
          channelId: message.broadcast.channel_id,
          creatorId: message.data.creator_id,
          teammateId: message.data.teammate_id,
        });
      }

      if (message.event === 'posted') {
        eventBus.emit('messageAdded', {
          channelId: message.broadcast?.channel_id,
          channelName: message.data?.channel_name,
          channelType: message.data?.channel_type,
          channelDisplayName: message.data?.channel_display_name,
          senderName: message.data?.sender_name,
          post: tryJsonParse(message.data.post) || {}, // Ensure post is parsed correctly,
        });
      }

      if (message.event === 'post_edited') {
        eventBus.emit('messageUpdated', {
          channelId: message.broadcast.channel_id,
        });
      }

      if (message.event === 'post_deleted') {
        eventBus.emit('messageDeleted', {
          channelId: message.broadcast.channel_id,
        });
      }

      if (message.event === 'post_unread') {
        eventBus.emit('messageUnread', {
          channelId: message.broadcast.channel_id,
        });
      }
    };

    addMessageListener(wsEventHandler);
    return () => {
      removeMessageListener(wsEventHandler);
    };
  }, [
    addMessageListener,
    removeMessageListener,
    eventBus,
    mmUserId,
    isConnected,
  ]);
}
