import CustomButton from 'components/Button';
import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  Box,
  Grid2 as Grid,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { useOptimizerAcceptResults } from '../../hooks/useOptimizerAcceptResults';
import {
  optimizerResultsSelector,
  optimizerDisabledConstraintsSelector,
  optimizerCreatingEventsNumberSelector,
  optimizerUpdatingEventsNumberSelector,
  optimizerDeletingEventsNumberSelector,
} from 'store/selectors/optimizerSelectors';
import {
  resetOptimizerResults,
  toggleOptimizerResultsModal,
} from 'store/actions/optimizerActions';
import { visalizeOptimizerResultStatisticsKeys } from '../../constants/optimizer';
import OptimizerResultsAnalyzerPassedBadge from './../OptimizerResultsAnalyzerPassedBadge';
import OptimizerResultsAnalyzerNotPassedBadge from './../OptimizerResultsAnalyzerNotPassedBadge';

const OptimizerResultsRightSideBar = () => {
  const dispatch = useAppDispatch();
  const optimizerResults = useAppSelector(optimizerResultsSelector);
  const optimizerDisabledConstraints = useAppSelector(
    optimizerDisabledConstraintsSelector,
  );

  const creatingEventsNumber = useAppSelector(
    optimizerCreatingEventsNumberSelector,
  );

  const updatingEventsNumber = useAppSelector(
    optimizerUpdatingEventsNumberSelector,
  );

  const deletingEventsNumber = useAppSelector(
    optimizerDeletingEventsNumberSelector,
  );

  const { loading, handleAcceptResults } = useOptimizerAcceptResults();

  const handleToggleOptimizerResultsModal = useCallback(() => {
    dispatch(toggleOptimizerResultsModal());
  }, [dispatch]);

  const handleDecline = useCallback(() => {
    dispatch(resetOptimizerResults());
  }, [dispatch]);

  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        paddingTop: '1rem',
        height: '100%',
      }}
    >
      <Box
        mb={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          columnGap: 1,
          paddingX: '0.75rem',
        }}
      >
        <Typography
          variant='body1'
          sx={{
            textAlign: 'center',
            fontWeight: '600',
            lineHeight: '1.5',
          }}
        >
          Optimizer Results
        </Typography>
        <IconButton
          size='small'
          color='primary'
          onClick={handleToggleOptimizerResultsModal}
        >
          <ChecklistIcon />
        </IconButton>
      </Box>
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          alignItems: 'center',
          overflowY: 'auto',
          flexGrow: '1',
          minHeight: 0,
          paddingX: '0.6rem',
          paddingTop: '0.5rem',
          paddingBottom: '1rem',
        }}
      >
        <Stack>
          <Grid container spacing='0.4rem' columns={{ sm: 12, md: 12 }}>
            {visalizeOptimizerResultStatisticsKeys.map((statisticsObj) => {
              const statisticsValue =
                optimizerResults[0]?.statistics?.[statisticsObj.key];
              if (statisticsValue !== undefined && statisticsValue !== null) {
                return (
                  <Grid
                    key={statisticsObj.key}
                    size={{
                      sm: 12,
                      md: 12,
                      lg: 12,
                    }}
                  >
                    <Stack
                      sx={{
                        paddingX: '0.5rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.25rem',
                        backgroundColor: '#f7f8fb',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography fontSize='0.75rem !important' color='#6b859e'>
                        {statisticsObj.title}
                      </Typography>
                      <Typography fontSize='1rem !important' fontWeight='600'>
                        {statisticsValue}
                      </Typography>
                    </Stack>
                  </Grid>
                );
              }
              return null;
            })}
            <Grid
              size={{
                sm: 4,
                md: 4,
                lg: 4,
              }}
            >
              <Stack
                sx={{
                  paddingX: '0.5rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.25rem',
                  backgroundColor: '#f7f8fb',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography fontSize='0.75rem !important' color='#6b859e'>
                  Add
                </Typography>
                <Typography fontSize='1rem !important' fontWeight='600'>
                  {creatingEventsNumber}
                </Typography>
              </Stack>
            </Grid>
            <Grid
              size={{
                sm: 4,
                md: 4,
                lg: 4,
              }}
            >
              <Stack
                sx={{
                  paddingX: '0.5rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.25rem',
                  backgroundColor: '#f7f8fb',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography fontSize='0.75rem !important' color='#6b859e'>
                  Update
                </Typography>
                <Typography fontSize='1rem !important' fontWeight='600'>
                  {updatingEventsNumber}
                </Typography>
              </Stack>
            </Grid>
            <Grid
              size={{
                sm: 4,
                md: 4,
                lg: 4,
              }}
            >
              <Stack
                sx={{
                  paddingX: '0.5rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.25rem',
                  backgroundColor: '#f7f8fb',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography fontSize='0.75rem !important' color='#6b859e'>
                  Delete
                </Typography>
                <Typography fontSize='1rem !important' fontWeight='600'>
                  {deletingEventsNumber}
                </Typography>
              </Stack>
            </Grid>
            <Grid
              size={{
                sm: 12,
                md: 12,
                lg: 12,
              }}
            >
              <Stack
                sx={{
                  paddingX: '0.5rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.25rem',
                  backgroundColor: '#f7f8fb',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography fontSize='0.75rem !important' color='#6b859e'>
                  Analyzer
                </Typography>
                {optimizerDisabledConstraints.length > 0 ? (
                  <OptimizerResultsAnalyzerNotPassedBadge />
                ) : (
                  <OptimizerResultsAnalyzerPassedBadge />
                )}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
        <Stack
          sx={{
            display: 'flex',
            paddingLeft: '0.75rem',
            paddingRight: '0.25rem',
            paddingY: '0.75rem',
            borderRadius: '8px',
            border: '1px dashed #e0e0e0',
            backgroundColor: '#f7f8fb',
            width: '100%',
            gap: '0.65rem',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Box
              sx={{
                border: '4px dashed rgb(112, 239, 97)',
                borderRadius: '8px',
                width: '50px',
                height: '25px',
                backgroundImage: `repeating-linear-gradient(
                                  -45deg,
                                  rgba(112, 239, 97, 0.25) 0%,
                                  rgba(112, 239, 97, 0.25) 12.5%,
                                  rgba(0, 0, 0, 0) 12.5%,
                                  rgba(0, 0, 0, 0) 25%,
                                  rgba(112, 239, 97, 0.25) 25%,
                                  rgba(112, 239, 97, 0.25) 37.5%,
                                  rgba(0, 0, 0, 0) 37.5%,
                                  rgba(0, 0, 0, 0) 50%,
                                  rgba(112, 239, 97, 0.25) 50%,
                                  rgba(112, 239, 97, 0.25) 62.5%,
                                  rgba(0, 0, 0, 0) 62.5%,
                                  rgba(0, 0, 0, 0) 75%,
                                  rgba(112, 239, 97, 0.25) 75%,
                                  rgba(112, 239, 97, 0.25) 87.5%,
                                  rgba(0, 0, 0, 0) 87.5%,
                                  rgba(0, 0, 0, 0) 100%
                                )`,
              }}
            ></Box>
            <Typography fontSize='12px !important'>Added Events</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Box
              sx={{
                border: '4px dashed rgb(88, 219, 255)',
                borderRadius: '8px',
                width: '50px',
                height: '25px',
                backgroundImage: `repeating-linear-gradient(
                                  -45deg,
                                  rgba(88, 219, 255, 0.25) 0%,
                                  rgba(88, 219, 255, 0.25) 12.5%,
                                  rgba(0, 0, 0, 0) 12.5%,
                                  rgba(0, 0, 0, 0) 25%,
                                  rgba(88, 219, 255, 0.25) 25%,
                                  rgba(88, 219, 255, 0.25) 37.5%,
                                  rgba(0, 0, 0, 0) 37.5%,
                                  rgba(0, 0, 0, 0) 50%,
                                  rgba(88, 219, 255, 0.25) 50%,
                                  rgba(88, 219, 255, 0.25) 62.5%,
                                  rgba(0, 0, 0, 0) 62.5%,
                                  rgba(0, 0, 0, 0) 75%,
                                  rgba(88, 219, 255, 0.25) 75%,
                                  rgba(88, 219, 255, 0.25) 87.5%,
                                  rgba(0, 0, 0, 0) 87.5%,
                                  rgba(0, 0, 0, 0) 100%
                                )`,
              }}
            ></Box>
            <Typography fontSize='12px !important'>Updated Events</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Box
              sx={{
                border: '4px dashed rgb(255, 72, 72)',
                borderRadius: '8px',
                width: '50px',
                height: '25px',
                backgroundImage: `repeating-linear-gradient(
                                  -45deg,
                                  rgba(255, 72, 72, 0.5) 0%,
                                  rgba(255, 72, 72, 0.5) 12.5%,
                                  rgba(0, 0, 0, 0) 12.5%,
                                  rgba(0, 0, 0, 0) 25%,
                                  rgba(255, 72, 72, 0.5) 25%,
                                  rgba(255, 72, 72, 0.5) 37.5%,
                                  rgba(0, 0, 0, 0) 37.5%,
                                  rgba(0, 0, 0, 0) 50%,
                                  rgba(255, 72, 72, 0.5) 50%,
                                  rgba(255, 72, 72, 0.5) 62.5%,
                                  rgba(0, 0, 0, 0) 62.5%,
                                  rgba(0, 0, 0, 0) 75%,
                                  rgba(255, 72, 72, 0.5) 75%,
                                  rgba(255, 72, 72, 0.5) 87.5%,
                                  rgba(0, 0, 0, 0) 87.5%,
                                  rgba(0, 0, 0, 0) 100%
                                )`,
              }}
            ></Box>
            <Typography fontSize='12px !important'>Deleted Events</Typography>
          </Box>
        </Stack>
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: '0.6rem',
          }}
        >
          <Tooltip title='Accept Results' arrow placement='top'>
            <div
              style={{
                flexGrow: '1',
              }}
            >
              <CustomButton
                fullWidth
                onClick={handleAcceptResults}
                loading={loading}
              >
                <DoneIcon fontSize='medium' />
              </CustomButton>
            </div>
          </Tooltip>
          <Tooltip title='Decline Results' arrow placement='top'>
            <div
              style={{
                flexGrow: '1',
              }}
            >
              <CustomButton
                fullWidth
                onClick={handleDecline}
                variant='outlined'
                color='error'
                disabled={loading}
              >
                <CloseIcon fontSize='medium' />
              </CustomButton>
            </div>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default memo(OptimizerResultsRightSideBar);
