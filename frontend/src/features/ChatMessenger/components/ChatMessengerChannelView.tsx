import { useMemo, useEffect, useRef } from 'react';
// import { SearchIndex as EmojiMartSearchIndex } from 'emoji-mart';
import { Typography, Box } from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ChatMessengerChannelViewEmpty from './ChatMessengerChannelViewEmpty';

// import ChatMessengerChannelViewSkeleton from './ChatMessengerChannelViewSkeleton';
import ChatMessengerActiveChannel from './ChatMessengerActiveChannel';
import ChatMessengerAvatarBox from './ChatMessengerAvatarBox';
import { useChatMessengerActiveChannelContext } from '../context/ChatMessengerActiveChannelContext';
// import ChatMessengerActiveChannelMessageInput from './ChatMessengerActiveChannelMessageInput';
import { formatNameInitial } from '../utils';
import { generateColorsForName } from '../utils/colors';

// const EmojiPickerWithTheme = () => {
//   return <StreamChatReactEmojiPicker pickerProps={{ theme: 'light' }} />;
// };

const Avatar = ({ className, name, user }: any) => {
  // const { client } = useChatContext();
  // if (client.user?.id === user?.id) {
  //   return null; // Hide the avatar for the current user
  // }

  const colors = useMemo(
    () => generateColorsForName(name || user?.id || ''),
    [name, user],
  );

  const extraSmall = className?.includes('str-chat__avatar--message-status');
  const element = name ? (
    <Typography
      fontSize={extraSmall ? '0.65rem!important' : '0.875rem!important'}
      letterSpacing='1px'
    >
      {formatNameInitial(name)}
    </Typography>
  ) : (
    <QuestionMarkIcon
      sx={{
        fontSize: extraSmall ? '0.75rem' : '1rem',
      }}
    />
  );

  return (
    <Box className='str-chat__message-sender-avatar'>
      <ChatMessengerAvatarBox
        size={extraSmall ? 'xs' : 'sm'}
        element={element}
        backgroundColor={colors.background}
        foregroundColor={colors.foreground}
      />
    </Box>
  );
};

const EmptyStateIndicator = () => {
  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      height='100%'
      width='100%'
      textAlign='center'
      p={4}
      borderRadius={2}
      sx={{
        userSelect: 'none',
      }}
    >
      <QuestionMarkIcon sx={{ fontSize: '3rem', color: '#999', mb: 2 }} />
      <Typography variant='h6' color='#777' mb={1}>
        Start the conversation!
      </Typography>
      <Typography variant='body2' color='#777'>
        Send a message to begin chatting in this channel.
      </Typography>
    </Box>
  );
};

const ChatMessengerChannelView = () => {
  const { activeChannel } = useChatMessengerActiveChannelContext();

  return !activeChannel ? (
    <ChatMessengerChannelViewEmpty />
  ) : (
    <ChatMessengerActiveChannel />
  );
};

export default ChatMessengerChannelView;
