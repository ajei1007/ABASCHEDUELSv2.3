import { useState, useCallback } from 'react';
import { IconButton } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { AddChannelPopoverContextProvider } from '../context/AddChannelPopoverContext';
import ChatMessengerAddChannelContent from './ChatMessengerAddChannelContent';
import ChatMessengerAddChannelPopover from './ChatMessengerAddChannelPopover';

const ChatMessengerAddChannel = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const toggleOpen = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl((anchorEl) => (anchorEl ? null : event.currentTarget));
    },
    [],
  );

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
          <ChatMessengerAddChannelContent />
        </AddChannelPopoverContextProvider>
      </ChatMessengerAddChannelPopover>
      <IconButton
        onClick={toggleOpen}
        color={!!anchorEl ? 'primary' : 'default'}
        sx={{
          backgroundColor: !!anchorEl
            ? 'rgba(25, 118, 210, 0.08)'
            : 'transparent',
          '&:hover': {
            backgroundColor: !!anchorEl
              ? 'rgba(25, 118, 210, 0.15)'
              : 'rgba(0,0,0,0.04)',
          },
        }}
      >
        <PersonAddAltIcon
          sx={{
            color: !!anchorEl ? '#1976d2' : '#666',
            fontSize: '1.5rem',
          }}
        />
      </IconButton>
    </>
  );
};

export default ChatMessengerAddChannel;
