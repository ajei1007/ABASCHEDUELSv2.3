import { useMemo, useContext, createContext } from 'react';
import { EventEmitter } from 'utils/eventEmitter';
import type { ServerChannel } from '@mattermost/types/channels';

export interface IChatMessengerEventBusMap {
  groupChannelCreated: {
    channelId: string;
    teamId: string;
  };
  groupChannelUpdated: {
    channelId: string;
    channelData?: ServerChannel | null;
  };
  groupChannelDeleted: {
    channelId: string;
    deletedAt: number;
  };
  groupChannelUndeleted: {
    channelId: string;
  };
  directChannelCreated: {
    channelId?: string;
    creatorId: string;
    teammateId: string;
  };
  directChannelClosed: {
    channelId?: string;
    creatorId: string;
    teammateId: string;
  };
  kickedFromGroupChannel: {
    channelId: string;
    removerId: string;
  };
  leftGroupChannel: {
    channelId: string;
  };
  memberLeftGroupChannel: {
    channelId: string;
    removerId: string;
    userId: string;
  };
  memberJoinedGroupChannel: {
    channelId: string;
    userId: string;
  };
  memberChannelRoleChanged: {
    channelId: string;
    userId: string;
    roles: string;
  };
  messageAdded: {
    channelId: string;
    channelName?: string;
    channelType?: 'D' | 'P';
    channelDisplayName?: string;
    post: Record<string, any>;
    senderName?: string;
  };
  messageUpdated: {
    channelId: string;
  };
  messageDeleted: {
    channelId: string;
  };
  messageUnread: {
    channelId: string;
  };
}

export type TChatMessengerEventBus = EventEmitter<IChatMessengerEventBusMap>;

function createEventBus() {
  return new EventEmitter<IChatMessengerEventBusMap>();
}

export const ChatMessengerEventBusContext = createContext<{
  eventBus: TChatMessengerEventBus;
}>({
  eventBus: createEventBus(),
});

export const useChatMessengerEventBusContext = () => {
  return useContext(ChatMessengerEventBusContext);
};

export const ChatMessengerEventBusContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const contextValue = useMemo(
    () => ({
      eventBus: createEventBus(),
    }),
    [],
  );

  return (
    <ChatMessengerEventBusContext.Provider value={contextValue}>
      {children}
    </ChatMessengerEventBusContext.Provider>
  );
};
