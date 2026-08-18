import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from 'components/Chatbot/config';
import MessageParser from 'components/Chatbot/MessageParser';
import ActionProvider from 'components/Chatbot/ActionProvider';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { Fade, IconButton, Stack, Zoom } from '@mui/material';
import ABALogo from 'assets/companies/logos/ABASchedules.svg';

const ChatbotLLM = () => {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen((prev) => !prev);

  return (
    <>
      <Stack
        alignItems='flex-end'
        sx={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          zIndex: '9999',
        }}
      >
        <Fade in={open} unmountOnExit timeout={{ enter: 500, exit: 80 }}>
          <Box sx={{ pointerEvents: open ? 'auto' : 'none' }}>
            <Chatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </Box>
        </Fade>
        <Zoom in={true} timeout={500}>
          <IconButton
            aria-describedby='chatbot'
            variant=''
            onClick={handleClick}
            size='large'
            sx={{
              background: 'white',
              boxShadow: '0px 0px 10px 5px #dad8d8bd',
              color: 'white',
              marginTop: '4px',
              ':hover': { opacity: 0.75, background: 'white', color: 'white' },
            }}
          >
            <img src={ABALogo}
              style={{ width: 40, height: 40 }}
              alt="ABA Schedules"
            />
          </IconButton>
        </Zoom>
      </Stack>
    </>
  );
};

export default ChatbotLLM;
