import { Stack, Typography } from '@mui/material';
import ChatMessengerChannelItem from './ChatMessengerChannelItem';
import ChatMessengerChannelItemSkeleton from './ChatMessengerChannelItemSkeleton';
import type { ServerChannel } from '@mattermost/types/channels';

const ChatMessengerChannelListSuccessView = ({
  channels,
}: {
  channels: ServerChannel[];
}) => {
  return (
    <Stack
      flexDirection='column'
      flexGrow={1}
      sx={{
        position: 'relative',
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
      >
        {channels?.map((channel) => (
          <ChatMessengerChannelItem key={channel.id} channel={channel} />
        ))}
      </Stack>
    </Stack>
  );
};

const ChatMessengerChannelListLoadingView = () => {
  return (
    <Stack
      flexDirection='column'
      flexGrow={1}
      sx={{
        position: 'relative',
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
          pr: 1.5,
        }}
      >
        {
          // Render multiple skeleton items to simulate loading state
          Array.from({ length: 3 }).map((_, index) => (
            <ChatMessengerChannelItemSkeleton key={index} />
          ))
        }
      </Stack>
    </Stack>
  );
};

const ChatMessengerChannelListErrorView = ({ error }: { error?: Error }) => {
  return (
    <Stack
      flexDirection='column'
      flexGrow={1}
      alignItems='center'
      justifyContent='center'
      sx={{
        position: 'relative',
        minHeight: 200,
        px: 2,
        pb: 6,
      }}
      rowGap={2}
    >
      <Typography
        sx={{
          fontSize: '1.3rem',
          color: 'error.main',
          textAlign: 'center',
          fontWeight: 600,
        }}
      >
        Unable to load your chat channels.
      </Typography>
      <Typography
        sx={{
          fontSize: '1rem',
          color: 'text.secondary',
          textAlign: 'center',
          maxWidth: 350,
        }}
      >
        Please check your internet connection or try refreshing the page. If the
        problem persists, contact support.
      </Typography>
      {error && (
        <Typography
          sx={{
            fontSize: '0.95rem',
            color: 'error.dark',
            textAlign: 'center',
            wordBreak: 'break-word',
            background: '#fff6f6',
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            mt: 1,
          }}
        >
          <strong>Error details:</strong> {error.message}
        </Typography>
      )}
    </Stack>
  );
};

const ChatMessengerChannelListEmptyView = () => {
  return (
    <Stack
      flexDirection='column'
      flexGrow={1}
      alignItems='center'
      justifyContent='center'
      sx={{
        position: 'relative',
        minHeight: 200,
        px: 2,
        pb: 6,
      }}
      rowGap={2}
    >
      <Typography
        sx={{
          fontSize: '1.3rem',
          color: 'text.secondary',
          textAlign: 'center',
          fontWeight: 600,
        }}
      >
        No chat channels found.
      </Typography>
      <Typography
        sx={{
          fontSize: '1rem',
          color: 'text.secondary',
          textAlign: 'center',
          maxWidth: 350,
        }}
      >
        You have no conversations yet. Start a new chat to see it appear here.
      </Typography>
    </Stack>
  );
};

const ChatMessengerChannelList = ({
  loading,
  error,
  channels,
}: {
  loading: boolean;
  error: boolean;
  channels: ServerChannel[];
}) => {
  if (loading) {
    return <ChatMessengerChannelListLoadingView />;
  }

  if (error) {
    return <ChatMessengerChannelListErrorView />;
  }

  if (!channels || channels.length === 0) {
    return <ChatMessengerChannelListEmptyView />;
  }

  return <ChatMessengerChannelListSuccessView channels={channels} />;
};

export default ChatMessengerChannelList;
