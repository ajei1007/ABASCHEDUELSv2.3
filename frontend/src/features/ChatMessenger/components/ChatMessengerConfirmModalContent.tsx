import { Box, Stack, Button, Popover, Fade } from '@mui/material';

export interface IChatMessengerConfirmModalContentProps {
  isOpen: boolean;
  message: string;
  anchorEl?: HTMLButtonElement | null;
  handleClose: () => void;
  handleConfirm: (payload: any) => void;
}

export interface IChatMessengerConfirmModalContentPropsForRef
  extends Pick<IChatMessengerConfirmModalContentProps, 'message'> {}

const ChatMessengerConfirmModalContent = ({
  isOpen,
  anchorEl,
  message,
  handleClose,
  handleConfirm,
}: IChatMessengerConfirmModalContentProps) => {
  return (
    <Popover
      id='chat-messenger-confirm-modal'
      open={isOpen && Boolean(anchorEl)}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transitionDuration={0}
      slotProps={{
        paper: {
          sx: {
            maxHeight: 'min(850px, calc(100% - 32px))',
            height: '100%',
            minHeight: '300px',
            marginTop: '-0.5rem',
            display: 'flex',
            flexDirection: 'column',
            mt: '0.5rem',
            overflow: 'hidden',
            backgroundColor: 'transparent',
            borderRadius: '5px',
            zIndex: 1301,
          },
        },
        root: {
          sx: {
            position: 'static',
            zIndex: 1301,
          },
        },
      }}
      hideBackdrop
      elevation={0}
      onClose={() => {}}
    >
      <Fade in={true}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: 'transparent',
            width: '1000px',
            flexGrow: 1,
            borderRadius: '5px',
          }}
        >
          <Box
            display='flex'
            alignItems='center'
            justifyContent='center'
            sx={{
              position: 'absolute',
              left: '0',
              top: '0',
              width: '100%',
              height: '100%',
              backgroundColor: '#00000044',
              zIndex: 100,
              p: 2,
            }}
          >
            <Box
              display='flex'
              flexDirection='column'
              sx={{
                width: '25rem',
                backgroundColor: '#fff',
                boxShadow: '0px 0px 2px rgba(0,0,0,0.05)',
                borderRadius: '10px',
                border: '1px solid #dedede',
                overflow: 'hidden',
              }}
            >
              <Stack
                sx={{
                  padding: '1rem',
                  fontSize: '1rem!important',
                  fontWeight: '500',
                  color: '#333',
                  borderBottom: '1px solid #ddd',
                }}
              >
                {message}
              </Stack>

              <Stack
                flexDirection='row'
                justifyContent='flex-end'
                p={2}
                spacing={1}
                columnGap={2}
              >
                <Button
                  color='primary'
                  variant='contained'
                  onClick={handleConfirm}
                >
                  Confirm
                </Button>
                <Button
                  variant='outlined'
                  sx={{
                    marginTop: '0 !important',
                  }}
                  color='error'
                  onClick={handleClose}
                >
                  Close
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Popover>
  );
};

export default ChatMessengerConfirmModalContent;
