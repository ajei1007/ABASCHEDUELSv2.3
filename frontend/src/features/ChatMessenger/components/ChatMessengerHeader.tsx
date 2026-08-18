import { Stack, Typography } from '@mui/material';
import ChatMessengerAddChannel from './ChatMessengerAddChannel';

const ChatMessengerHeader = () => {
  return (
    <Stack
      flexShrink={0}
      flexDirection='row'
      pl={3}
      pr={2.5}
      alignItems='center'
      justifyContent='space-between'
    >
      <Typography
        fontWeight='bold'
        fontSize='1.5rem!important'
        lineHeight={1.2}
        color='#333'
      >
        Chats
      </Typography>
      <ChatMessengerAddChannel />
    </Stack>
  );
};

export default ChatMessengerHeader;
