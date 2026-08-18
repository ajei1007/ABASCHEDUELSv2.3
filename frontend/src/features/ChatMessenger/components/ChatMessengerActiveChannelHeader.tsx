import { Box, Stack } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useChatMessengerActiveChannelContext } from '../context/ChatMessengerActiveChannelContext';
import { useChatMessengerChannelDetailModalContext } from '../context/ChatMessengerChannelDetailModalContext';
import { useActiveChannelDetails } from '../hooks/useActiveChannelDetails';
import ChatMessengerAvatarBox from './ChatMessengerAvatarBox';
import ChatMessengerChannelTitle from './ChatMessengerChannelTitle';

const ChatMessengerActiveChannelHeader = () => {
  const { resetActiveChannel } = useChatMessengerActiveChannelContext();
  const { showModal } = useChatMessengerChannelDetailModalContext();
  const { channelAvatar, channelTitle, channelSubtitle, channelColor } =
    useActiveChannelDetails();

  return (
    <Stack
      pr={2.5}
      py={1}
      flexDirection='row'
      alignItems='center'
      columnGap={1.5}
      flexShrink={0}
      height='75px'
      sx={{
        backgroundColor: '#f6f6f6',
        borderBottom: '1px solid #ddd',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
      }}
      onClick={() => {
        showModal();
      }}
    >
      <Box
        display='flex'
        alignItems='center'
        justifyContent='flex-end'
        bgcolor='#fff'
        component='button'
        width='1.75rem'
        height='100%'
        mr='-0.5rem'
        sx={{
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          outline: 'none',
          transition: 'background-color 0.2s ease',
          borderRadius: '0.25rem',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
          '&:active': {
            backgroundColor: '#e0e0e0',
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          resetActiveChannel();
        }}
      >
        <ArrowBackIosNewIcon
          sx={{
            color: '#000',
            fontSize: '0.75rem',
          }}
        />
      </Box>
      <ChatMessengerAvatarBox
        element={channelAvatar}
        backgroundColor={channelColor.background}
        foregroundColor={channelColor.foreground}
      />
      <ChatMessengerChannelTitle
        title={channelTitle}
        subtitle={channelSubtitle ?? undefined}
      />
    </Stack>
  );
};

export default ChatMessengerActiveChannelHeader;
