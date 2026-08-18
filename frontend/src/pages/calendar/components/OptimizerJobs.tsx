import { memo, useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import {
  Box,
  IconButton,
  Stack,
  Fade,
  Typography,
  Button,
  CircularProgress,
  Popover,
  Badge,
} from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { removeOptimizerJob } from 'store/actions/optimizerActions';
import { optimizerJobStatusColors } from '../constants/optimizer';
import { useOptimizerJobElapsedTime } from '../hooks/useOptimizerJobElapsedTime';
import type { IOptimizerJobItem } from 'types';

const OptimizerJobItem = ({
  job,
  closePopup,
}: {
  job: IOptimizerJobItem;
  closePopup: () => void;
}) => {
  const dispatch = useAppDispatch();
  const timezone = useAppSelector(
    (state) => state.settings.settingValues.timezone,
  );

  const { formattedTime } = useOptimizerJobElapsedTime(job);

  const dateDisplay = useMemo(() => {
    const startDate = moment(job.startDate).tz(timezone).startOf('day');
    const endDate = moment(job.endDate).tz(timezone).startOf('day');
    if (startDate.isSame(endDate)) {
      return startDate.format('ddd, MMM D, YYYY');
    }

    return `${startDate.format('ddd, MMM D')} - ${endDate.format('ddd, MMM D, YYYY')}`;
  }, [job, timezone]);

  const icon = (() => {
    switch (job.status) {
      case 'success':
        return (
          <CheckCircleOutlineIcon
            fontSize='small'
            color='success'
            sx={{ marginBottom: '2px' }}
          />
        );
      case 'failure':
        return (
          <ErrorOutlineIcon
            fontSize='small'
            color='error'
            sx={{ marginBottom: '2px' }}
          />
        );
      default:
        return (
          <CircularProgress
            size='14px'
            sx={{
              marginBottom: '0.15rem',
              marginRight: '0.25rem',
            }}
          />
        );
    }
  })();

  const statusColor = (() => {
    switch (job.status) {
      case 'success':
        return 'green';
      case 'failure':
        return 'error';
      default:
        return 'info';
    }
  })();

  const borderColor = (() => {
    switch (job.status) {
      case 'success':
        return 'green';
      case 'failure':
        return 'red';
      default:
        return 'rgb(195, 195, 195)';
    }
  })();

  const handleGoToDate = () => {
    closePopup();

    const event = new CustomEvent('optimizerJob:goToDate', {
      detail: {
        id: job.id,
        startDate: job.startDate,
        endDate: job.endDate,
        branch: job.branch,
        status: job.status,
        result: null,
      },
      bubbles: true,
      cancelable: true,
    });

    // Dispatch the event on the window
    window.dispatchEvent(event);
  };

  const handleDiscard = () => {
    const confirmed = window.confirm(
      `Are you sure you want to ${
        job.status === 'failure' ? 'clear' : 'discard'
      } this job result?`,
    );
    if (!confirmed) {
      return;
    }

    dispatch(removeOptimizerJob(job.id));
  };

  return (
    <Box
      sx={{
        backgroundColor: '#fefefe',
        padding: 1,
        paddingY: 1,
        paddingLeft: 1.5,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '5px',
        boxShadow: `0px 2px 1px -1px rgba(0, 0, 0, 0.1)`,
      }}
      borderColor={borderColor}
    >
      <Stack
        direction='row'
        columnGap={1.5}
        divider={<Box sx={{ width: '1px', backgroundColor: borderColor }} />}
      >
        <Stack direction='column' flexGrow='1' flexShrink={0} rowGap={0.5}>
          <Box sx={{ display: 'flex', columnGap: 1 }}>
            <Typography width='3.75rem' variant='body2' fontWeight='600'>
              Date:
            </Typography>
            <Typography variant='body2'>{dateDisplay}</Typography>
          </Box>
          <Box sx={{ display: 'flex', columnGap: 1 }}>
            <Typography width='3.75rem' variant='body2' fontWeight='600'>
              Branch:
            </Typography>
            <Typography variant='body2'>{job.branch.label}</Typography>
          </Box>
          <Box sx={{ display: 'flex', columnGap: 1 }}>
            <Typography width='3.75rem' variant='body2' fontWeight='600'>
              Status:
            </Typography>
            <Typography
              display='flex'
              gap={0.5}
              alignItems='center'
              variant='body2'
              color={statusColor}
              sx={{ textTransform: 'capitalize' }}
            >
              {icon}
              {job.status}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', columnGap: 1 }}>
            <Typography width='3.75rem' variant='body2' fontWeight='600'>
              Time:
            </Typography>
            <Typography
              display='flex'
              gap={0.5}
              alignItems='center'
              variant='body2'
              color='primary'
            >
              {formattedTime}
            </Typography>
          </Box>
        </Stack>
        <Stack
          direction='column'
          gap={0.75}
          flexShrink={0}
          justifyContent='center'
          alignItems='flex-end'
        >
          <Button
            color='primary'
            sx={{
              marginLeft: 'auto',
              height: '30px',
              paddingLeft: '10px!important',
              paddingRight: '10px!important',
              minWidth: 'auto!important',
              fontSize: '0.75rem!important',
              width: '100%',
            }}
            variant='contained'
            size='small'
            onClick={handleGoToDate}
          >
            Go to Date
          </Button>
          <Button
            color='error'
            sx={{
              marginLeft: 'auto',
              height: '30px',
              paddingLeft: '10px!important',
              paddingRight: '10px!important',
              minWidth: 'auto!important',
              fontSize: '0.75rem!important',
              width: '100%',
            }}
            disabled={job.status === 'loading'}
            variant={job.status === 'loading' ? 'text' : 'outlined'}
            size='small'
            onClick={handleDiscard}
          >
            {job.status === 'failure' ? 'Clear' : 'Discard'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

const OptimizerJobPopover = ({
  anchorEl,
  optimizerJobs,
  handleClose,
}: {
  anchorEl: HTMLButtonElement | null;
  optimizerJobs: IOptimizerJobItem[];
  handleClose: () => void;
}) => {
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            maxHeight: 'min(550px, calc(100% - 32px))',
            minHeight: '300px',
            boxShadow:
              '0px 3px 5px -1px rgba(32,32,32,0.2),0px 6px 10px 0px rgba(32,32,32,0.14),0px 1px 18px 0px rgba(32,32,32,0.12) !important',
            border: '1px solid rgb(190, 190, 190)',
            borderRadius: '5px',
            marginTop: '-0.5rem',
          },
        },
      }}
      elevation={0}
      onClose={handleClose}
    >
      <Box>
        <Box
          sx={{
            position: 'relative',
            backgroundColor: 'white',
            minWidth: '400px',
          }}
        >
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              paddingLeft: '16px',
              paddingRight: '10px',
              paddingY: '10px',
              backgroundColor: '#f7f8fb',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              borderBottom: '1px solid rgb(210, 210, 210)',
              position: 'sticky',
              zIndex: 3,
              top: 0,
            }}
          >
            <Typography>Optimizer running jobs</Typography>
            <IconButton
              size='small'
              sx={{ marginLeft: 'auto' }}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              padding: 2,
              rowGap: 1,
            }}
          >
            {optimizerJobs.map((job) => (
              <OptimizerJobItem
                key={job.id}
                job={job}
                closePopup={handleClose}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Popover>
  );
};

const OptimizerJobPopoverActivator = ({
  optimizerJobs,
  disabled,
  handleOpen,
}: {
  optimizerJobs: IOptimizerJobItem[];
  disabled: boolean;
  handleOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { successCount, failureCount } = optimizerJobs.reduce(
    (acc, job) => {
      if (job.status === 'success') {
        acc.successCount += 1;
      }
      if (job.status === 'failure') {
        acc.failureCount += 1;
      }
      return acc;
    },
    {
      successCount: 0,
      failureCount: 0,
    },
  );

  const badgeContent = (() => {
    if (successCount > 0 || failureCount > 0) {
      return `${successCount + failureCount}/${optimizerJobs.length}`;
    }
    return <CircularProgress sx={{ color: 'white!important' }} size='12px' />;
  })();

  const color = (() => {
    if (successCount > 0 || failureCount > 0) {
      return successCount >= failureCount ? 'success' : 'error';
    }
    return 'primary';
  })();

  const statusColor =
    optimizerJobStatusColors[
      successCount > 0 || failureCount > 0
        ? successCount >= failureCount
          ? 'success'
          : 'failure'
        : 'loading'
    ];

  return (
    <Badge badgeContent={badgeContent} overlap='circular' color={color}>
      <IconButton
        onClick={handleOpen}
        size='large'
        disabled={disabled}
        sx={{
          background: 'white',
          boxShadow:
            '0px 3px 5px -1px rgba(32,32,32,0.2),0px 6px 10px 0px rgba(32,32,32,0.14),0px 1px 18px 0px rgba(32,32,32,0.12)',
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: `rgba(${statusColor}, 0.7)`,
          color: `rgb(${statusColor})`,
          marginTop: '4px',
          ':hover': {
            opacity: 0.75,
            background: 'white',
            color: `rgb(${statusColor})`,
          },
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
      >
        <SmartToyOutlinedIcon fontSize='large' />
      </IconButton>
    </Badge>
  );
};

const OptimizerJobs = ({ disabled }: { disabled: boolean }) => {
  const optimizerJobs = useAppSelector(
    (state) => state.optimizer.optimizerJobs,
  );

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isOptimizerJobsEmpty = optimizerJobs.length === 0;

  useEffect(() => {
    if (isOptimizerJobsEmpty) {
      setAnchorEl(null);
    }
  }, [isOptimizerJobsEmpty]);

  return (
    <>
      <Fade in={!isOptimizerJobsEmpty}>
        <Stack
          alignItems='flex-end'
          sx={{
            position: 'absolute',
            right: '20px',
            bottom: '20px',
            zIndex: '10',
          }}
        >
          <OptimizerJobPopover
            anchorEl={anchorEl}
            optimizerJobs={optimizerJobs}
            handleClose={handleClose}
          />
          <OptimizerJobPopoverActivator
            optimizerJobs={optimizerJobs}
            disabled={disabled}
            handleOpen={handleOpen}
          />
        </Stack>
      </Fade>
    </>
  );
};

export default memo(OptimizerJobs);
