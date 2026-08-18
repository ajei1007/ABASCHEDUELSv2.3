import { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Stack,
  Typography,
  Button,
  Checkbox,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useUsersGroupedByFirstLetter } from '../hooks/useUsersGroupedByFirstLetter';
import { useDebouncedSearchQuery } from '../hooks/useDebouncedSearchQuery';
import { useAddChannelPopoverContext } from '../context/AddChannelPopoverContext';
import { useChatMessengerChannelDetailModalContext } from '../context/ChatMessengerChannelDetailModalContext';
import { useChatMessengerUsersContext } from '../context/ChatMessengerUsersContext';
import { useChatMessengerConfirmModalContext } from '../context/ChatMessengerConfirmModalContext';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';
import { useChatMessengerActiveChannelContext } from '../context/ChatMessengerActiveChannelContext';
import { useChatMessengerActiveChannelMembersContext } from '../context/ChatMessengerActiveChannelMembersContext';
import ChatMessengerAvatarBox from './ChatMessengerAvatarBox';
import ChatMessengerUserGroupSkeleton from './ChatMessengerUserGroupSkeleton';
import CustomInput from 'components/CustomInputModal/CustomInput';
import { formatNameInitial } from '../utils';
import { generateColorsForName } from '../utils/colors';
import type { IApiChatAvailableUserItem } from 'types';

const SelectedUserItem = ({
  user,
  isDisabled,
  onRemove,
}: {
  user: {
    mmUserId: string;
    fullName: string;
  };
  isDisabled: boolean;
  onRemove: () => void;
}) => {
  const fullName = user.fullName || user.mmUserId;
  const colors = useMemo(() => generateColorsForName(fullName), [fullName]);
  return (
    <Tooltip title={user.fullName} arrow placement='top'>
      <Box>
        <ChatMessengerAvatarBox
          sx={{
            position: 'relative',
          }}
          element={
            <>
              <Typography
                fontSize='1.25rem!important'
                fontWeight='bold'
                letterSpacing='1px'
              >
                {formatNameInitial(fullName)}
              </Typography>
              <Box
                component='button'
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '18px',
                  height: '18px',
                  transform: 'translate(15%, -15%)',
                  backgroundColor: 'red',
                  color: '#fff',
                  p: 0,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '100%',
                  cursor: 'pointer',
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    cursor: 'not-allowed',
                  },
                }}
                disabled={isDisabled}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove();
                }}
              >
                <CloseIcon
                  sx={{
                    fontSize: '14px',
                  }}
                />
              </Box>
            </>
          }
          backgroundColor={colors.background}
          foregroundColor={colors.foreground}
        />
      </Box>
    </Tooltip>
  );
};

const UserItem = ({
  user,
  isSelected,
  isDisabled,
  onToggle,
}: {
  user: IApiChatAvailableUserItem;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (user: IApiChatAvailableUserItem) => void;
}) => {
  const fullName = user.fullName || user.id;
  const colors = useMemo(() => generateColorsForName(fullName), [fullName]);

  return (
    <Stack
      key={user.id}
      component='button'
      height='40px'
      pl={0.75}
      pr={1}
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
          opacity: 0.75,
          cursor: 'not-allowed',
        },
        backgroundColor: '#fff',
        transition: 'background-color 0.2s ease',
        border: 'none',
        textAlign: 'left',
      }}
      disabled={isDisabled}
      onClick={() => {
        onToggle(user);
      }}
    >
      <ChatMessengerAvatarBox
        size='sm'
        element={
          <Typography
            fontSize='0.725rem!important'
            letterSpacing='1px'
            fontWeight='500'
            lineHeight={1.2}
          >
            {formatNameInitial(user.fullName || user.id)}
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
          {user.fullName ?? user.id}
        </Typography>
      </Stack>
      <Box ml='auto' onClick={(event) => event.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onChange={() => {
            onToggle(user);
          }}
          sx={{
            p: 0,
          }}
          disabled={isDisabled}
          disableRipple
        />
      </Box>
    </Stack>
  );
};

const ChatMessengerChannelAddMemberContent = () => {
  const { mmUserId, mmApiClient } = useChatMessengerClientContext();
  const { activeChannel } = useChatMessengerActiveChannelContext();
  const { actionsDisabled, setActionsDisabled } =
    useChatMessengerChannelDetailModalContext();

  const { showModal: showConfirmModal } = useChatMessengerConfirmModalContext();

  const { channelUsersMap } = useChatMessengerActiveChannelMembersContext();

  const channelUserIdsSet = useMemo(
    () => new Set(Object.keys(channelUsersMap)),
    [channelUsersMap],
  );

  const { close: closePopover } = useAddChannelPopoverContext();

  const { users, fetchStatus, fetchUsers } = useChatMessengerUsersContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useDebouncedSearchQuery(searchQuery, setSearchQuery);

  useEffect(() => {
    fetchUsers({
      searchQuery,
    });
  }, [searchQuery, fetchUsers]);

  const [selectedUsers, setSelectedUsers] = useState(
    {} as Record<
      string,
      {
        mmUserId: string;
        fullName: string;
      }
    >,
  );
  const groupedUsers = useUsersGroupedByFirstLetter(users);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedSearchQuery(event.target.value);
  };

  const handleToggleUser = (user: IApiChatAvailableUserItem) => {
    setSelectedUsers((prevSelected) => {
      const newSelected = { ...prevSelected };
      if (newSelected[user.mmUserId]) {
        delete newSelected[user.mmUserId];
      } else {
        newSelected[user.mmUserId] = {
          mmUserId: user.mmUserId,
          fullName: user.fullName || user.mmUserId,
        };
      }
      return newSelected;
    });
  };

  const addMembersToChannel = async () => {
    if (actionsDisabled) {
      return;
    }

    const { isSubmit } = await showConfirmModal({
      message: 'Are you sure you want to add these members to the channel?',
    });
    if (!isSubmit) {
      return;
    }

    setActionsDisabled(true);
    try {
      await mmApiClient?.makeRequest({
        url: `channels/${activeChannel?.id}/members`,
        method: 'post',
        data: {
          user_ids: [...new Set([...Object.keys(selectedUsers)])].filter(
            (id) => mmUserId !== id,
          ),
        },
      });
      toast.success('Members added to the channel successfully!');
      closePopover();
    } catch (error) {
      toast.error('Failed to add members to the channel. Please try again.');
      console.error('Error creating direct channel:', error);
    } finally {
      setActionsDisabled(false);
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
        >
          <Button
            variant='text'
            sx={{
              height: '36px',
              width: 'auto!important',
              minWidth: 'auto',
              px: '3px!important',
            }}
            disabled={actionsDisabled}
            onClick={closePopover}
          >
            Cancel
          </Button>
          <Button
            variant='text'
            sx={{
              height: '36px',
              width: 'auto!important',
              minWidth: 'auto',
              px: '3px!important',
            }}
            disabled={
              Object.keys(selectedUsers).length === 0 || actionsDisabled
            }
            loading={actionsDisabled}
            onClick={addMembersToChannel}
          >
            Add
          </Button>
          <Stack
            flexDirection='column'
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            alignItems='center'
            justifyContent='center'
          >
            <Typography
              fontSize='0.9rem!important'
              fontWeight='bold'
              color='#333'
            >
              Add Members
            </Typography>
            {Object.keys(selectedUsers).length > 0 && (
              <Typography fontSize='0.75rem!important' color='#777'>
                Selected: {Object.keys(selectedUsers).length}
              </Typography>
            )}
          </Stack>
        </Stack>
        <Stack
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            width: '100%',
            height: '80px',
            position: 'relative',
            boxShadow: '0px 1px 1.5px rgba(0, 0, 0, 0.1) inset',
            border: '1px solid #dedede',
          }}
        >
          {Object.keys(selectedUsers).length > 0 ? (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                py: 0.5,
                px: 1.5,
              }}
            >
              <Stack
                flexDirection='row'
                sx={{
                  width: '100%',
                  height: '100%',
                  overflowX: 'auto',
                }}
                justifyContent='flex-start'
                alignItems='center'
                columnGap={1}
              >
                {Object.values(selectedUsers).map((user) => (
                  <SelectedUserItem
                    key={user.mmUserId}
                    user={user}
                    isDisabled={actionsDisabled}
                    onRemove={() => {
                      handleToggleUser(user as IApiChatAvailableUserItem);
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ) : (
            <Box
              display='flex'
              alignItems='center'
              justifyContent='center'
              height='100%'
            >
              <Typography
                fontSize='0.875rem!important'
                color='#aaa'
                textAlign='center'
                sx={{
                  userSelect: 'none',
                }}
              >
                No users selected
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>

      <Stack px={2.25}>
        <div
          style={{
            borderBottom: '1px solid #ddd',
          }}
        ></div>
      </Stack>

      <Stack
        width='100%'
        flexDirection='column'
        alignItems='center'
        mt={2}
        pb={2}
        px={2}
        flexShrink={0}
      >
        <Box sx={{ width: '100%' }}>
          <CustomInput
            value={debouncedSearchQuery}
            placeholder='Search name'
            readOnly={actionsDisabled}
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
                      isSelected={
                        !!selectedUsers[user.mmUserId] ||
                        channelUserIdsSet.has(user.mmUserId)
                      }
                      isDisabled={
                        actionsDisabled || channelUserIdsSet.has(user.mmUserId)
                      }
                      onToggle={handleToggleUser}
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

export default ChatMessengerChannelAddMemberContent;
