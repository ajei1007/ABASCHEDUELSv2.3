import { useEffect } from 'react';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';
import {
  useChatMessengerEventBusContext,
  type IChatMessengerEventBusMap,
} from '../context/ChatMessengerEventBusContext';
import type { PreferenceType } from '@mattermost/types/preferences';

interface UseChatMessengerChannelsSubscriptionProps {
  directChannelPrefs: PreferenceType[];
  refetchDirectChannelPrefs: () => void;
}

function extractOtherUserId(
  channelName: string,
  currentUserId: string,
): string | null {
  const members = channelName.split('__');
  return members.find((id) => id !== currentUserId) || null;
}

function isChannelHidden(prefs: PreferenceType[], userId: string): boolean {
  return prefs.some((pref) => pref.name === userId && pref.value === 'false');
}

export function useChatMessengerChannelsSubscription({
  directChannelPrefs,
  refetchDirectChannelPrefs,
}: UseChatMessengerChannelsSubscriptionProps) {
  const { mmUserId, mmApiClient } = useChatMessengerClientContext();
  const { eventBus } = useChatMessengerEventBusContext();

  const updateChannelVisibilityPreference = async (
    userId: string,
    value: string,
  ) => {
    try {
      await mmApiClient!.makeRequest({
        url: `users/${mmUserId}/preferences`,
        method: 'put',
        data: [
          {
            user_id: mmUserId,
            category: 'direct_channel_show',
            name: userId,
            value,
          },
        ],
      });

      refetchDirectChannelPrefs();
    } catch (error) {
      console.error('Error updating channel preference:', error);
    }
  };

  const handleMessageAdded = useLatestCallback(
    async (data: IChatMessengerEventBusMap['messageAdded']) => {
      // Early return if not a direct channel or missing channel name
      if (data.channelType !== 'D' || !data.channelName) {
        return;
      }

      const otherUserId = extractOtherUserId(data.channelName, mmUserId);
      if (!otherUserId) {
        return;
      }

      // Only update preference if channel is currently hidden
      if (!isChannelHidden(directChannelPrefs, otherUserId)) {
        return;
      }

      await updateChannelVisibilityPreference(otherUserId, 'true');
    },
  );

  useEffect(() => {
    eventBus.on('messageAdded', handleMessageAdded);
    return () => {
      eventBus.off('messageAdded', handleMessageAdded);
    };
  }, [eventBus, handleMessageAdded]);
}
