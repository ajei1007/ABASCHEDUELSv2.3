import { useState } from 'react';
import ChatMessengerAddChannelDirect from './ChatMessengerAddChannelDirect';
import ChatMessengerAddChannelGroup from './ChatMessengerAddChannelGroup';

const ChatMessengerAddChannelContent = () => {
  const [mode, setMode] = useState<'direct' | 'group'>('direct');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'direct' ? 'group' : 'direct'));
  };

  return mode === 'direct' ? (
    <ChatMessengerAddChannelDirect key='direct' toggleMode={toggleMode} />
  ) : (
    <ChatMessengerAddChannelGroup key='group' toggleMode={toggleMode} />
  );
};

export default ChatMessengerAddChannelContent;
