import { Stack, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const ChatMessengerChannelViewEmpty = () => {
  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        width: '100%',
        backgroundColor: '#efefef',
      }}
    >
      <ChatIcon
        sx={{
          color: '#999',
          fontSize: '5rem',
          mb: 2,
        }}
      />
      <Typography textAlign='center' color='#999' fontSize='1.25rem'>
        This is the chat area. <br></br> Select a channel to start chatting.
      </Typography>
    </Stack>
  );
};

export default ChatMessengerChannelViewEmpty;
