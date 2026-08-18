import { memo, lazy, Suspense } from 'react';
import { Stack, Fade } from '@mui/material';
import ComposeProviders from 'components/ComposeProviders';
import ChatMessengerActivator from './components/ChatMessengerActivator';
import ChatMessengerPopover from './components/ChatMessengerPopover';
import ChatMessengerBodyLoading from './components/ChatMessengerBodyLoading';
import { useChatMessengerPopover } from './hooks/useChatMessengerPopover';
import { ChatMessengerEventBusContextProvider } from './context/ChatMessengerEventBusContext';
import { ChatMessengerClientContextProvider } from './context/ChatMessengerClientContext';
import { ChatMessengerConfirmModalContextProvider } from './context/ChatMessengerConfirmModalContext';
import { ChatMessengerActiveChannelContextProvider } from './context/ChatMessengerActiveChannelContext';
import { ChatMessengerActiveChannelMembersContextProvider } from './context/ChatMessengerActiveChannelMembersContext';

const ChatMessengerBody = lazy(() => import('./components/ChatMessengerBody'));
const ChatMessengerConfirmModal = lazy(
  () => import('./components/ChatMessengerConfirmModal'),
);

const providers = [
  ChatMessengerEventBusContextProvider,
  ChatMessengerClientContextProvider,
  ChatMessengerActiveChannelContextProvider,
  ChatMessengerActiveChannelMembersContextProvider,
  ChatMessengerConfirmModalContextProvider,
];

const ChatMessenger = () => {
  const { anchorEl, handleClose, toggleOpen } = useChatMessengerPopover();
  const chatShown = Boolean(anchorEl);

  return (
    <>
      <Fade in={true}>
        <Stack
          alignItems='flex-end'
          sx={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            zIndex: '20',
          }}
        >
          <ComposeProviders providers={providers}>
            <ChatMessengerPopover anchorEl={anchorEl} handleClose={handleClose}>
              <Suspense fallback={<ChatMessengerBodyLoading />}>
                <ChatMessengerBody chatShown={chatShown} />
              </Suspense>
            </ChatMessengerPopover>
            <ChatMessengerActivator toggleOpen={toggleOpen} />
            {anchorEl && (
              <Suspense>
                <ChatMessengerConfirmModal anchorEl={anchorEl} />
              </Suspense>
            )}
          </ComposeProviders>
        </Stack>
      </Fade>
    </>
  );
};

export default memo(ChatMessenger);
