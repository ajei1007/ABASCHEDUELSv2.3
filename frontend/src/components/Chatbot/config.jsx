import { createChatBotMessage } from 'react-chatbot-kit';
import ABALogo from 'assets/companies/logos/ABASchedules.svg';
import { Avatar, Stack, Typography } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ReactMarkdown from 'react-markdown';

const CustomMessage = (props) => {
  const message = props?.message ?? ''
  const cleanMessage = message.replace(/【\d+:\d+†source】/g, '');
  return (
    <div className='react-chatbot-kit-chat-bot-message' style={{ background: '#dee2e6', color: '#212529' }}>
      <Stack spacing={2}>
        <ReactMarkdown>{cleanMessage}</ReactMarkdown>
      </Stack>
      <div class="react-chatbot-kit-chat-bot-message-arrow" style={{ borderRightColor: '#dee2e6' }}></div>
    </div>
  )
}

const botName = "ABASchedules Bot";

const config = {
  botName: botName,
  initialMessages: [createChatBotMessage(`Hello! I'm ${botName}.How can I assist you today?`)],
  customStyles: {
    botMessageBox: {
      backgroundColor: '#4d53e0',
    },
    chatButton: {
      backgroundColor: '#4d53e0',
    },
  },
  customComponents: {
    // Replaces the default header
    header: () => <Typography padding={2} bgcolor='#f7f8fb' sx={{ borderRadius: '8px 8px 0 0' }}>ABA Schedules Bot</Typography>,
    // Replaces the default bot avatar
    botAvatar: (props) => <Avatar alt="Remy Sharp" src={ABALogo} />,
    userAvatar: (props) => <Avatar src={<AccountCircleOutlinedIcon />} sx={{ backgroundColor: 'rgb(77, 83, 224)', marginLeft: '4px' }} />,
    botChatMessage: (props) => <CustomMessage {...props} />
  },
  // widgets: [
  //   {
  //     widgetName: "markdownWidget",
  //     widgetFunc: (props) => <MarkdownWidget {...props} />,
  //   },
  // ],
};

export default config;