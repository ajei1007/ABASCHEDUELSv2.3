import { Stack, Skeleton } from '@mui/material';

const ChatMessengerUserGroupSkeleton = () => {
  return (
    <Stack px={2} flexDirection='column'>
      <Skeleton
        variant='text'
        width='20px'
        sx={{
          fontSize: '1rem!important',
          fontWeight: 'bold',
          mb: 0.5,
          px: 1,
        }}
      />
      <Stack
        flexDirection='column'
        sx={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          p: 0.5,
        }}
      >
        {Array.from({ length: 2 }).map((_, index) => (
          <Stack
            key={index}
            height='40px'
            px={0.75}
            flexDirection='row'
            alignItems='center'
            columnGap={1.5}
            borderRadius='8px'
            sx={{
              backgroundColor: '#fff',
              transition: 'background-color 0.2s ease',
              border: 'none',
              textAlign: 'left',
              color: '#333',
            }}
          >
            <Skeleton variant='circular' width='30px' height='30px' />
            <Stack flexGrow={1} pt='1px' flexDirection='column'>
              <Skeleton
                variant='text'
                width='120px'
                sx={{
                  fontSize: '0.875rem!important',
                  color: '#333',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.3,
                }}
              />
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default ChatMessengerUserGroupSkeleton;
