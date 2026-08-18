import { useState, useCallback } from 'react';
import type { ServerChannel } from '@mattermost/types/channels';

export const useActiveChannelState = () => {
  const [activeChannel, setActiveChannel] = useState<ServerChannel | null>(
    null,
  );

  const setActiveChannelCallback = useCallback(
    (channel: ServerChannel | null) => {
      setActiveChannel(channel);
    },
    [],
  );

  const resetActiveChannel = useCallback(() => {
    setActiveChannel(null);
  }, []);

  return {
    activeChannel,
    setActiveChannel: setActiveChannelCallback,
    setActiveChannelState: setActiveChannel, // Raw setState for event handlers
    resetActiveChannel,
  };
};
