import { Stack, Skeleton } from '@mui/material';

const ChatMessengerChannelItemSkeleton = () => {
  return (
    <Stack
      px={2.5}
      py={1.5}
      flexDirection='row'
      alignItems='center'
      columnGap={1.5}
      borderRadius={'8px'}
    >
      <Skeleton
        width='50px'
        height='50px'
        animation='wave'
        variant='circular'
      />
      <Stack
        flexGrow={1}
        flexDirection='column'
        rowGap={0.25}
        overflow='hidden'
      >
        <Skeleton
          width='120px'
          variant='text'
          animation='wave'
          sx={{
            fontSize: '1.2rem!important',
            fontWeight: 'bold',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        />
        <Skeleton
          width='150px'
          variant='text'
          animation='wave'
          sx={{
            fontSize: '0.9rem!important',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        />
      </Stack>
      <Stack mb='auto' mt={1} flexShrink={0} textAlign='right'>
        <Skeleton
          width='60px'
          variant='text'
          animation='wave'
          sx={{
            fontSize: '0.9rem!important',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        />
      </Stack>
    </Stack>
  );
};

export default ChatMessengerChannelItemSkeleton;
