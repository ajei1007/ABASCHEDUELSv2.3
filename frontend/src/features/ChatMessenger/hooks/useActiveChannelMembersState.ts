import { useState, useMemo } from 'react';
import type { ChannelMembership } from '@mattermost/types/channels';
import type { UserProfile } from '@mattermost/types/users';

export const useActiveChannelMembersState = () => {
  const [channelMembersFetchStatus, setChannelMembersFetchStatus] = useState<
    'idle' | 'loading' | 'error' | 'success'
  >('idle');

  const [channelMembers, setChannelMembers] = useState<ChannelMembership[]>([]);
  const [channelUsersMap, setChannelUsersMap] = useState<
    Record<string, UserProfile>
  >({});

  const channelUserMemberMap = useMemo(
    () =>
      channelMembers.reduce(
        (acc: Record<string, ChannelMembership>, member: ChannelMembership) => {
          acc[member.user_id] = member;
          return acc;
        },
        {},
      ),
    [channelMembers],
  );

  return {
    channelMembers,
    setChannelMembers,
    channelUsersMap,
    setChannelUsersMap,
    channelMembersFetchStatus,
    setChannelMembersFetchStatus,
    channelUserMemberMap,
  };
};
