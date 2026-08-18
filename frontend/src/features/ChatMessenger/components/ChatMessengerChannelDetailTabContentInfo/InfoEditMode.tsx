import { useState } from 'react';
import { Box, Stack, Button, Typography } from '@mui/material';
import { useChatMessengerClientContext } from '../../context/ChatMessengerClientContext';
import { useChatMessengerActiveChannelContext } from '../../context/ChatMessengerActiveChannelContext';
import { useChatMessengerChannelDetailModalContext } from '../../context/ChatMessengerChannelDetailModalContext';
import CustomInput from 'components/CustomInputModal/CustomInput';
import { toast } from 'react-toastify';

const InfoEditMode = ({ toggleMode }: { toggleMode: () => void }) => {
  const { actionsDisabled, setActionsDisabled } =
    useChatMessengerChannelDetailModalContext();
  const { activeChannel } = useChatMessengerActiveChannelContext();
  const { mmApiClient } = useChatMessengerClientContext();

  const [groupName, setGroupName] = useState(activeChannel?.display_name || '');

  const handleSave = async () => {
    if (actionsDisabled) {
      return;
    }

    if (groupName.trim() === '') {
      toast.error('Group name cannot be empty');
      return;
    }

    setActionsDisabled(true);
    try {
      await mmApiClient!.makeRequest({
        url: `channels/${activeChannel?.id}/patch`,
        method: 'put',
        data: {
          display_name: groupName.trim(),
        },
      });
      toast.success('Group name updated successfully!');
      toggleMode();
    } catch (error) {
      console.error('Error updating group name:', error);
      toast.error('Failed to update group name. Please try again later.');
    } finally {
      setActionsDisabled(false);
    }
  };

  return (
    <div>
      <Stack
        height='70px'
        px={2}
        py={1.5}
        flexDirection='row'
        alignItems='center'
        flexShrink={0}
        sx={{
          backgroundColor: '#f4f4f4',
          boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.15rem!important',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          Info
        </Typography>
        <Stack ml='auto' flexShrink={0} flexDirection='row' columnGap={2}>
          <Button
            sx={{
              color: actionsDisabled ? undefined : '#444!important',
              minWidth: 'auto!important',
              width: 'auto!important',
              px: '3px!important',
              flexShrink: 0,
              '&:disabled': {
                color: '#ccc!important',
              },
            }}
            variant='text'
            color='inherit'
            size='small'
            disabled={actionsDisabled}
            onClick={toggleMode}
          >
            Cancel
          </Button>
          <Button
            sx={{
              color:
                groupName.trim() === '' || actionsDisabled
                  ? undefined
                  : '#444!important',
              minWidth: 'auto!important',
              width: 'auto!important',
              px: '3px!important',
              flexShrink: 0,
              '&:disabled': {
                color: '#ccc!important',
              },
            }}
            variant='text'
            color='inherit'
            size='small'
            disabled={groupName.trim() === '' || actionsDisabled}
            loading={actionsDisabled}
            onClick={handleSave}
          >
            Save
          </Button>
        </Stack>
      </Stack>
      <Stack
        flexGrow={1}
        flexDirection='column'
        sx={{
          overflowY: 'auto',
        }}
      >
        <Stack
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
          width='100%'
          pt={3}
          px={2}
          pb={2}
          rowGap={3}
        >
          <Box width='100%'>
            <CustomInput
              value={groupName}
              placeholder='Enter group name'
              readOnly={actionsDisabled}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </Box>
        </Stack>
      </Stack>
    </div>
  );
};

export default InfoEditMode;
