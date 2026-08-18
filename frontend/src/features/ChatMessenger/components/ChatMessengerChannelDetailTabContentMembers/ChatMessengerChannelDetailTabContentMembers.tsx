import { useMemo, useState, useEffect } from 'react';
import { Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import type { ChannelMembership } from '@mattermost/types/channels';
import type { UserProfile } from '@mattermost/types/users';
import ChatMessengerChannelAddMember from '../ChatMessengerChannelAddMember';
import { useChatMessengerClientContext } from '../../context/ChatMessengerClientContext';
import { useChatMessengerChannelDetailModalContext } from '../../context/ChatMessengerChannelDetailModalContext';
import { useChatMessengerConfirmModalContext } from '../../context/ChatMessengerConfirmModalContext';
import { useChatMessengerActiveChannelContext } from '../../context/ChatMessengerActiveChannelContext';
import { useChatMessengerActiveChannelMembersContext } from '../../context/ChatMessengerActiveChannelMembersContext';
import { useChatMessengerEventBusContext } from '../../context/ChatMessengerEventBusContext';
import GroupMemberItem from './GroupMemberItem';
import GroupMemberItemsContainer from './GroupMemberItemsContainer';
import { getUserFullName, isMemberChannelAdmin } from '../../utils';
import type { TChannelMember } from '../../types';

function createChannelMember(
  membership: ChannelMembership,
  usersMap: Record<string, UserProfile>,
): TChannelMember {
  const user = usersMap[membership.user_id] ?? null;
  return {
    userId: membership.user_id,
    fullName: user ? getUserFullName(user) : 'Unknown Member',
    user: user || {},
    membership,
    isAdmin: isMemberChannelAdmin(membership),
    isLoading: false,
  };
}

const ChatMessengerChannelDetailTabContentMembers = () => {
  const { mmApiClient, mmUserId } = useChatMessengerClientContext();

  const { activeChannel } = useChatMessengerActiveChannelContext();

  const { channelMembers, channelUsersMap, channelMembersFetchStatus } =
    useChatMessengerActiveChannelMembersContext();

  const { actionsDisabled, setActionsDisabled } =
    useChatMessengerChannelDetailModalContext();

  const { showModal: showConfirmModal } = useChatMessengerConfirmModalContext();

  const { eventBus } = useChatMessengerEventBusContext();

  const [members, setMembers] = useState<TChannelMember[]>(() =>
    channelMembers.map((member) =>
      createChannelMember(member, channelUsersMap),
    ),
  );

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        // Place current user first
        if (a.userId === mmUserId) {
          return -1;
        }
        if (b.userId === mmUserId) {
          return 1;
        }

        // Otherwise, sort by name
        const nameA = getUserFullName(a.user).toLowerCase();
        const nameB = getUserFullName(b.user).toLowerCase();
        return nameA.localeCompare(nameB);
      }),
    [members, mmUserId],
  );

  const isChannelAdmin = useMemo(() => {
    const currentMember = members.find((m) => m.userId === mmUserId);
    if (!currentMember) {
      return false;
    }
    return isMemberChannelAdmin(currentMember.membership);
  }, [members, mmUserId]);

  useEffect(() => {
    if (channelMembersFetchStatus === 'success') {
      setMembers((prev) => {
        const isLoadingMap = prev.reduce(
          (acc, member) => ({ ...acc, [member.userId]: member.isLoading }),
          {} as Record<string, boolean>,
        );
        return channelMembers.map((member) => ({
          ...createChannelMember(member, channelUsersMap),
          isLoading: isLoadingMap[member.user_id] || false,
        }));
      });
    }
  }, [channelMembersFetchStatus, channelMembers, channelUsersMap]);

  const handleRemoveFromGroup = async (member: TChannelMember) => {
    if (member.isLoading || actionsDisabled) {
      return;
    }

    if (member.userId === mmUserId) {
      toast.error('You cannot remove yourself from the group.');
      return;
    }

    const { isSubmit } = await showConfirmModal({
      message: `Are you sure you want to remove ${member.fullName || 'this member'} from the group?`,
    });
    if (!isSubmit) {
      return;
    }

    setMembers((prevMembers) =>
      prevMembers.map((m) =>
        m.userId === member.userId ? { ...m, isLoading: true } : m,
      ),
    );
    setActionsDisabled(true);
    try {
      await mmApiClient?.makeRequest({
        url: `channels/${activeChannel?.id}/members/${member.userId}`,
        method: 'delete',
      });

      toast.success(`${member.fullName || 'Member'} removed from group.`);
    } catch (error) {
      toast.error('Failed to remove member from group.');
      console.error('Error removing member from group:', error);
    } finally {
      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m.userId === member.userId ? { ...m, isLoading: false } : m,
        ),
      );
      setActionsDisabled(false);
    }
  };

  const handleToggleAdmin = async (member: TChannelMember) => {
    if (member.isLoading || actionsDisabled) {
      return;
    }

    if (member.userId === mmUserId) {
      toast.error('You cannot change your own admin status.');
      return;
    }

    const { isSubmit } = await showConfirmModal({
      message: `Are you sure you want to ${member.isAdmin ? 'dissmiss' : 'make'} ${member.fullName || 'this member'} as admin?`,
    });
    if (!isSubmit) {
      return;
    }

    setMembers((prevMembers) =>
      prevMembers.map((m) =>
        m.userId === member.userId
          ? {
              ...m,
              isLoading: true,
            }
          : m,
      ),
    );
    setActionsDisabled(true);
    try {
      const newRoles = [
        'channel_user',
        ...(member.isAdmin ? [] : ['channel_admin']),
      ].join(' ');

      await mmApiClient?.makeRequest({
        url: `channels/${activeChannel?.id}/members/${member.userId}/roles`,
        method: 'put',
        data: {
          roles: newRoles,
        },
      });

      eventBus.emit('memberChannelRoleChanged', {
        channelId: activeChannel?.id!,
        userId: member.userId,
        roles: newRoles,
      });

      toast.success(
        `${member.fullName || 'Member'} ${
          member.isAdmin ? 'dissmissed as admin' : 'made an admin'
        }.`,
      );
    } catch (error) {
      toast.error('Failed to change admin status.');
      console.error('Error changing admin status:', error);
    } finally {
      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m.user?.id === member.user?.id ? { ...m, isLoading: false } : m,
        ),
      );
      setActionsDisabled(false);
    }
  };

  return (
    <>
      <Stack
        height='70px'
        px={2}
        py={1.5}
        flexDirection='row'
        alignItems='center'
        flexShrink={0}
        sx={{
          backgroundColor: '#f4f4f4',
          boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.15rem!important',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          Members
        </Typography>
        <ChatMessengerChannelAddMember />
      </Stack>
      <Stack
        flexGrow={1}
        flexDirection='column'
        sx={{
          overflowY: 'auto',
        }}
      >
        <Stack
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
          pt={2}
          px={2}
          pb={2}
        >
          <GroupMemberItemsContainer
            items={sortedMembers}
            renderItem={(member) => (
              <GroupMemberItem
                member={member}
                yourself={member.userId === mmUserId}
                hasAccessRemoveFromGroup={isChannelAdmin}
                hasAcceesMakeAdmin={isChannelAdmin}
                onRemoveFromGroup={handleRemoveFromGroup}
                onToggleAdmin={handleToggleAdmin}
              />
            )}
          />
        </Stack>
      </Stack>
    </>
  );
};

export default ChatMessengerChannelDetailTabContentMembers;
