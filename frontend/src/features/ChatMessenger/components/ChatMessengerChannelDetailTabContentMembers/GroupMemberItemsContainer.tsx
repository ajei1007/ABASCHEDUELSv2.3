import { Fragment } from 'react';
import { Stack, Divider } from '@mui/material';
import type { TChannelMember } from './GroupMemberItem';

const GroupMemberItemsContainer = ({
  items,
  renderItem,
}: {
  items: TChannelMember[];
  renderItem: (item: TChannelMember) => React.ReactNode;
}) => {
  return (
    <Stack
      px={0.5}
      py={0.75}
      width='100%'
      flexDirection='column'
      sx={{
        backgroundColor: '#fff',
        boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
        borderRadius: '10px',
        border: '1px solid #e4e4e4',
      }}
    >
      {items.map((member, index) => (
        <Fragment key={`${member.user?.id}`}>
          {renderItem(member)}
          {index < items.length - 1 && (
            <Divider
              key={`${member.user?.id}-divider`}
              sx={{ my: 0.75, mx: 0.5 }}
            />
          )}
        </Fragment>
      ))}
    </Stack>
  );
};

export default GroupMemberItemsContainer;
