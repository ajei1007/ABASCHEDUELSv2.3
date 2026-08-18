import { useState } from 'react';
import { Stack, Button, Typography } from '@mui/material';
import { useChatMessengerChannelDetailModalContext } from '../../context/ChatMessengerChannelDetailModalContext';
import { useChatMessengerConfirmModalContext } from '../../context/ChatMessengerConfirmModalContext';
import { useChatMessengerClientContext } from '../../context/ChatMessengerClientContext';
import { useChatMessengerActiveChannelContext } from '../../context/ChatMessengerActiveChannelContext';
import { useChatMessengerEventBusContext } from '../../context/ChatMessengerEventBusContext';
import ChatMessengerAvatarBox from '../ChatMessengerAvatarBox';
import ChatMessengerChannelTitle from '../ChatMessengerChannelTitle';
import InfoViewActionItem, {
  type InfoViewActionItemProps,
} from './InfoViewActionItem';
import InfoViewActionsContainer from './InfoViewActionsContainer';
import { toast } from 'react-toastify';

const InfoViewMode = ({
  channelType,
  channelColor,
  channelAvatar,
  channelTitle,
  toggleMode,
  onChannelClosed = () => {},
}: {
  channelType: string;
  channelColor: {
    background: string;
    foreground: string;
  };
  channelAvatar: React.ReactNode;
  channelTitle: string;
  toggleMode: () => void;
  onChannelClosed?: () => void;
}) => {
  const { activeChannel, setActiveChannel } =
    useChatMessengerActiveChannelContext();
  const { mmUserId, mmApiClient } = useChatMessengerClientContext();
  const { actionsDisabled, setActionsDisabled } =
    useChatMessengerChannelDetailModalContext();
  const { eventBus } = useChatMessengerEventBusContext();
  const { showModal: showConfirmModal } = useChatMessengerConfirmModalContext();

  const [ongoingAction, setOngoingAction] = useState<
    '' | 'clear-channel' | 'close-channel' | 'exit-channel'
  >('');

  const isCloseChannelLoading = ongoingAction === 'close-channel';
  const isExitChannelLoading = ongoingAction === 'exit-channel';

  // TODO: Replace with actual logic to determine if the user is a moderator
  const isChannelModerator = true;

  const closeDirectChannel = async () => {
    const memberIds = activeChannel?.name.split('__');
    const otherUserId = memberIds?.find((id) => id !== mmUserId);

    await mmApiClient!.makeRequest({
      url: `users/${mmUserId}/preferences`,
      method: 'put',
      data: [
        {
          user_id: mmUserId,
          category: 'direct_channel_show',
          name: otherUserId,
          value: 'false',
        },
      ],
    });

    eventBus.emit('directChannelClosed', {
      channelId: activeChannel?.id,
      creatorId: mmUserId,
      teammateId: otherUserId!,
    });
  };

  const closeGroupChannel = async () => {
    await mmApiClient!.makeRequest({
      url: `channels/${activeChannel?.id}`,
      method: 'delete',
      params: {
        permanent: true,
      },
    });

    eventBus.emit('groupChannelDeleted', {
      channelId: activeChannel?.id!,
      deletedAt: new Date().getTime(),
    });
  };

  const handleCloseChannel = async () => {
    if (ongoingAction || actionsDisabled) {
      return;
    }

    const { isSubmit } = await showConfirmModal({
      message: `Are you sure you want to close this chat? This action cannot be undone.`,
    });
    if (!isSubmit) {
      return;
    }

    setActionsDisabled(true);
    setOngoingAction('close-channel');
    try {
      if (channelType === 'D') {
        await closeDirectChannel();
      } else if (channelType === 'P') {
        await closeGroupChannel();
      } else {
        return;
      }

      setActiveChannel(null);
      onChannelClosed();
      toast.success('Chat closed successfully!');
    } catch (error) {
      toast.error('Failed to close chat. Please try again later.');
      console.error('Error closing chat:', error);
    } finally {
      setActionsDisabled(false);
      setOngoingAction('');
    }
  };

  const handleExitChannel = async () => {
    if (ongoingAction || actionsDisabled) {
      return;
    }

    const { isSubmit } = await showConfirmModal({
      message: `Are you sure you want to exit this group? You will no longer receive messages from this group.`,
    });
    if (!isSubmit) {
      return;
    }

    setActionsDisabled(true);
    setOngoingAction('exit-channel');
    try {
      await mmApiClient!.makeRequest({
        url: `channels/${activeChannel?.id}/members/${mmUserId}`,
        method: 'delete',
      });

      setActiveChannel(null);
      onChannelClosed();
      toast.success(
        'You have exited the group successfully! You will no longer receive messages from this group.',
      );
    } catch (error) {
      toast.error('Failed to exit group. Please try again later.');
      console.error('Error exiting group:', error);
    } finally {
      setActionsDisabled(false);
      setOngoingAction('');
    }
  };

  const actionItems: InfoViewActionItemProps[] = [
    {
      label: `Close ${channelType === 'P' ? 'Group' : 'Chat'}`,
      isDisabled: isCloseChannelLoading || actionsDisabled,
      isLoading: isCloseChannelLoading,
      hasAccess:
        channelType === 'D' || (channelType === 'P' && isChannelModerator),
      onClick: handleCloseChannel,
    },
    ...(channelType === 'P'
      ? [
          {
            label: 'Exit Group',
            isDisabled: isExitChannelLoading || actionsDisabled,
            isLoading: isExitChannelLoading,
            hasAccess: true,
            onClick: handleExitChannel,
          },
        ]
      : []),
  ].filter((item) => item.hasAccess);

  return (
    <div>
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
          Info {actionsDisabled}
        </Typography>
        {channelType === 'P' && isChannelModerator && (
          <Button
            sx={{
              ml: 'auto',
              color: '#444!important',
              minWidth: 'auto!important',
              width: 'auto!important',
              px: '3px!important',
              '&:disabled': {
                color: '#ccc!important',
              },
            }}
            variant='text'
            color='inherit'
            size='small'
            disabled={actionsDisabled}
            onClick={toggleMode}
          >
            Edit
          </Button>
        )}
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
          pt={4}
          px={2}
          pb={2}
          rowGap={1.5}
        >
          <ChatMessengerAvatarBox
            element={channelAvatar}
            backgroundColor={channelColor.background}
            foregroundColor={channelColor.foreground}
          />
          <ChatMessengerChannelTitle
            title={channelTitle}
            // subtitle={
            //   channelMemberNames.length > 0
            //     ? `Group - ${channelMemberNames.length} members`
            //     : undefined
            // }
            alignItems='center'
          />

          <InfoViewActionsContainer
            items={actionItems}
            renderItem={(item) => (
              <InfoViewActionItem
                label={item.label}
                isDisabled={item.isDisabled}
                isLoading={item.isLoading}
                onClick={item.onClick}
              />
            )}
          />
        </Stack>
      </Stack>
    </div>
  );
};

export default InfoViewMode;
