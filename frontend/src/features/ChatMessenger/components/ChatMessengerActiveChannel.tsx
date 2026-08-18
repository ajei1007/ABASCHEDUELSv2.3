import { Stack } from '@mui/material';
import ChatMessengerActiveChannelHeader from './ChatMessengerActiveChannelHeader';
import chatBgPattern from '@/assets/chat/bg-pattern.png';

const ChatChannelCurrentlyActive = () => {
  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        width: '100%',
        backgroundColor: '#fff',
      }}
    >
      <ChatMessengerActiveChannelHeader />
      <Stack
        flexGrow={1}
        sx={{
          position: 'relative',
          backgroundImage: `url(${chatBgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'white',
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
        ></Stack>
      </Stack>
    </Stack>
  );
};

export default ChatChannelCurrentlyActive;
