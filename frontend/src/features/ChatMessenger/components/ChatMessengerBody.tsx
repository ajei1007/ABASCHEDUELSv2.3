import ChatMessengerBodyInner from './ChatMessengerBodyInner';
import ChatMessengerBodyLoading from './ChatMessengerBodyLoading';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';

export interface IChatMessengerBodyProps {
  chatShown: boolean;
}

const ChatMessengerBody = ({ chatShown }: IChatMessengerBodyProps) => {
  const { mmApiClient } = useChatMessengerClientContext();

  if (!mmApiClient) {
    return <ChatMessengerBodyLoading />;
  }

  return <ChatMessengerBodyInner chatShown={chatShown} />;
};

export default ChatMessengerBody;
