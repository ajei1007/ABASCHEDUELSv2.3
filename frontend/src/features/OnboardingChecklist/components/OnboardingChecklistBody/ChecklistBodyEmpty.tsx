import { type FC } from 'react';
import { Stack, Typography, Paper } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * Empty state component for the onboarding checklist.
 * Displays when no checklist items are available.
 */
const ChecklistBodyEmpty: FC = () => {
  return (
    <Paper
      elevation={1}
      sx={{
        padding: 4,
        borderRadius: 2,
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0',
      }}
    >
      <Stack
        spacing={2}
        alignItems='center'
        justifyContent='center'
        textAlign='center'
        py={4}
        role='status'
        aria-label='No checklist items available'
      >
        <InfoOutlinedIcon
          sx={{
            fontSize: 48,
            color: 'text.secondary',
            opacity: 0.6,
          }}
        />
        <Typography variant='h6' color='text.primary' fontWeight={500}>
          No Checklist Items
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ maxWidth: 300 }}
        >
          Your onboarding checklist is empty. New items will appear here when
          they become available.
        </Typography>
      </Stack>
    </Paper>
  );
};

ChecklistBodyEmpty.displayName = 'ChecklistBodyEmpty';

export default ChecklistBodyEmpty;
