import { useState, createElement, type FunctionComponent } from 'react';
import {
  Box,
  Grid2 as Grid,
  Stack,
  Button,
  Typography,
  Fade,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import { useChatMessengerActiveChannelContext } from '../context/ChatMessengerActiveChannelContext';
import { useChatMessengerChannelDetailModalContext } from '../context/ChatMessengerChannelDetailModalContext';
import ChatMessengerChannelDetailTabContentInfo from './ChatMessengerChannelDetailTabContentInfo/ChatMessengerChannelDetailTabContentInfo';
import ChatMessengerChannelDetailTabContentMembers from './ChatMessengerChannelDetailTabContentMembers/ChatMessengerChannelDetailTabContentMembers';

export interface IChatMessengerChannelDetailModalContentProps {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

export interface IChatMessengerChannelDetailModalContentPropsForRef {}

const TabItem = ({
  label,
  icon,
  onClick = () => {},
  isActive = false,
  isDisabled = false,
}: {
  label: string;
  icon?: FunctionComponent<any>;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}) => {
  return (
    <Box
      component='button'
      sx={{
        width: '100%',
        border: 'none',
        px: 1.5,
        py: 0.5,
        height: '45px',
        display: 'flex',
        alignItems: 'center',
        columnGap: 1.25,
        m: 0,
        backgroundColor: isActive ? '#e0e0e0' : 'transparent',
        textAlign: 'left',
        fontSize: '1rem',
        borderRadius: '6px',
        lineHeight: '1.5rem',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: isActive ? '#d0d0d0' : '#e0e0e0',
          cursor: 'pointer',
        },
        '&:active': {
          backgroundColor: '#d0d0d0',
        },
        '&:disabled': {
          backgroundColor: '#f0f0f0',
          color: '#aaa',
          cursor: 'not-allowed',
        },
      }}
      disabled={isDisabled}
      onClick={onClick}
    >
      {icon &&
        createElement(icon, {
          sx: {
            fontSize: '1.55rem',
            color: '#888',
          },
        })}
      {label}
    </Box>
  );
};

const ChatMessengerChannelDetailModalContent = ({
  isOpen,
  handleClose: _,
  handleConfirm,
}: IChatMessengerChannelDetailModalContentProps) => {
  const [activeTab, setActiveTab] = useState('info');
  const { actionsDisabled } = useChatMessengerChannelDetailModalContext();

  const { activeChannel } = useChatMessengerActiveChannelContext();

  const _channelType = activeChannel?.type!;

  const channelType = ['D', 'P'].includes(_channelType ?? '')
    ? _channelType!
    : 'other';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <ChatMessengerChannelDetailTabContentInfo
            onChannelClosed={() => handleConfirm()}
          />
        );
      case 'members':
        return <ChatMessengerChannelDetailTabContentMembers />;
      default:
        return <></>;
    }
  };

  return (
    <Fade in={isOpen} unmountOnExit timeout={200}>
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
          zIndex: 10,
          p: 2,
        }}
      >
        <Box
          display='flex'
          flexDirection='column'
          sx={{
            width: '100%',
            maxWidth: '80%',
            height: '100%',
            maxHeight: '75%',
            backgroundColor: '#fff',
            boxShadow: '0px 0px 2px rgba(0,0,0,0.05)',
            borderRadius: '16px',
            border: '1px solid #dedede',
            overflow: 'hidden',
          }}
        >
          <Grid
            container
            sx={{
              flexGrow: 1,
              minHeight: '0',
            }}
          >
            <Grid
              size={4}
              p={2}
              sx={{
                position: 'relative',
                zIndex: 2,
                borderRight: '1px solid #dedede',
                boxShadow: '1px 0px 2px rgba(0,0,0,0.05)',
                backgroundColor: '#f4f4f4',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.45rem!important',
                  fontWeight: 'bold',
                  color: '#333',
                }}
                px={1}
                mb={2}
                textTransform='capitalize'
              >
                {channelType === 'P'
                  ? 'Group Chat'
                  : channelType === 'D'
                    ? 'Direct'
                    : 'Other'}
              </Typography>

              <Stack width='100%' rowGap={0.5} flexDirection='column'>
                <TabItem
                  label='Info'
                  icon={InfoIcon}
                  isActive={activeTab === 'info'}
                  isDisabled={actionsDisabled}
                  onClick={() => setActiveTab('info')}
                />
                {channelType === 'P' && (
                  <TabItem
                    label='Members'
                    icon={GroupIcon}
                    isActive={activeTab === 'members'}
                    isDisabled={actionsDisabled}
                    onClick={() => setActiveTab('members')}
                  />
                )}
              </Stack>
            </Grid>
            <Grid
              sx={{
                position: 'relative',
                zIndex: 1,
              }}
              display='flex'
              flexDirection='column'
              minHeight={0}
              maxHeight={'100%'}
              size={8}
            >
              <Stack
                flexDirection='column'
                height='calc(100% - 60px)'
                flexGrow={1}
                flexShrink={0}
                sx={{
                  position: 'relative',
                  overflowY: 'auto',
                  backgroundColor: '#f4f4f4',
                  zIndex: 1,
                }}
              >
                {renderTabContent()}
              </Stack>
              <Stack
                height='60px'
                px={2}
                py={1.5}
                flexDirection='row'
                flexShrink={0}
                sx={{
                  borderTop: '1px solid #dedede',
                  backgroundColor: '#f4f4f4',
                  boxShadow: '0px -1px 2px rgba(0,0,0,0.05)',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <Button
                  sx={{ ml: 'auto' }}
                  variant='outlined'
                  color='primary'
                  size='small'
                  disabled={actionsDisabled}
                  onClick={handleConfirm}
                >
                  Close
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Fade>
  );
};

export default ChatMessengerChannelDetailModalContent;
