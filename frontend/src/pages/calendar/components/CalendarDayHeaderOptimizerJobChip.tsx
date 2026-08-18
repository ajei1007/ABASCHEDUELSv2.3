import { memo, useMemo } from 'react';
import { Stack, Chip, Tooltip, CircularProgress } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { optimizerJobStatusColors } from '../constants/optimizer';
import { useCalendarOptimizerJobUtilsContext } from '../context/CalendarOptimizerJobUtilsContext';

const CalendarDayHeaderOptimizerJobChip = ({
  timestamp,
}: {
  timestamp: number;
}) => {
  const { findOptimizerJobByGivenDate } = useCalendarOptimizerJobUtilsContext();

  const currentDaysOptimizerJob = useMemo(
    () =>
      findOptimizerJobByGivenDate({
        startDate: new Date(timestamp),
        endDate: new Date(timestamp),
        endDateInclusive: true,
      }),
    [timestamp, findOptimizerJobByGivenDate],
  );

  if (!currentDaysOptimizerJob) {
    return null;
  }

  const statusIcon = (() => {
    switch (currentDaysOptimizerJob.status) {
      case 'success':
        return (
          <CheckCircleOutlineIcon sx={{ fontSize: '1rem' }} color='success' />
        );
      case 'failure':
        return <ErrorOutlineIcon sx={{ fontSize: '1rem' }} color='error' />;
      default:
        return <CircularProgress size='13px' />;
    }
  })();

  const borderColor = (() => {
    switch (currentDaysOptimizerJob.status) {
      case 'success':
        return 'green';
      case 'failure':
        return 'red';
      default:
        return '#6b859e';
    }
  })();

  const tooltipTitle = (() => {
    switch (currentDaysOptimizerJob.status) {
      case 'success':
        return 'Optimizer job is completed for this date';
      case 'failure':
        return 'Optimizer job is failed for this date';
      default:
        return 'Optimizer job is running for this date';
    }
  })();

  const statusColor = optimizerJobStatusColors[currentDaysOptimizerJob.status];

  const handleClick = () => {
    const event = new CustomEvent('optimizerJob:goToDate', {
      detail: {
        id: currentDaysOptimizerJob.id,
        startDate: currentDaysOptimizerJob.startDate,
        endDate: currentDaysOptimizerJob.endDate,
        branch: currentDaysOptimizerJob.branch,
        status: currentDaysOptimizerJob.status,
        result: null,
      },
      bubbles: true,
      cancelable: true,
    });
    // Dispatch the event on the window
    window.dispatchEvent(event);
  };

  return (
    <div
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClick();
      }}
    >
      <Tooltip arrow title={tooltipTitle} placement='bottom'>
        <Chip
          size='small'
          variant='outlined'
          sx={{
            height: '25px',
            paddingLeft: 0.4,
            paddingRight: 0.25,
            borderColor,
            position: 'relative',
            '&::after': {
              '--custom-pulse-color': statusColor,
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'inherit',
              animation: `custom-pulse 1.5s infinite`,
              zIndex: -1,
            },
          }}
          icon={
            <SmartToyOutlinedIcon
              sx={{
                color: `${borderColor} !important`,
              }}
            />
          }
          label={
            <Stack
              direction='column'
              alignItems='center'
              justifyItems='center'
              sx={{
                paddingLeft: 0.5,
              }}
            >
              {statusIcon}
            </Stack>
          }
          onClick={() => {}}
        />
      </Tooltip>
    </div>
  );
};

export default memo(CalendarDayHeaderOptimizerJobChip);
