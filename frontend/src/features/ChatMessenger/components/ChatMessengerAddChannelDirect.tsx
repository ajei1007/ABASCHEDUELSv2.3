import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import type { ServerChannel } from '@mattermost/types/channels';
import ChatMessengerAvatarBox from './ChatMessengerAvatarBox';
import ChatMessengerUserGroupSkeleton from './ChatMessengerUserGroupSkeleton';
import CustomInput from 'components/CustomInputModal/CustomInput';
import { useUsersGroupedByFirstLetter } from '../hooks/useUsersGroupedByFirstLetter';
import { useDebouncedSearchQuery } from '../hooks/useDebouncedSearchQuery';
import { useAddChannelPopoverContext } from '../context/AddChannelPopoverContext';
import { useChatMessengerUsersContext } from '../context/ChatMessengerUsersContext';
import { useChatMessengerConfirmModalContext } from '../context/ChatMessengerConfirmModalContext';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';
import { useChatMessengerEventBusContext } from '../context/ChatMessengerEventBusContext';
import { formatNameInitial } from '../utils';
import { generateColorsForName } from '../utils/colors';
import type { IApiChatAvailableUserItem } from 'types';

const UserItem = ({
  user,
  isLoading,
  isDisabled = false,
  onSelect,
}: {
  user: IApiChatAvailableUserItem;
  isLoading: boolean;
  isDisabled?: boolean;
  onSelect: (user: IApiChatAvailableUserItem) => void;
}) => {
  const fullName = user.fullName || user.mmUserId;
  const colors = useMemo(() => generateColorsForName(fullName), [fullName]);

  return (
    <Stack
      key={user.mmUserId}
      component='button'
      height='40px'
      px={0.75}
      flexDirection='row'
      alignItems='center'
      columnGap={1.5}
      borderRadius='8px'
      sx={{
        '&:hover': {
          backgroundColor: '#f5f5f5',
          cursor: 'pointer',
        },
        '&:active': {
          backgroundColor: '#e0e0e0',
        },
        '&:disabled': {
          backgroundColor: '#fff',
          cursor: 'not-allowed',
          opacity: 0.75,
        },
        backgroundColor: '#fff',
        transition: 'background-color 0.2s ease',
        border: 'none',
        textAlign: 'left',
        color: '#333',
      }}
      disabled={isLoading || isDisabled}
      onClick={() => {
        onSelect(user);
      }}
    >
      <ChatMessengerAvatarBox
        size='sm'
        element={
          <Typography
            fontSize='0.725rem!important'
            letterSpacing='1px'
            lineHeight={1.2}
            fontWeight='500'
          >
            {formatNameInitial(fullName)}
          </Typography>
        }
        backgroundColor={colors.background}
        foregroundColor={colors.foreground}
      />
      <Stack flexGrow={1} pt='1px' flexDirection='column'>
        <Typography
          fontSize='0.875rem!important'
          color='#333'
          overflow='hidden'
          whiteSpace='nowrap'
          textOverflow='ellipsis'
          lineHeight={1.3}
        >
          {user.fullName ?? user.mmUserId}
        </Typography>
      </Stack>
    </Stack>
  );
};

const ChatMessengerAddChannelDirect = ({
  toggleMode,
}: {
  toggleMode: () => void;
}) => {
  const { mmApiClient, mmUserId } = useChatMessengerClientContext();
  const { eventBus } = useChatMessengerEventBusContext();

  const { close: closePopover } = useAddChannelPopoverContext();

  const { users, fetchStatus, fetchUsers } = useChatMessengerUsersContext();
  const { showModal: showConfirmModal } = useChatMessengerConfirmModalContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useDebouncedSearchQuery(searchQuery, setSearchQuery);

  useEffect(() => {
    fetchUsers({
      searchQuery,
    });
  }, [searchQuery, fetchUsers]);

  const [isLoading, setIsLoading] = useState(false);

  const groupedUsers = useUsersGroupedByFirstLetter(users);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedSearchQuery(event.target.value);
  };

  const createDirectChannel = async (user: IApiChatAvailableUserItem) => {
    if (isLoading) {
      // Prevent multiple clicks while loading
      return;
    }

    if (!mmApiClient) {
      console.error('Mattermost client is not initialized.');
      return;
    }

    if (mmUserId === user.mmUserId) {
      // Prevent creating a channel with self or if client user is not set
      console.error(
        'Cannot create a direct channel with self or without a valid user.',
      );
      return;
    }

    const { isSubmit } = await showConfirmModal({
      message: `Are you sure you want to create a direct channel with ${user.fullName || user.mmUserId}?`,
    });

    if (!isSubmit) {
      return;
    }

    setIsLoading(true);
    try {
      const channel = await mmApiClient.makeRequest<ServerChannel>({
        url: 'channels/direct',
        method: 'post',
        data: [mmUserId, user.mmUserId],
      });

      await mmApiClient.makeRequest({
        url: `users/${mmUserId}/preferences`,
        method: 'put',
        data: [
          {
            user_id: mmUserId,
            category: 'direct_channel_show',
            name: user.mmUserId,
            value: 'true',
          },
        ],
      });

      eventBus.emit('directChannelCreated', {
        channelId: channel.id,
        creatorId: mmUserId,
        teammateId: user.mmUserId,
      });

      closePopover();
    } catch (error) {
      console.error('Error creating direct channel:', error);
      toast.error('Failed to create direct channel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack
      flexGrow={1}
      flexDirection='column'
      sx={{
        backgroundColor: '#f0f0f0',
      }}
    >
      <Stack
        width='100%'
        flexDirection='column'
        alignItems='center'
        pt={1.5}
        pb={2}
        px={2}
        rowGap={2}
        flexShrink={0}
      >
        <Stack
          sx={{
            width: '100%',
            position: 'relative',
          }}
          height='38px'
          flexDirection='row'
          alignItems='center'
          justifyContent='space-between'
          columnGap={1.5}
        >
          {isLoading && (
            <CircularProgress
              size='1.1rem'
              sx={{
                ml: 'auto',
                color: '#666',
              }}
            />
          )}
          <IconButton
            sx={{
              ml: isLoading ? undefined : 'auto',
              color: '#666',
              '&:disabled': {
                color: '#aaa',
              },
            }}
            disabled={isLoading}
            onClick={toggleMode}
          >
            <GroupAddIcon
              sx={{
                fontSize: '1.2rem',
              }}
            />
          </IconButton>

          <Typography
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            fontSize='1rem!important'
            fontWeight='bold'
            color='#333'
          >
            New Chat
          </Typography>
        </Stack>
      </Stack>
      <Stack
        width='100%'
        flexDirection='column'
        alignItems='center'
        pb={2}
        px={2}
        flexShrink={0}
      >
        <Box sx={{ width: '100%' }}>
          <CustomInput
            value={debouncedSearchQuery}
            placeholder='Search name'
            readOnly={isLoading}
            onInput={handleSearchInput}
          />
        </Box>
      </Stack>
      <Stack
        flexGrow={1}
        sx={{
          position: 'relative',
        }}
      >
        <Stack
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'auto',
          }}
          flexDirection='column'
          rowGap={2}
          pb={2}
        >
          {fetchStatus === 'loading' ? (
            <>
              <ChatMessengerUserGroupSkeleton />
              <ChatMessengerUserGroupSkeleton />
            </>
          ) : fetchStatus === 'error' ? (
            <Stack
              flexDirection='column'
              alignItems='center'
              justifyContent='center'
              height='100%'
              pb={8}
            >
              <Typography color='#f00' textAlign='center'>
                Failed to load users. <br></br> Please try again.
              </Typography>
            </Stack>
          ) : Object.keys(groupedUsers).length === 0 ? (
            <Stack
              flexDirection='column'
              alignItems='center'
              justifyContent='center'
              height='100%'
              pb={8}
            >
              <Typography color='#666'>No users found</Typography>
            </Stack>
          ) : (
            Object.entries(groupedUsers).map(([key, users]) => (
              <Stack key={key} px={2} flexDirection='column'>
                <Typography
                  fontSize='1rem!important'
                  fontWeight='bold'
                  color='#777'
                  mb={0.5}
                  px={1}
                >
                  {key}
                </Typography>
                <Stack
                  flexDirection='column'
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    p: 0.5,
                  }}
                >
                  {users.map((user) => (
                    <UserItem
                      key={user.mmUserId}
                      user={user}
                      isLoading={isLoading}
                      isDisabled={user.mmUserId === mmUserId}
                      onSelect={createDirectChannel}
                    />
                  ))}
                </Stack>
              </Stack>
            ))
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ChatMessengerAddChannelDirect;
