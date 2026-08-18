import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import moment from 'moment';
import {
  Stack,
  Grid2 as Grid,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import InternalPortal from 'components/InternalPortal';
import CustomButton from 'components/Button';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import DragAndDropList from 'components/DragAndDropList/DragAndDropList';
import { DragDropContext } from 'react-beautiful-dnd';
import reorder from 'utils/reorder';
import incrementBy from '../../../utils/incrementBy';
import formatCustomConstraints from '../../../utils/formatCustomConstraints';
import { useFullcalendarApiContext } from '../../../context/FullcalendarApiContext';
import {
  handleOptimizerValues,
  saveDefaultOptimizer,
  optimize,
  setActivityRoleItems,
} from 'store/actions/optimizerActions';
import { saveDefaultConstraintPlacements } from 'store/slices/flagging/actions';

const minutesIncrementBy = (to: number, step = 1, start = 1) =>
  Array.from({ length: Math.floor((to - start) / step) + 1 }, (_, i) => {
    const val = start + i * step;
    return { value: val, label: String(val) };
  });

const MAX_TIME_IN_SECONDS_OPTIONS = minutesIncrementBy(10).map((o) => ({
  ...o,
  label: `${o.label} min`,
  value: o.value * 60,
}));

const OptimizerModalContent = ({
  actionButtonsTargetRef,
  toggleModalOpen,
}: {
  actionButtonsTargetRef: React.RefObject<HTMLElement>;
  toggleModalOpen: () => void;
}) => {
  const dispatch = useAppDispatch();

  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar?.current_branches,
  );
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );

  const optimizerStoreValues = useAppSelector(
    (state) => state.optimizer.optimizerValues,
  );

  const timeZone = useAppSelector(
    (state) => state.settings.settingValues.timezone,
  );
  const isolatedResources = useAppSelector(
    (state) => state.settings.settingValues.isolatedResources,
  );
  const activityRoleItems = optimizerStoreValues.activityRoleItems as any;
  const flagging = useAppSelector((state) => state.flagging);

  // Access the FullCalendar API context to control calendar behavior
  const { calendarApi } = useFullcalendarApiContext();

  const [items, setItems] = useState(flagging.customConstraints ?? null);
  const [optimizerSettingsSaving, setOptimizerSettingsSaving] = useState(false);

  const [partOneOrReshuffle, setPartOneOrReshuffle] = useState('part1');
  const [runMode, setRunMode] = useState('powerful');

  const initPartOneOrReshuffle = useLatestCallback(() => {
    const value = (() => {
      if (optimizerStoreValues['part1']) {
        return 'part1';
      }
      if (optimizerStoreValues['reshuffle']) {
        return 'reshuffle';
      }
      return 'part1';
    })();

    updatePartOneOrReshuffle(value);
  });

  const initRunMode = useLatestCallback(() => {
    const value = optimizerStoreValues['mode'] || 'powerful';
    updateRunMode(value);
  });

  const updatePartOneOrReshuffle = useCallback(
    (value: string) => {
      setPartOneOrReshuffle(value);
      dispatch(handleOptimizerValues('part1', value === 'part1'));
      dispatch(handleOptimizerValues('reshuffle', value === 'reshuffle'));
    },
    [dispatch],
  );

  const updateRunMode = useCallback(
    (value: string) => {
      setRunMode(value);
      dispatch(handleOptimizerValues('mode', value));
    },
    [dispatch],
  );

  useEffect(() => {
    initPartOneOrReshuffle();
    initRunMode();
  }, [initPartOneOrReshuffle, initRunMode]);

  useEffect(() => {
    setItems(flagging.customConstraints);
  }, [flagging.customConstraints]);

  const handleOnDragEndActivityAndRoles = (result: any) => {
    if (!result.destination) {
      return;
    }

    const sourceList = result.source.droppableId;
    const destinationList = result.destination.droppableId;

    if (sourceList === destinationList) {
      // Reorder the items in the same list
      const updatedItems = reorder(
        activityRoleItems[sourceList],
        result.source.index,
        result.destination.index,
      );
      dispatch(setActivityRoleItems({ [sourceList]: updatedItems }));
    }
  };

  const saveOptimizerSettings = async () => {
    const activitiesRanking = activityRoleItems.activities.map(
      (item: any) => item.value,
    );

    setOptimizerSettingsSaving(true);
    try {
      await Promise.all([
        dispatch(
          saveDefaultOptimizer({
            objectiverolesmany: [],
            objectiveactivitiesmany: activitiesRanking,
          }),
        ),
        dispatch(saveDefaultConstraintPlacements(items)),
      ]);
    } finally {
      setOptimizerSettingsSaving(false);
    }
  };

  const handleSetDefaultOptimizer = async () => {
    if (errors.activities) return;
    const confirming = window.confirm(
      'Are You sure you want to save these optimizer settings as your default settings?',
    );
    if (confirming) {
      await saveOptimizerSettings();
    }
  };

  const handleActivateOptimizer = async (version = 'v1') => {
    // const startDate = store.calendar_start;
    // const endDate = store.calendar_end;
    // if (moment(startDate).diff(endDate) !== 0) {
    //   return toast.warning('Currently optimizer allows only one day');
    // }
    if (errors.activities) return;
    const confirming = window.confirm(
      'Are You sure you want to start optimization process?',
    );

    if (confirming) {
      const { soft, high, disabled, hard } = formatCustomConstraints(items);

      const activitiesRanking = activityRoleItems.activities.map(
        (item: any) => item.value,
      );
      dispatch(
        optimize(
          {
            teamOptimizer: storeCurrentBranches.map((t) => t.value),
            objectiveRolesRanking: [],
            activitiesRanking,
            soft,
            high,
            disabled,
            hard,
            isolatedResources: isolatedResources.map((r) => r.value),
            runMode,
          },
          version,
        ),
      );
      saveOptimizerSettings();
      toggleModalOpen();
    }
  };

  const calendarDate = calendarApi
    ? moment(calendarApi.getDate()).tz(timeZone).format('dddd, MMM D, yyyy')
    : '';

  const selectedBranch = storeCurrentBranches?.[0]?.label ?? '';

  const handlePartOneOrReshuffleChange = (_: any, newValue: string) => {
    if (newValue) {
      updatePartOneOrReshuffle(newValue);
    }
  };

  const handleRunModeChange = (_: any, newValue: string) => {
    if (newValue) {
      updateRunMode(newValue);
    }
  };

  const errors = useMemo(
    () => ({
      activities: !activityRoleItems?.activities?.length,
    }),
    [activityRoleItems?.activities?.length],
  );

  return (
    <Stack rowGap='1rem'>
      <Stack flexDirection='row' flexWrap='wrap' alignItems='center' gap={2}>
        <Typography>
          Date: <strong>{calendarDate}</strong>
        </Typography>
        <Typography>
          Branch: <strong>{selectedBranch}</strong>
        </Typography>
        <Box ml='auto'>
          <ToggleButtonGroup
            color='primary'
            value={partOneOrReshuffle}
            onChange={handlePartOneOrReshuffleChange}
            exclusive
            size='small'
            sx={{
              '& .MuiToggleButton-root': {
                paddingY: '0.25rem',
                paddingX: '0.75rem',
                textTransform: 'capitalize',
                '&.Mui-selected': {
                  color: '#4d53e0 !important',
                  backgroundColor: 'rgba(77, 83, 224, 0.2) !important',
                  boxShadow: 'none !important',
                },
              },
            }}
          >
            <ToggleButton value='part1'>Start From Scratch</ToggleButton>
            <ToggleButton value='reshuffle'>Reshuffle</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Stack>
      {false && (
        <Grid container columnSpacing='1rem' columns={{ sm: 12, md: 12 }}>
          {!optimizerStoreValues['part1'] && (
            <Grid
              size={{
                sm: 6,
              }}
            >
              <label>Max Appointments Changed</label>
              <CustomSelect
                onChange={(e: any) =>
                  dispatch(handleOptimizerValues('percentignore', e.value))
                }
                value={incrementBy(21, 0, 1)
                  .filter(
                    (e) => e.value === optimizerStoreValues['percentignore'],
                  )
                  .map((r) => ({ ...r, label: `${r.label}` }))}
                options={incrementBy(21, 0, 1).map((r) => ({
                  ...r,
                  label: `${r.label}`,
                }))}
              />
            </Grid>
          )}
        </Grid>
      )}
      <Grid
        container
        spacing='1rem'
        columns={{ xs: 12, sm: 12, md: 12 }}
        style={{
          display: 'none', // Temporarily hide this section
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 6,
          }}
        >
          <label>Max Time</label>
          <CustomSelect
            onChange={(e: any) =>
              dispatch(
                handleOptimizerValues('max_time_in_seconds', e?.value ?? null),
              )
            }
            value={MAX_TIME_IN_SECONDS_OPTIONS.filter(
              (opt) =>
                opt.value === optimizerStoreValues['max_time_in_seconds'],
            )}
            options={MAX_TIME_IN_SECONDS_OPTIONS}
            placeholder='Select duration'
            isClearable
          />
        </Grid>
      </Grid>
      <Grid
        mt={1}
        container
        spacing='1rem'
        columns={{ xs: 12, sm: 12, md: 12 }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 8,
          }}
        >
          <label>Activity</label>
          <CustomSelect
            isMulti={true}
            options={storeActivityResources.map((resource) => ({
              value: resource.id,
              label: resource.title,
            }))}
            value={activityRoleItems.activities}
            onChange={(data: any) => {
              dispatch(setActivityRoleItems({ activities: data }));
            }}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <label>Run Mode</label>
          <ToggleButtonGroup
            color='primary'
            value={runMode}
            onChange={handleRunModeChange}
            exclusive
            size='small'
            sx={{
              display: 'flex',
              '& .MuiToggleButton-root': {
                paddingY: '0.25rem',
                paddingX: '0.75rem',
                height: '40px',
                textTransform: 'capitalize',
                fontSize: '0.9rem!important',
                lineHeight: '1.4rem',
                fontWeight: 500,
                flexGrow: 1,
                flexShrink: 0,
                '&.Mui-selected': {
                  color: '#4d53e0 !important',
                  backgroundColor: 'rgba(77, 83, 224, 0.2) !important',
                  boxShadow: 'none !important',
                },
              },
            }}
          >
            <ToggleButton value='powerful'>Powerful</ToggleButton>
            <ToggleButton value='fast'>Fast</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      {/* Objective Role and Activities Rankings */}
      <Grid container columns={{ sm: 12, md: 12 }} spacing={1}>
        {activityRoleItems && (
          <DragDropContext onDragEnd={handleOnDragEndActivityAndRoles}>
            <Grid
              size={{
                sm: 12,
                md: 12,
              }}
            >
              <label>Activity Ranking</label>
              <Stack
                justifyContent='center'
                sx={{
                  background: '#f7f8fb',
                  borderRadius: '0.5rem',
                  padding: '0.8rem 0.5rem',
                  pb: '0',
                }}
              >
                {/* @ts-ignore */}
                <DragAndDropList
                  items={activityRoleItems.activities.map((obj: any) => ({
                    id: obj.value,
                    constraintId: obj.value,
                    content: obj.label,
                  }))}
                  columnId={'activities'}
                  showRanking
                />
              </Stack>
              {errors.activities && (
                <Typography className='error-message'>
                  Activity cannot be blank
                </Typography>
              )}
            </Grid>
          </DragDropContext>
        )}
      </Grid>

      <InternalPortal targetRef={actionButtonsTargetRef}>
        <CustomButton
          disabled={optimizerSettingsSaving}
          onClick={() => handleActivateOptimizer('v1')}
        >
          Optimize
        </CustomButton>
        <CustomButton
          style={{ display: 'none' }}
          disabled={optimizerSettingsSaving}
          onClick={() => handleActivateOptimizer('v2')}
        >
          Optimize SAM
        </CustomButton>
        <CustomButton
          disabled={optimizerSettingsSaving}
          onClick={handleSetDefaultOptimizer}
          variant='outlined'
        >
          Save As Default
        </CustomButton>
        <CustomButton onClick={toggleModalOpen} variant='outlined'>
          Cancel
        </CustomButton>
      </InternalPortal>
    </Stack>
  );
};

export default memo(OptimizerModalContent);
