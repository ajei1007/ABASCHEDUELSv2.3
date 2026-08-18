import { IconButton, Badge } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useChatMessengerUnreadCount } from '../hooks/useChatMessengerUnreadCount';
import { useChatMessengerConfirmModalContext } from '../context/ChatMessengerConfirmModalContext';

export interface IChatMessengerActivatorProps {
  toggleOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ChatMessengerActivator = ({
  toggleOpen,
}: IChatMessengerActivatorProps) => {
  const { modalShown } = useChatMessengerConfirmModalContext();
  const { unreadCount } = useChatMessengerUnreadCount();

  return (
    <Badge
      invisible={unreadCount <= 0}
      color='error'
      overlap='circular'
      badgeContent={unreadCount}
    >
      <IconButton
        size='large'
        sx={{
          position: 'relative',
          height: '70px',
          width: '70px',
          marginTop: '4px',
          backgroundColor: '#005fff',
          color: 'white',
          boxShadow:
            '0px 3px 5px -1px rgba(32,32,32,0.2),0px 6px 10px 0px rgba(32,32,32,0.14),0px 1px 18px 0px rgba(32,32,32,0.12)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          transition: `background-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease`,
          ':hover': {
            backgroundColor: '#0047e6',
            boxShadow:
              '0px 3px 5px -1px rgba(32,32,32,0.2),0px 6px 10px 0px rgba(32,32,32,0.14),0px 1px 18px 0px rgba(32,32,32,0.12)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          ':active': {
            backgroundColor: '#0038b3',
            boxShadow:
              '0px 3px 5px -1px rgba(32,32,32,0.2),0px 6px 10px 0px rgba(32,32,32,0.14),0px 1px 18px 0px rgba(32,32,32,0.12)',
            opacity: 0.9,
          },
        }}
        onClick={!modalShown ? toggleOpen : undefined}
      >
        <ChatIcon
          sx={{
            fontSize: '2.5rem!important',
          }}
        />
      </IconButton>
    </Badge>
  );
};

export default ChatMessengerActivator;
