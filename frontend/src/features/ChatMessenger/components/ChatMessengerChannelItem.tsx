import { Stack, Typography } from '@mui/material';
import { useChannelListItemDetails } from '../hooks/useChannelListItemDetails';
import { useChatMessengerActiveChannelContext } from '../context/ChatMessengerActiveChannelContext';
import ChatMessengerAvatarBox from './ChatMessengerAvatarBox';
import ChatMessengerChannelTitle from './ChatMessengerChannelTitle';
import { formatSmartDate } from '../utils';
import type { ServerChannel } from '@mattermost/types/channels';

const ChatMessengerChannelItem = ({ channel }: { channel: ServerChannel }) => {
  const { activeChannel, setActiveChannel } =
    useChatMessengerActiveChannelContext();

  const { channelAvatar, channelTitle, channelColor } =
    useChannelListItemDetails({
      channel,
    });

  const lastPostAt = channel.last_post_at
    ? formatSmartDate(channel.last_post_at)
    : '';

  const isActive = activeChannel?.id === channel.id;
  const unreadCount = 0;
  const hasUnread = false;

  return (
    <Stack
      px={1}
      py={1.5}
      flexDirection='row'
      alignItems='center'
      columnGap={1.5}
      borderRadius={'2px'}
      sx={{
        '&:hover': {
          backgroundColor: isActive ? '#e0f7fa' : '#f5f5f5',
          cursor: 'pointer',
        },
        pr: 3,
        pl: 2.5,
        backgroundColor: isActive ? '#e0f7fa' : '#fff',
      }}
      onClick={() => {
        setActiveChannel(channel);
      }}
    >
      <ChatMessengerAvatarBox
        element={channelAvatar}
        backgroundColor={channelColor.background}
        foregroundColor={channelColor.foreground}
      />
      <ChatMessengerChannelTitle
        title={channelTitle}
        // subtitle={lastMessageText}
      />
      <Stack
        flexDirection='column'
        rowGap={0.25}
        overflow='hidden'
        flexShrink={0}
        textAlign='right'
        alignSelf='stretch'
        justifyContent='space-between'
      >
        <Typography
          fontSize='0.875rem!important'
          color={hasUnread ? '#1976d2' : '#666'}
          fontWeight='500'
          overflow='hidden'
          whiteSpace='nowrap'
          textOverflow='ellipsis'
        >
          {lastPostAt}
        </Typography>
        <Typography
          fontSize='0.875rem!important'
          lineHeight='1.25'
          color='#fff'
          overflow='hidden'
          whiteSpace='nowrap'
          textOverflow='ellipsis'
          height='1.4rem'
          minWidth='1.4rem'
          ml='auto'
          flexShrink={0}
          sx={{
            backgroundColor: '#1976d2',
            borderRadius: '1000px',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            visibility: hasUnread ? 'visible' : 'hidden',
            pt: '1px',
            px: '0.5rem',
          }}
        >
          {unreadCount}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ChatMessengerChannelItem;
