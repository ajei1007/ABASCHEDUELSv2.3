import { Fragment } from 'react';
import { Stack, Divider } from '@mui/material';
import type { InfoViewActionItemProps } from './InfoViewActionItem';

const InfoViewActionsContainer = ({
  items,
  renderItem,
}: {
  items: InfoViewActionItemProps[];
  renderItem: (item: InfoViewActionItemProps) => React.ReactNode;
}) => {
  return (
    <Stack
      mt={3}
      px={0.5}
      py={0.75}
      width='100%'
      flexDirection='column'
      sx={{
        backgroundColor: '#fff',
        boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
        borderRadius: '10px',
      }}
    >
      {items.map((item, index) => (
        <Fragment key={index}>
          {renderItem(item)}
          {index < items.length - 1 && <Divider sx={{ my: 0.75, mx: 0.5 }} />}
        </Fragment>
      ))}
    </Stack>
  );
};

export default InfoViewActionsContainer;
