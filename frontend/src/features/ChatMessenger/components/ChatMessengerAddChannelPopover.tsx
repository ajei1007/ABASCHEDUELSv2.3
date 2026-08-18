import { Box, Popover } from '@mui/material';
import { useChatMessengerConfirmModalContext } from '../context/ChatMessengerConfirmModalContext';

const ChatMessengerAddChannelPopover = ({
  children,
  anchorEl,
  handleClose,
}: {
  children?: React.ReactNode;
  anchorEl: HTMLButtonElement | null;
  handleClose: () => void;
}) => {
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const { modalShown } = useChatMessengerConfirmModalContext();

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            maxHeight: 'min(650px, calc(100% - 32px))',
            height: '100%',
            minHeight: '100px',
            maxWidth: '400px',
            width: '100%',
            boxShadow:
              '0px 3px 5px -1px rgba(32,32,32,0.2),0px 6px 10px 0px rgba(32,32,32,0.14),0px 1px 18px 0px rgba(32,32,32,0.12) !important',
            border: '1px solid rgb(175, 175, 175)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
      hideBackdrop={modalShown}
      elevation={0}
      onClose={handleClose}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: 'white',
          width: '100%',
          flexGrow: 1,
        }}
      >
        {children}
      </Box>
    </Popover>
  );
};

export default ChatMessengerAddChannelPopover;
