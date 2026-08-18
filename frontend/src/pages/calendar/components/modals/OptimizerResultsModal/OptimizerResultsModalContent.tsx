import CustomButton from 'components/Button';
import InternalPortal from 'components/InternalPortal';
import UndynamicTable from '../../UndynamicTable';
import { optimizerResultsColumns } from '../../../utils/calendarTableColumns';
import { memo, useMemo, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { Grid2 as Grid, Stack, Typography } from '@mui/material';
import {
  optimizerResultsSelector,
  optimizerCreatingUpdatingEventsSelector,
  optimizerDeletingEventsSelector,
  optimizerResultsSelectedIdsMapSelector,
  optimizerDisabledConstraintsSelector,
} from 'store/selectors/optimizerSelectors';
import { useOptimizerAcceptResults } from '../../../hooks/useOptimizerAcceptResults';
import {
  setOptimizerResultsSelectedIdsMap,
  resetOptimizerResults,
} from 'store/actions/optimizerActions';
import OptimizerResultsAnalyzerPassedBadge from '../../OptimizerResultsAnalyzerPassedBadge';
import OptimizerResultsAnalyzerNotPassedBadge from '../../OptimizerResultsAnalyzerNotPassedBadge';
import { visalizeOptimizerResultStatisticsKeys } from '../../../constants/optimizer';

const OptimizerResultsModalContent = ({
  actionButtonsTargetRef,
  toggleModalOpen,
  onLoadingChange,
}: {
  actionButtonsTargetRef: React.RefObject<HTMLElement>;
  toggleModalOpen: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) => {
  const dispatch = useAppDispatch();
  const optimizerResults = useAppSelector(optimizerResultsSelector);
  const optimizerDisabledConstraints = useAppSelector(
    optimizerDisabledConstraintsSelector,
  );

  const optimizerCreatingUpdatingEvents = useAppSelector(
    optimizerCreatingUpdatingEventsSelector,
  );
  const optimizerDeletingEvents = useAppSelector(
    optimizerDeletingEventsSelector,
  );
  const optimizerResultsSelectedIdsMap = useAppSelector(
    optimizerResultsSelectedIdsMapSelector,
  );

  const { loading, handleAcceptResults } = useOptimizerAcceptResults({
    afterAcceptResults: toggleModalOpen,
  });

  const optimizerResultEvents = useMemo(
    () => [...optimizerCreatingUpdatingEvents, ...optimizerDeletingEvents],
    [optimizerCreatingUpdatingEvents, optimizerDeletingEvents],
  );

  const handleRowSelectionChange = useCallback(
    (getState: any) => {
      dispatch(
        setOptimizerResultsSelectedIdsMap(
          getState(optimizerResultsSelectedIdsMap),
        ),
      );
    },
    [dispatch, optimizerResultsSelectedIdsMap],
  );

  const handleDecline = useCallback(() => {
    dispatch(resetOptimizerResults());
    toggleModalOpen();
  }, [dispatch, toggleModalOpen]);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  return (
    <>
      {/* Statistics */}
      <Grid container spacing='0.5rem' columns={{ sm: 12, md: 12 }} mb={2}>
        {visalizeOptimizerResultStatisticsKeys.map((statisticsObj) => {
          const statisticsValue =
            optimizerResults[0]?.statistics?.[statisticsObj.key];
          if (statisticsValue !== undefined && statisticsValue !== null) {
            return (
              <Grid
                size={{
                  sm: 2,
                  md: 3,
                }}
              >
                <Stack
                  style={{
                    backgroundColor: '#f7f8fb',
                    padding: '1rem',
                    borderRadius: '8px',
                    height: '100%',
                  }}
                >
                  <Typography fontSize='0.875rem' color='#6b859e'>
                    {statisticsObj.title}
                  </Typography>
                  <Typography fontSize='1rem' fontWeight='600'>
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
            sm: 2,
            md: 3,
          }}
        >
          <Stack
            style={{
              backgroundColor: '#f7f8fb',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            <Typography fontSize='0.875rem' color='#6b859e'>
              Analyzer
            </Typography>
            {optimizerDisabledConstraints.length > 0 ? (
              <OptimizerResultsAnalyzerNotPassedBadge clickable={false} />
            ) : (
              <OptimizerResultsAnalyzerPassedBadge />
            )}
          </Stack>
        </Grid>
      </Grid>
      {/* Table */}
      <UndynamicTable
        columns={optimizerResultsColumns}
        rows={optimizerResultEvents as any}
        enableRowSelection
        rowSelection={optimizerResultsSelectedIdsMap}
        onRowSelectionChange={handleRowSelectionChange as any}
      />

      <InternalPortal targetRef={actionButtonsTargetRef}>
        <CustomButton onClick={handleAcceptResults} loading={loading}>
          Accept Results
        </CustomButton>
        <CustomButton
          onClick={handleDecline}
          disabled={loading}
          variant='outlined'
          color='error'
        >
          Decline
        </CustomButton>
        <CustomButton
          onClick={toggleModalOpen}
          disabled={loading}
          variant='outlined'
        >
          Close
        </CustomButton>
      </InternalPortal>
    </>
  );
};

export default memo(OptimizerResultsModalContent);
