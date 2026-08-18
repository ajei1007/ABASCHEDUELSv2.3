import { useCallback, useRef } from 'react';
import type { ChannelMembership } from '@mattermost/types/channels';
import type { UserProfile } from '@mattermost/types/users';
import type { Channel } from '@mattermost/types/channels';
import type { IChatMessengerEventBusMap } from '../context/ChatMessengerEventBusContext';
import type { MmApiClient } from '../services/mmApiClient';

interface UseActiveChannelMembersEventHandlersProps {
  activeChannel: Channel | null;
  mmApiClient: MmApiClient | null;
  setChannelMembers: React.Dispatch<React.SetStateAction<ChannelMembership[]>>;
  setChannelUsersMap: React.Dispatch<
    React.SetStateAction<Record<string, UserProfile>>
  >;
}

export const useActiveChannelMembersEventHandlers = ({
  activeChannel,
  mmApiClient,
  setChannelMembers,
  setChannelUsersMap,
}: UseActiveChannelMembersEventHandlersProps) => {
  const beingFetchedUsers = useRef<
    {
      channelId: string;
      userId: string;
      abortController: AbortController;
    }[]
  >([]);

  const handleMemberLeftGroupChannel = useCallback(
    ({
      channelId,
      userId,
    }: IChatMessengerEventBusMap['memberLeftGroupChannel']) => {
      const activeChannelId = activeChannel?.id;
      if (activeChannelId !== channelId) {
        return;
      }

      setChannelMembers((prevMembers) =>
        prevMembers.filter((member) => member.user_id !== userId),
      );
      setChannelUsersMap((prevUsers) => {
        const newUsers = { ...prevUsers };
        delete newUsers[userId];
        return newUsers;
      });
    },
    [activeChannel, setChannelMembers, setChannelUsersMap],
  );

  const handleMemberChannelRoleChanged = useCallback(
    ({
      channelId,
      userId,
      roles,
    }: IChatMessengerEventBusMap['memberChannelRoleChanged']) => {
      const activeChannelId = activeChannel?.id;
      if (activeChannelId !== channelId) {
        return;
      }

      setChannelMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.user_id === userId
            ? {
                ...member,
                roles,
              }
            : member,
        ),
      );
    },
    [activeChannel, setChannelMembers],
  );

  const handleMemberJoinedGroupChannel = useCallback(
    async ({
      channelId,
      userId,
    }: IChatMessengerEventBusMap['memberJoinedGroupChannel']) => {
      const activeChannelId = activeChannel?.id;
      if (activeChannelId !== channelId) {
        // If the active channel is not the one where the member joined, do nothing
        return;
      }

      if (beingFetchedUsers.current.some((u) => u.userId === userId)) {
        // If the user is already being fetched, do nothing
        return;
      }

      const abortController = new AbortController();
      beingFetchedUsers.current.push({
        channelId,
        userId,
        abortController,
      });

      try {
        const [membership, user] = await Promise.all([
          mmApiClient?.makeRequest({
            url: `channels/${channelId}/members/${userId}`,
            method: 'get',
            signal: abortController.signal,
          }) as Promise<ChannelMembership>,
          mmApiClient?.makeRequest({
            url: `users/${userId}`,
            method: 'get',
            signal: abortController.signal,
          }) as Promise<UserProfile>,
        ]);

        if (!membership || !user) {
          return;
        }

        setChannelMembers((prevMembers) => [
          ...prevMembers.filter((m) => m.user_id !== userId),
          membership,
        ]);
        setChannelUsersMap((prevUsers) => ({
          ...prevUsers,
          [user.id]: user,
        }));
      } catch (error) {
        if (
          mmApiClient?.isCancelled(error) ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          return;
        }
        console.error('Error fetching channel members:', error);
      } finally {
        beingFetchedUsers.current = beingFetchedUsers.current.filter(
          (u) => u.userId !== userId || u.channelId !== channelId,
        );
      }
    },
    [activeChannel, mmApiClient, setChannelMembers, setChannelUsersMap],
  );

  return {
    beingFetchedUsers,
    handleMemberLeftGroupChannel,
    handleMemberChannelRoleChanged,
    handleMemberJoinedGroupChannel,
  };
};
