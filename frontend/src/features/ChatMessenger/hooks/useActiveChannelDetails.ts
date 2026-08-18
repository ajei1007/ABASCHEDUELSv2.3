import { useMemo } from 'react';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';
import { useChatMessengerActiveChannelContext } from '../context/ChatMessengerActiveChannelContext';
import { useChatMessengerActiveChannelMembersContext } from '../context/ChatMessengerActiveChannelMembersContext';
import { formatDateLastSeen, getUserFullName } from '../utils';
import { useChannelDetails } from './useChannelDetails';

export function useActiveChannelDetails() {
  const { mmUserId } = useChatMessengerClientContext();
  const { activeChannel } = useChatMessengerActiveChannelContext();
  const { channelMembers, channelUsersMap, channelMembersFetchStatus } =
    useChatMessengerActiveChannelMembersContext();

  const { channelType, channelAvatar, channelTitle, channelColor } =
    useChannelDetails(activeChannel);

  const channelSubtitle = useMemo(() => {
    if (channelType === 'other' || channelMembersFetchStatus !== 'success') {
      return '';
    }

    switch (channelType) {
      case 'D': {
        const otherUser = channelMembers.find(
          (member) => member.user_id !== mmUserId,
        );
        return otherUser?.last_viewed_at
          ? formatDateLastSeen(otherUser.last_viewed_at)
          : '';
      }
      case 'P': {
        const memberNames = channelMembers
          .map((member) => channelUsersMap[member.user_id])
          .filter(Boolean)
          .map(getUserFullName)
          .join(', ');
        return memberNames;
      }
      default:
        return '';
    }
  }, [
    channelType,
    channelMembers,
    channelUsersMap,
    channelMembersFetchStatus,
    mmUserId,
  ]);

  return {
    channelType,
    channelAvatar,
    channelTitle,
    channelSubtitle,
    channelColor,
  };
}
