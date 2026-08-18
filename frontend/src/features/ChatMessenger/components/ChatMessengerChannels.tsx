import { useState, useMemo } from 'react';
import { Box, Stack, Divider } from '@mui/material';
import ChatMessengerChannelList from './ChatMessengerChannelList';
import CustomInput from 'components/CustomInputModal/CustomInput';
import { useDebouncedSearchQuery } from '../hooks/useDebouncedSearchQuery';
import { useChatMessengerChannels } from '../hooks/useChatMessengerChannels';

const ChatMessengerChannels = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useDebouncedSearchQuery(searchQuery, setSearchQuery);

  const { channels, channelsLoading, channelsHasError } =
    useChatMessengerChannels();

  const filteredChannels = useMemo(
    () =>
      channels.filter((channel) => {
        const channelName = channel?.display_name || '';
        return channelName.toLowerCase().includes(searchQuery.toLowerCase());
      }),
    [searchQuery, channels],
  );

  return (
    <Stack flexGrow={1} flexDirection='column'>
      <Box px={2.5} flexShrink={0}>
        <CustomInput
          value={debouncedSearchQuery}
          placeholder='Search'
          onInput={(event) =>
            setDebouncedSearchQuery((event.target as any).value)
          }
        />
      </Box>
      <Box px={2.5} mt={2} mb={0.25} flexShrink={0}>
        <Divider />
      </Box>
      <ChatMessengerChannelList
        channels={filteredChannels}
        loading={channelsLoading}
        error={channelsHasError}
      />
    </Stack>
  );
};

export default ChatMessengerChannels;
