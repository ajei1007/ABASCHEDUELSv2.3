import React, { useCallback } from 'react';
import type { ServerChannel } from '@mattermost/types/channels';
import type { IChatMessengerEventBusMap } from '../context/ChatMessengerEventBusContext';

interface UseActiveChannelEventHandlersProps {
  activeChannel: ServerChannel | null;
  setActiveChannelState: React.Dispatch<
    React.SetStateAction<ServerChannel | null>
  >;
}

export const useActiveChannelEventHandlers = ({
  activeChannel,
  setActiveChannelState,
}: UseActiveChannelEventHandlersProps) => {
  const handleKickedFromGroupChannel = useCallback(
    async ({
      channelId,
    }: IChatMessengerEventBusMap['kickedFromGroupChannel']) => {
      if (!activeChannel) {
        return;
      }

      if (activeChannel.id === channelId) {
        setActiveChannelState(null);
      }
    },
    [activeChannel, setActiveChannelState],
  );

  const handleGroupChannelUpdated = useCallback(
    async ({
      channelId,
      channelData,
    }: IChatMessengerEventBusMap['groupChannelUpdated']) => {
      if (!activeChannel) {
        return;
      }

      if (activeChannel.id === channelId) {
        setActiveChannelState((prevChannel: ServerChannel | null) => {
          if (prevChannel && channelData) {
            return {
              ...prevChannel,
              display_name:
                channelData?.display_name || prevChannel.display_name,
              purpose: channelData?.purpose || prevChannel.purpose,
              create_at: channelData?.create_at || prevChannel.create_at,
              update_at: channelData?.update_at || prevChannel.update_at,
              delete_at: channelData?.delete_at || prevChannel.delete_at,
              total_msg_count:
                channelData?.total_msg_count || prevChannel.total_msg_count,
              last_post_at:
                channelData?.last_post_at || prevChannel.last_post_at,
              total_msg_count_root:
                channelData?.total_msg_count_root ||
                prevChannel.total_msg_count_root,
              last_root_post_at:
                channelData?.last_root_post_at || prevChannel.last_root_post_at,
            };
          }
          return prevChannel;
        });
      }
    },
    [activeChannel, setActiveChannelState],
  );

  return {
    handleKickedFromGroupChannel,
    handleGroupChannelUpdated,
  };
};
