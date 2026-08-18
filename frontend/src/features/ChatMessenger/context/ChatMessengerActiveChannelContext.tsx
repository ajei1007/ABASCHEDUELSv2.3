import { useMemo, useContext, createContext } from 'react';
import { useActiveChannelState } from '../hooks/useActiveChannelState';
import { useActiveChannelEventHandlers } from '../hooks/useActiveChannelEventHandlers';
import { useActiveChannelSubscription } from '../hooks/useActiveChannelSubscription';
import { useChatMessengerEventBusContext } from '../context/ChatMessengerEventBusContext';
import type { ServerChannel } from '@mattermost/types/channels';

export const ChatMessengerActiveChannelContext = createContext<{
  activeChannel: ServerChannel | null;
  setActiveChannel: (channel: ServerChannel | null) => void;
  resetActiveChannel: () => void;
}>({
  activeChannel: null,
  setActiveChannel: () => {},
  resetActiveChannel: () => {},
});

export const useChatMessengerActiveChannelContext = () => {
  return useContext(ChatMessengerActiveChannelContext);
};

export const ChatMessengerActiveChannelContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { eventBus } = useChatMessengerEventBusContext();

  // Core state management
  const {
    activeChannel,
    setActiveChannel,
    setActiveChannelState,
    resetActiveChannel,
  } = useActiveChannelState();

  // Event handlers
  const { handleKickedFromGroupChannel, handleGroupChannelUpdated } =
    useActiveChannelEventHandlers({
      activeChannel,
      setActiveChannelState,
    });

  // Event subscription
  useActiveChannelSubscription({
    eventBus,
    handleKickedFromGroupChannel,
    handleGroupChannelUpdated,
  });

  // Context value optimization
  const contextValue = useMemo(
    () => ({
      activeChannel,
      setActiveChannel,
      resetActiveChannel,
    }),
    [activeChannel, setActiveChannel, resetActiveChannel],
  );

  return (
    <ChatMessengerActiveChannelContext.Provider value={contextValue}>
      {children}
    </ChatMessengerActiveChannelContext.Provider>
  );
};
