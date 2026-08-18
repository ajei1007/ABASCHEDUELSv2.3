import { useMemo } from 'react';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';
import type { ServerChannel } from '@mattermost/types/channels';
import type { PreferenceType } from '@mattermost/types/preferences';

interface UseChatMessengerChannelsVisibilityProps {
  channels: ServerChannel[];
  directChannelPrefs: PreferenceType[];
}

export function useChatMessengerChannelsVisibility({
  channels,
  directChannelPrefs,
}: UseChatMessengerChannelsVisibilityProps) {
  const { mmUserId } = useChatMessengerClientContext();

  const visibleChannels = useMemo(() => {
    return channels.filter((channel) => {
      // Only filter direct channels (type 'D')
      if (channel.type !== 'D') {
        return true;
      }

      // Extract the other user ID from the direct channel name
      const memberIds = channel.name.split('__');
      const otherUserId = memberIds.find((id) => id !== mmUserId);

      if (!otherUserId) {
        return true; // Show channel if we can't determine the other user
      }

      // Check if the direct channel is hidden via preferences
      const channelPref = directChannelPrefs.find(
        (pref) => pref.name === otherUserId,
      );
      return channelPref?.value !== 'false';
    });
  }, [channels, directChannelPrefs, mmUserId]);

  return {
    visibleChannels,
  };
}
