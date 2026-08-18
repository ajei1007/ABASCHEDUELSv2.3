import { useMemo, useContext, createContext } from 'react';
import type { ChannelMembership } from '@mattermost/types/channels';
import type { UserProfile } from '@mattermost/types/users';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';
import { useChatMessengerActiveChannelContext } from '../context/ChatMessengerActiveChannelContext';
import { useChatMessengerEventBusContext } from '../context/ChatMessengerEventBusContext';
import { useActiveChannelMembersState } from '../hooks/useActiveChannelMembersState';
import { useActiveChannelMembersFetch } from '../hooks/useActiveChannelMembersFetch';
import { useActiveChannelMembersEventHandlers } from '../hooks/useActiveChannelMembersEventHandlers';
import { useActiveChannelMembersSubscription } from '../hooks/useActiveChannelMembersSubscription';
import { useActiveChannelMembersInitialFetch } from '../hooks/useActiveChannelMembersInitialFetch';

export const ChatMessengerActiveChannelMembersContext = createContext<{
  channelMembers: ChannelMembership[];
  channelUsersMap: Record<string, UserProfile>;
  channelUserMemberMap: Record<string, ChannelMembership>;
  channelMembersFetchStatus: 'idle' | 'loading' | 'error' | 'success';
}>({
  channelMembers: [],
  channelUsersMap: {},
  channelUserMemberMap: {},
  channelMembersFetchStatus: 'idle',
});

export const useChatMessengerActiveChannelMembersContext = () => {
  return useContext(ChatMessengerActiveChannelMembersContext);
};

export const ChatMessengerActiveChannelMembersContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { mmApiClient } = useChatMessengerClientContext();
  const { activeChannel } = useChatMessengerActiveChannelContext();
  const { eventBus } = useChatMessengerEventBusContext();

  // State management
  const {
    channelMembers,
    setChannelMembers,
    channelUsersMap,
    setChannelUsersMap,
    channelMembersFetchStatus,
    setChannelMembersFetchStatus,
    channelUserMemberMap,
  } = useActiveChannelMembersState();

  // Fetch functionality
  const { fetchChannelMembers } = useActiveChannelMembersFetch({
    mmApiClient,
    setChannelMembers,
    setChannelUsersMap,
    setChannelMembersFetchStatus,
  });

  // Event handlers
  const {
    beingFetchedUsers,
    handleMemberLeftGroupChannel,
    handleMemberChannelRoleChanged,
    handleMemberJoinedGroupChannel,
  } = useActiveChannelMembersEventHandlers({
    activeChannel,
    mmApiClient,
    setChannelMembers,
    setChannelUsersMap,
  });

  // Initial fetch effect
  useActiveChannelMembersInitialFetch({
    activeChannel,
    fetchChannelMembers,
  });

  // Event subscriptions
  useActiveChannelMembersSubscription({
    activeChannel,
    eventBus,
    beingFetchedUsers,
    handleMemberLeftGroupChannel,
    handleMemberChannelRoleChanged,
    handleMemberJoinedGroupChannel,
  });

  const contextValue = useMemo(
    () => ({
      channelMembers,
      channelUsersMap,
      channelUserMemberMap,
      channelMembersFetchStatus,
    }),
    [
      channelMembers,
      channelUsersMap,
      channelUserMemberMap,
      channelMembersFetchStatus,
    ],
  );

  return (
    <ChatMessengerActiveChannelMembersContext.Provider value={contextValue}>
      {children}
    </ChatMessengerActiveChannelMembersContext.Provider>
  );
};
