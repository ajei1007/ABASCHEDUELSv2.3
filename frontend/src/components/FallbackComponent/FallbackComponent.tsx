import type { FC } from 'react';
import { toast } from 'react-toastify';
import { Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import * as Sentry from '@sentry/react';
import CustomButton from 'components/Button';
import { useAppSelector } from 'store/hooks';

type Props = {
  error?: unknown;
  onRetry?: () => void;
};

const FallbackComponent: FC<Props> = ({ error, onRetry }) => {
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  const handleClickReportCrash = () => {
    try {
      Sentry.showReportDialog({
        title: 'Report a problem',
        subtitle: 'Please describe what happened just before the crash.',
        eventId:
          Sentry.lastEventId() ||
          Sentry.captureException(error || new Error('Unknown error')),
        user: currentUser
          ? {
              email: currentUser?.email || undefined,
              name:
                [currentUser?.firstName, currentUser?.lastName]
                  .filter(Boolean)
                  .join(' ') || undefined,
            }
          : undefined,
      });
    } catch (err) {
      console.error('Failed to show Sentry report dialog:', err);
      toast.error('Failed to open crash report dialog. Please try again.');
    }
  };
  return (
    <Stack
      width='100%'
      alignItems='center'
      justifyContent='center'
      spacing={2}
      paddingTop='2rem'
    >
      <ErrorOutlineIcon fontSize='large' style={{ color: '#ff4b23' }} />
      <Typography variant='h6'>Something went wrong!</Typography>

      {import.meta.env.REACT_APP_ENV && error && (
        <Typography variant='body2' sx={{ opacity: 0.7 }}>
          {(error as Error)?.message}
        </Typography>
      )}

      <Stack direction='row' spacing={1}>
        {onRetry && (
          <CustomButton onClick={onRetry} variant='contained' color='primary'>
            Try Again
          </CustomButton>
        )}

        <CustomButton
          onClick={handleClickReportCrash}
          variant='outlined'
          color='secondary'
        >
          Report Crash
        </CustomButton>
      </Stack>
    </Stack>
  );
};

export default FallbackComponent;
