import { type FC } from 'react';
import { Stack, Typography, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomButton from 'components/Button';

interface IChecklistBodyErrorProps {
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Error state component for the onboarding checklist.
 * Displays error message and retry functionality.
 */
const ChecklistBodyError: FC<IChecklistBodyErrorProps> = ({
  error,
  onRetry,
}) => {
  const errorMessage =
    error || 'Failed to load onboarding checklist. Please try again.';

  return (
    <Paper
      elevation={1}
      sx={{
        padding: 4,
        borderRadius: 2,
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0',
      }}
      role='alert'
      aria-live='polite'
    >
      <Stack
        spacing={3}
        alignItems='center'
        justifyContent='center'
        textAlign='center'
        py={4}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 60,
            color: '#f44336',
            opacity: 0.8,
          }}
          aria-hidden='true'
        />

        <Stack spacing={1}>
          <Typography
            variant='h6'
            fontWeight={600}
            color='text.primary'
            component='h2'
          >
            Oops! Something went wrong
          </Typography>

          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ maxWidth: 400 }}
          >
            {errorMessage}
          </Typography>
        </Stack>

        {onRetry && (
          <CustomButton
            onClick={onRetry}
            startIcon={<RefreshIcon />}
            variant='outlined'
            size='medium'
            sx={{
              mt: 2,
              px: 3,
              py: 1,
            }}
            aria-label='Retry loading checklist'
          >
            Try Again
          </CustomButton>
        )}
      </Stack>
    </Paper>
  );
};

ChecklistBodyError.displayName = 'ChecklistBodyError';

export default ChecklistBodyError;
