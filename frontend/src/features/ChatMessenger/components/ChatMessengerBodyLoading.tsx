import { Stack, CircularProgress, Typography } from '@mui/material';

const ChatMessengerBodyLoading = () => {
  return (
    <Stack
      alignItems='center'
      justifyContent='center'
      height='100%'
      spacing={3}
    >
      <CircularProgress size={50} />
      <Typography
        sx={{
          fontSize: '2rem',
          textAlign: 'center',
          color: '#666',
        }}
        fontWeight={600}
      >
        Loading chat...
      </Typography>
      <Stack direction='row' spacing={1}>
        <Typography
          variant='h4'
          component='span'
          role='img'
          aria-label='running man'
        >
          🏃‍♂️
        </Typography>
        <Typography variant='h4' component='span' role='img' aria-label='dash'>
          💨
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ChatMessengerBodyLoading;
