import { useEffect } from 'react';
import type { Channel } from '@mattermost/types/channels';
import type {
  IChatMessengerEventBusMap,
  TChatMessengerEventBus,
} from '../context/ChatMessengerEventBusContext';

interface UseActiveChannelMembersSubscriptionProps {
  activeChannel: Channel | null;
  eventBus: TChatMessengerEventBus;
  beingFetchedUsers: React.MutableRefObject<
    {
      channelId: string;
      userId: string;
      abortController: AbortController;
    }[]
  >;
  handleMemberLeftGroupChannel: (
    data: IChatMessengerEventBusMap['memberLeftGroupChannel'],
  ) => void;
  handleMemberChannelRoleChanged: (
    data: IChatMessengerEventBusMap['memberChannelRoleChanged'],
  ) => void;
  handleMemberJoinedGroupChannel: (
    data: IChatMessengerEventBusMap['memberJoinedGroupChannel'],
  ) => void;
}

export const useActiveChannelMembersSubscription = ({
  activeChannel,
  eventBus,
  beingFetchedUsers,
  handleMemberLeftGroupChannel,
  handleMemberChannelRoleChanged,
  handleMemberJoinedGroupChannel,
}: UseActiveChannelMembersSubscriptionProps) => {
  // Cleanup beingFetchedUsers when active channel changes
  useEffect(() => {
    if (!activeChannel) {
      beingFetchedUsers.current.forEach((u) => {
        u.abortController.abort();
      });
      beingFetchedUsers.current = [];
      return;
    }

    const channelId = activeChannel.id;
    beingFetchedUsers.current = beingFetchedUsers.current.reduce(
      (acc, u) => {
        if (u.channelId !== channelId) {
          // If the user is not in the current active channel, abort their fetch
          u.abortController.abort();
        } else {
          // Keep users in the current active channel
          acc.push(u);
        }
        return acc;
      },
      [] as typeof beingFetchedUsers.current,
    );
  }, [activeChannel, beingFetchedUsers]);

  // Subscribe to event bus events
  useEffect(() => {
    if (!activeChannel) {
      return;
    }

    eventBus.on('memberLeftGroupChannel', handleMemberLeftGroupChannel);
    eventBus.on('memberChannelRoleChanged', handleMemberChannelRoleChanged);
    eventBus.on('memberJoinedGroupChannel', handleMemberJoinedGroupChannel);

    return () => {
      eventBus.off('memberLeftGroupChannel', handleMemberLeftGroupChannel);
      eventBus.off('memberChannelRoleChanged', handleMemberChannelRoleChanged);
      eventBus.off('memberJoinedGroupChannel', handleMemberJoinedGroupChannel);
    };
  }, [
    eventBus,
    activeChannel,
    handleMemberLeftGroupChannel,
    handleMemberChannelRoleChanged,
    handleMemberJoinedGroupChannel,
  ]);
};
