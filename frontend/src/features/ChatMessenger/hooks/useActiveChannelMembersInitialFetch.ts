import { useEffect } from 'react';
import type { Channel } from '@mattermost/types/channels';

interface UseActiveChannelMembersInitialFetchProps {
  activeChannel: Channel | null;
  fetchChannelMembers: (params: {
    channelId: string;
    signal: AbortSignal;
  }) => Promise<void>;
}

export const useActiveChannelMembersInitialFetch = ({
  activeChannel,
  fetchChannelMembers,
}: UseActiveChannelMembersInitialFetchProps) => {
  useEffect(() => {
    if (!activeChannel) {
      return;
    }

    const abortController = new AbortController();

    fetchChannelMembers({
      channelId: activeChannel.id,
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
    };
  }, [activeChannel, fetchChannelMembers]);
};
