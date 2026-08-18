import { useCallback } from 'react';
import type { ChannelMembership } from '@mattermost/types/channels';
import type { UserProfile } from '@mattermost/types/users';
import type { MmApiClient } from '../services/mmApiClient';

interface UseActiveChannelMembersFetchProps {
  mmApiClient: MmApiClient | null;
  setChannelMembers: React.Dispatch<React.SetStateAction<ChannelMembership[]>>;
  setChannelUsersMap: React.Dispatch<
    React.SetStateAction<Record<string, UserProfile>>
  >;
  setChannelMembersFetchStatus: React.Dispatch<
    React.SetStateAction<'idle' | 'loading' | 'error' | 'success'>
  >;
}

export const useActiveChannelMembersFetch = ({
  mmApiClient,
  setChannelMembers,
  setChannelUsersMap,
  setChannelMembersFetchStatus,
}: UseActiveChannelMembersFetchProps) => {
  const fetchChannelMembers = useCallback(
    async ({
      channelId,
      signal,
    }: {
      channelId: string;
      signal: AbortSignal;
    }) => {
      if (!mmApiClient) {
        return;
      }

      setChannelMembersFetchStatus('loading');
      try {
        const members = (await mmApiClient.makeRequest({
          url: `channels/${channelId}/members`,
          method: 'get',
          params: {
            page: 0,
            per_page: 1000,
          },
          signal,
        })) as ChannelMembership[];

        const userIds = members.map(
          (member: ChannelMembership) => member.user_id,
        );
        const users = (await mmApiClient.makeRequest({
          url: `users/ids`,
          method: 'post',
          data: userIds,
          signal,
        })) as UserProfile[];

        const usersMap = users.reduce(
          (acc: Record<string, UserProfile>, user: UserProfile) => {
            acc[user.id] = user;
            return acc;
          },
          {},
        );

        setChannelMembers(members);
        setChannelUsersMap(usersMap);
        setChannelMembersFetchStatus('success');
      } catch (error) {
        if (
          mmApiClient.isCancelled(error) ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          setChannelMembers([]);
          setChannelUsersMap({});
          setChannelMembersFetchStatus('idle');
          return;
        }
        console.error('Error fetching channel members:', error);
        setChannelMembersFetchStatus('error');
      }
    },
    [
      mmApiClient,
      setChannelMembers,
      setChannelUsersMap,
      setChannelMembersFetchStatus,
    ],
  );

  return {
    fetchChannelMembers,
  };
};
