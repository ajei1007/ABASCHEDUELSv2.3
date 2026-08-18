import type { FC } from 'react';
import { Box, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface IOptimizerActionLogsErrorMessageProps {
  errorMessage: string | null;
  onRetry?: () => void;
}

const OptimizerActionLogsErrorMessage: FC<
  IOptimizerActionLogsErrorMessageProps
> = ({ errorMessage, onRetry }) => {
  return (
    <Box mb={1}>
      <Alert
        severity='error'
        sx={{
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
        }}
        action={
          onRetry && (
            <Button
              color='primary'
              variant='contained'
              size='small'
              onClick={onRetry}
              sx={{
                textTransform: 'none',
                height: '2rem',
                py: 0,
                fontWeight: 500,
              }}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          )
        }
      >
        {errorMessage || 'Something went wrong while loading NPS statistics'}.
        Please try again.
      </Alert>
    </Box>
  );
};

export default OptimizerActionLogsErrorMessage;
