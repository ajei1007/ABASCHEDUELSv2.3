import { memo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import {
  Alert,
  CircularProgress,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useOptimizerJobElapsedTime } from '../hooks/useOptimizerJobElapsedTime';
import {
  removeOptimizerJob,
  setOptimizerResults,
  toggleOptimizerResultsEmptyModal,
} from 'store/actions/optimizerActions';
import { setDateComponents } from '../utils/setDateComponents';
import type { IOptimizerJobItem } from 'types';

const OptimizerJobActions = ({
  optimizerJob,
}: {
  optimizerJob: IOptimizerJobItem;
}) => {
  const dispatch = useAppDispatch();
  const timezone = useAppSelector(
    (state) => state.settings.settingValues.timezone,
  );

  const isEventStartEndTimeValid = (event: any) => {
    const startRecurMoment = event.startRecur
      ? moment.parseZone(event.startRecur)
      : moment(event.start).tz(timezone);
    const dateComponents = {
      year: startRecurMoment.year(),
      month: startRecurMoment.month(),
      day: startRecurMoment.date(),
    };
    const start = setDateComponents(
      moment(event.start).tz(timezone),
      dateComponents,
    );
    const end = setDateComponents(
      moment(event.end).tz(timezone),
      dateComponents,
    );
    return end.isAfter(start);
  };

  const handleReview = () => {
    const data = (optimizerJob?.result || []).map((item) => ({
      ...item,
      creatingEvents: (item?.creatingEvents || []).reduce(
        (acc: any[], event: any) => {
          if (isEventStartEndTimeValid(event)) {
            acc.push({
              ...event,
              id: uuidv4(),
            });
          }
          return acc;
        },
        [] as any[],
      ) as any[],
      deletingEvents: (item?.deletingEvents || []).filter((event: any) =>
        isEventStartEndTimeValid(event),
      ) as any[],
      updatingEvents: (item?.updatingEvents || []).filter((event: any) =>
        isEventStartEndTimeValid(event),
      ) as any[],
    }));

    if (
      data.some(
        (item: any) =>
          item.creatingEvents.length > 0 ||
          item.deletingEvents.length > 0 ||
          item.updatingEvents.length > 0,
      )
    ) {
      dispatch(setOptimizerResults(data));
    } else {
      dispatch(toggleOptimizerResultsEmptyModal());
    }
    dispatch(removeOptimizerJob(optimizerJob.id));
  };

  const handleDiscard = () => {
    const confirmed = window.confirm(
      `Are you sure you want to ${
        optimizerJob.status === 'failure' ? 'clear' : 'discard'
      } this job result?`,
    );
    if (!confirmed) {
      return;
    }

    dispatch(removeOptimizerJob(optimizerJob.id));
  };

  return (
    <Stack
      direction='row'
      spacing={1}
      sx={{
        position: 'absolute',
        top: '1/2',
        right: '0.5rem',
        paddingBottom: '0.2rem',
        transform: 'translateY(-50%)',
      }}
    >
      {optimizerJob.status === 'success' && (
        <Button
          variant='contained'
          color='primary'
          size='small'
          onClick={handleReview}
        >
          Review
        </Button>
      )}
      <Button
        variant='outlined'
        color='error'
        size='small'
        onClick={handleDiscard}
      >
        {optimizerJob.status === 'failure' ? 'Clear' : 'Discard'}
      </Button>
    </Stack>
  );
};

const OptimizerJobAlert = ({
  optimizerJob,
}: {
  optimizerJob: IOptimizerJobItem;
}) => {
  const { formattedTime } = useOptimizerJobElapsedTime(optimizerJob);

  const severity = (() => {
    switch (optimizerJob.status) {
      case 'success':
        return 'success';
      case 'failure':
        return 'error';
      default:
        return 'info';
    }
  })();

  const text = (() => {
    switch (optimizerJob.status) {
      case 'success':
        return 'Optimizer job completed successfully';
      case 'failure':
        return 'Optimizer job failed';
      default:
        return 'Optimizer is running for this day';
    }
  })();

  const icon = (() => {
    switch (optimizerJob.status) {
      case 'success':
        return (
          <CheckCircleOutlineIcon
            fontSize='medium'
            color='success'
            sx={{ marginBottom: '2.5px' }}
          />
        );
      case 'failure':
        return (
          <ErrorOutlineIcon
            fontSize='medium'
            color='error'
            sx={{ marginBottom: '2.5px' }}
          />
        );
      default:
        return (
          <CircularProgress size='20px' sx={{ marginBottom: '0.25rem' }} />
        );
    }
  })();

  const color = (() => {
    switch (optimizerJob.status) {
      case 'success':
        return '#2e7d32';
      case 'failure':
        return '#d32f2f';
      default:
        return '#4d53e0';
    }
  })();

  return (
    <Alert
      sx={{
        position: 'relative',
        '&': {
          paddingTop: '0.3rem',
          paddingBottom: '0.2rem',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '0.5rem',
          '.MuiAlert-message': {
            flexGrow: '1',
            paddingY: '0.2rem',
          },
        },
      }}
      severity={severity}
      icon={<span></span>}
      action={
        optimizerJob.status !== 'loading' ? (
          <OptimizerJobActions optimizerJob={optimizerJob} />
        ) : undefined
      }
    >
      <Stack direction='column' alignItems='center'>
        <Stack
          direction='row'
          gap={1}
          width='100%'
          alignItems='center'
          justifyContent='center'
          color={color}
        >
          {icon}
          {text} (time: {formattedTime})
        </Stack>
        <Typography
          textAlign='center'
          fontSize='0.78rem'
          sx={{
            color: '#757575',
          }}
        >
          For consistency, some calendar actions are disabled for this date
          while the optimizer is running.
        </Typography>
      </Stack>
    </Alert>
  );
};

export default memo(OptimizerJobAlert);
