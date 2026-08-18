import { useEffect } from 'react';
import { Grid2 as Grid, Stack } from '@mui/material';
import { ChatMessengerChannelDetailModalContextProvider } from '../context/ChatMessengerChannelDetailModalContext';
import { ChatMessengerUsersContextProvider } from '../context/ChatMessengerUsersContext';
import { useChatMessengerActiveChannelContext } from '../context/ChatMessengerActiveChannelContext';
import ChatMessengerHeader from './ChatMessengerHeader';
import ChatMessengerChannels from './ChatMessengerChannels';
import ChatMessengerChannelView from './ChatMessengerChannelView';
import ChatMessengerChannelDetailModal from './ChatMessengerChannelDetailModal';

const ChatMessengerBodyInner = ({ chatShown }: { chatShown: boolean }) => {
  const { resetActiveChannel } = useChatMessengerActiveChannelContext();

  // Reset active channel when chat is closed
  // This ensures that when the chat is reopened, it starts with no active channel
  // and the user can select a channel again
  useEffect(() => {
    if (chatShown) {
      return;
    }
    const timer = window.setTimeout(() => {
      resetActiveChannel();
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [chatShown, resetActiveChannel]);

  return (
    <ChatMessengerChannelDetailModalContextProvider>
      <ChatMessengerUsersContextProvider chatShown={chatShown}>
        <Stack
          sx={{ position: 'relative' }}
          flexGrow={1}
          flexDirection='column'
        >
          <Grid
            container
            sx={{
              flexGrow: 1,
              minHeight: '0',
              outline: '1px solid #000',
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 2,
                py: 2.5,
                rowGap: 2,
                borderRight: '1px solid #ddd',
                boxShadow: '1px 0px 4px 0px rgba(0,0,0,0.08)',
              }}
            >
              <ChatMessengerHeader />
              <ChatMessengerChannels />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ChatMessengerChannelView />
            </Grid>
          </Grid>

          <ChatMessengerChannelDetailModal />
        </Stack>
      </ChatMessengerUsersContextProvider>
    </ChatMessengerChannelDetailModalContextProvider>
  );
};

export default ChatMessengerBodyInner;
