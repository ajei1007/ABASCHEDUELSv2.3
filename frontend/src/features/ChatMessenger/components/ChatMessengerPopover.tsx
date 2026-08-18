import { useState, useEffect } from 'react';
import { Box, Popover } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useChatMessengerConfirmModalContext } from '../context/ChatMessengerConfirmModalContext';

const ChatMessengerPopover = ({
  children,
  anchorEl,
  keepAliveTimout = 60000,
  handleClose,
}: {
  children?: React.ReactNode;
  anchorEl: HTMLButtonElement | null;
  keepAliveTimout?: number;
  handleClose: () => void;
}) => {
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const { modalShown } = useChatMessengerConfirmModalContext();

  const [keepMounted, setKeepMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setKeepMounted(true);
    } else {
      const timer = window.setTimeout(() => {
        setKeepMounted(false);
      }, keepAliveTimout);

      return () => window.clearTimeout(timer);
    }
  }, [open, keepAliveTimout]);

  return (
    <Popover
      id={id}
      open={open}
      keepMounted={keepMounted}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            maxHeight: 'min(850px, calc(100% - 32px))',
            height: '100%',
            minHeight: '300px',
            marginTop: '-0.5rem',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            mt: '0.5rem',
            overflow: 'unset',
            backgroundColor: 'transparent',
          },
        },
        root: {
          sx: {
            position: 'static',
          },
        },
      }}
      hideBackdrop
      elevation={0}
      onClose={!modalShown ? handleClose : undefined}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: 'white',
          width: '1000px',
          flexGrow: 1,
          boxShadow:
            '0px 3px 5px -1px rgba(32,32,32,0.2),0px 6px 10px 0px rgba(32,32,32,0.14),0px 1px 18px 0px rgba(32,32,32,0.12) !important',
          border: '1px solid rgb(190, 190, 190)',
          borderRadius: '5px',
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
      {!modalShown && (
        <Box
          component='button'
          sx={{
            position: 'absolute',
            top: '-1rem',
            right: '0.5rem',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '2rem',
            height: '2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            boxSizing: 'border-box',
            bgcolor: 'white',
            backgroundColor: 'white',
            border: '1px solid rgb(190, 190, 190)',
            boxShadow:
              '0px 3px 5px -1px rgba(32,32,32,0.2),0px 6px 10px 0px rgba(32,32,32,0.14),0px 1px 18px 0px rgba(32,32,32,0.12) !important',
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
            '&:active': {
              backgroundColor: '#e0e0e0',
            },
            '&:focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(66, 165, 245, 0.5)',
            },
          }}
          onClick={handleClose}
        >
          <CloseIcon
            sx={{
              fontSize: '1.5rem',
              lineHeight: '1',
            }}
          />
        </Box>
      )}
    </Popover>
  );
};

export default ChatMessengerPopover;
