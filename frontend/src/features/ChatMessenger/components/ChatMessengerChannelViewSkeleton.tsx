import { Box, Stack, Skeleton } from '@mui/material';
import chatBgPattern from '@/assets/chat/bg-pattern.png';

const HeaderSkeleton = () => {
  return (
    <Stack
      px={2.5}
      py={1.5}
      flexDirection='row'
      alignItems='center'
      columnGap={1.5}
      flexShrink={0}
      height='75px'
      sx={{
        backgroundColor: '#f6f6f6',
        borderBottom: '1px solid #ddd',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Skeleton
        width='50px'
        height='50px'
        variant='circular'
        animation='wave'
      />
      <Stack
        flexGrow={1}
        flexDirection='column'
        rowGap={0.25}
        overflow='hidden'
      >
        <Skeleton
          variant='text'
          animation='wave'
          width='10rem'
          height='1.5rem'
          sx={{
            fontSize: '1rem!important',
            fontWeight: 'bold',
            color: '#333',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        />
        <Skeleton
          variant='text'
          animation='wave'
          width='10rem'
          height='1rem'
          sx={{
            fontSize: '0.875rem!important',
            color: '#666',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        />
      </Stack>
    </Stack>
  );
};

const MessageInputSkeleton = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8f8f8!important',
        borderTop: '1px solid #ddd!important',
        boxShadow: '0px -1px 2px rgba(0, 0, 0, 0.05)!important',
        py: '0.5rem!important',
        px: '1.5rem!important',
      }}
      height='62px'
    >
      <Skeleton
        variant='rounded'
        animation='wave'
        sx={{
          width: '100%',
          height: '35px',
          borderRadius: '18px',
        }}
      ></Skeleton>
    </Box>
  );
};

const ChatMessengerChannelViewSkeleton = () => {
  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        width: '100%',
        backgroundColor: '#fff',
      }}
    >
      <HeaderSkeleton />
      <Stack
        flexGrow={1}
        sx={{
          position: 'relative',
          backgroundImage: `url(${chatBgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'white',
        }}
      ></Stack>
      <MessageInputSkeleton />
    </Stack>
  );
};

export default ChatMessengerChannelViewSkeleton;
