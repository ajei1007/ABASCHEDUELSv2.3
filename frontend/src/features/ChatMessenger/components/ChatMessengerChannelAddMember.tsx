import { useState, useCallback, type MouseEvent } from 'react';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatMessengerAddChannelPopover from './ChatMessengerAddChannelPopover';
import { AddChannelPopoverContextProvider } from '../context/AddChannelPopoverContext';
import ChatMessengerChannelAddMemberContent from './ChatMessengerChannelAddMemberContent';
import { useChatMessengerChannelDetailModalContext } from '../context/ChatMessengerChannelDetailModalContext';

const ChatMessengerChannelAddMember = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { actionsDisabled } = useChatMessengerChannelDetailModalContext();

  const toggleOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl((anchorEl) => (anchorEl ? null : event.currentTarget));
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <>
      <ChatMessengerAddChannelPopover
        anchorEl={anchorEl}
        handleClose={handleClose}
      >
        <AddChannelPopoverContextProvider close={handleClose}>
          <ChatMessengerChannelAddMemberContent />
        </AddChannelPopoverContextProvider>
      </ChatMessengerAddChannelPopover>
      <IconButton
        sx={{
          ml: 'auto',
          color: !!anchorEl ? '#1976d2' : '#666',
          '&:disabled': {
            color: '#ccc',
            cursor: 'not-allowed',
          },
          backgroundColor: !!anchorEl
            ? 'rgba(25, 118, 210, 0.08)'
            : 'transparent',
          '&:hover': {
            backgroundColor: !!anchorEl
              ? 'rgba(25, 118, 210, 0.15)'
              : 'rgba(0,0,0,0.04)',
          },
        }}
        disabled={actionsDisabled}
        onClick={toggleOpen}
      >
        <AddIcon
          sx={{
            fontSize: '1.5rem',
          }}
        />
      </IconButton>
    </>
  );
};

export default ChatMessengerChannelAddMember;
