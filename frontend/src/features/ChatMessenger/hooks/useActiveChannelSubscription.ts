import { useEffect } from 'react';
import type { IChatMessengerEventBusMap } from '../context/ChatMessengerEventBusContext';
import type { TChatMessengerEventBus } from '../context/ChatMessengerEventBusContext';

interface UseActiveChannelSubscriptionProps {
  eventBus: TChatMessengerEventBus;
  handleKickedFromGroupChannel: (
    data: IChatMessengerEventBusMap['kickedFromGroupChannel'],
  ) => Promise<void>;
  handleGroupChannelUpdated: (
    data: IChatMessengerEventBusMap['groupChannelUpdated'],
  ) => Promise<void>;
}

export const useActiveChannelSubscription = ({
  eventBus,
  handleKickedFromGroupChannel,
  handleGroupChannelUpdated,
}: UseActiveChannelSubscriptionProps) => {
  useEffect(() => {
    eventBus.on('kickedFromGroupChannel', handleKickedFromGroupChannel);
    eventBus.on('groupChannelUpdated', handleGroupChannelUpdated);
    return () => {
      eventBus.off('kickedFromGroupChannel', handleKickedFromGroupChannel);
      eventBus.off('groupChannelUpdated', handleGroupChannelUpdated);
    };
  }, [eventBus, handleKickedFromGroupChannel, handleGroupChannelUpdated]);
};
