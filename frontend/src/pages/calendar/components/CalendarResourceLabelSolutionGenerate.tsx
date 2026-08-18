import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  memo,
  type FC,
} from 'react';
import {
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Skeleton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomAsyncSelect from 'components/CustomAsyncSelect/CustomAsyncSelect';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { useLoadResourceOptions } from 'pages/calendar/hooks/useLoadResourceOptions';
import { setSortResourcesSolGen } from 'store/slices/calendar/actions';
import {
  createSolutionGeneratorJob,
  deleteSolutionGeneratorJob,
} from 'store/slices/solutionGenerator/actions';
import {
  selectSolutionGeneratorJobs,
  selectSolutionGeneratorResults,
} from 'store/slices/solutionGenerator';
import type { ISolutionGeneratorJob } from 'types';

// Constants moved outside component to prevent recreation on every render
const RESOURCE_TYPES = ['Employee', 'Client'] as const;

/**
 * Sort options for solution generator results
 */
const SORT_OPTIONS = [
  { value: 'longest', label: 'Longest' },
  { value: 'shortest', label: 'Shortest' },
  // Future options:
  // { value: 'efficiency', label: 'Efficiency' },
  // { value: 'priority', label: 'Priority' }
] as const;

/**
 * Common styles for select components to ensure consistent z-index behavior
 */
const SELECT_STYLES = {
  menu: (provided: any) => ({
    ...provided,
    zIndex: 9999,
    position: 'relative',
  }),
} as const;

export interface ICalendarResourceLabelSolutionGenerateProps {
  /** ID of the resource for which to generate solutions */
  resourceId?: string;
  /** Callback to update calendar size after component changes */
  updateCalendarSize: () => void;
}

/**
 * Component for generating and displaying solution suggestions for calendar resources.
 * Provides filtering and sorting capabilities for solution generation results.
 */
const CalendarResourceLabelSolutionGenerate: FC<
  ICalendarResourceLabelSolutionGenerateProps
> = ({ resourceId, updateCalendarSize }) => {
  const dispatch = useAppDispatch();

  // Store selectors - accessing calendar and solution generator state
  const currentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const lazyResources = useAppSelector((state) => state.calendar.lazyResources);
  const activityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const locationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const blockResources = useAppSelector(
    (state) => state.calendar.blockResources,
  );
  const lazyResourcesFetchStatus = useAppSelector(
    (state) => state.calendar.lazyResourcesFetchStatus,
  );
  const resourceSortsSolGen = useAppSelector(
    (state) => state.calendar.resourceSortsSolGen,
  );
  const solutionGeneratorJobs = useAppSelector(selectSolutionGeneratorJobs);
  const solutionGeneratorResults = useAppSelector(
    selectSolutionGeneratorResults,
  );

  // Local state for user selections
  const [selectedResourceFilters, setSelectedResourceFilters] = useState<any[]>(
    [],
  );

  // Computed values derived from store state
  const currentBranchId = currentBranches[0]?.value;
  const jobKey = `${resourceId}__${currentBranchId}`;

  /**
   * Current solution generator job for this resource and branch
   */
  const currentJob = useMemo<ISolutionGeneratorJob | null>(
    () => solutionGeneratorJobs[jobKey] || null,
    [solutionGeneratorJobs, jobKey],
  );

  /**
   * Results from the current solution generator job
   */
  const jobResults = useMemo<any[]>(
    () =>
      Array.isArray(solutionGeneratorResults[jobKey])
        ? solutionGeneratorResults[jobKey]
        : [],
    [solutionGeneratorResults, jobKey],
  );

  // Derived state for UI rendering
  const isJobLoading = currentJob?.status === 'loading';
  const isJobFailed = currentJob?.status === 'failed';
  const errorMessage = currentJob?.errorMessage || '';
  const totalEventsCount = jobResults.length;

  /**
   * Combined resources from all sources, filtered to relevant types
   */
  const allResources = useMemo(
    () => [
      ...lazyResources.filter((r) => RESOURCE_TYPES.includes(r.type as any)),
      ...activityResources,
      ...locationResources,
      ...blockResources,
    ],
    [lazyResources, activityResources, locationResources, blockResources],
  );

  /**
   * Checks if all required resources have been loaded successfully
   */
  const areResourcesLoaded = useMemo(() => {
    const requiredStatuses = [
      lazyResourcesFetchStatus[`${currentBranchId}:Employee`],
      lazyResourcesFetchStatus[`${currentBranchId}:Client`],
    ];
    return requiredStatuses.every((status) => status === 'success');
  }, [lazyResourcesFetchStatus, currentBranchId]);

  // Resource options hook for async select component
  const { loadResourceOptions, shouldShowDefaultOptions } =
    useLoadResourceOptions({
      resources: allResources,
      resourcesLoaded: areResourcesLoaded,
      transformData: (data) =>
        data.map((item) => ({
          value: item.id,
          label: item.title,
          type: item.type,
        })),
    });

  /**
   * Handles changes to resource filter selection
   * Triggers new solution generation with selected filters
   */
  const handleResourceFiltersChange = useCallback((resources: any[]) => {
    setSelectedResourceFilters(resources);
    startSolutionGeneration({
      filterResourceIds: resources.map((r) => r.value),
    });
  }, []);

  /**
   * Handles changes to sort criteria selection
   * Updates both local state and Redux store
   */
  const handleSortCriteriaChange = useCallback(
    (sortBy: any[]) => {
      const sortCriteria = sortBy ? [sortBy] : [];
      dispatch(setSortResourcesSolGen(sortCriteria));
    },
    [dispatch],
  );

  /**
   * Initiates solution generation with current parameters
   * Uses useLatestCallback to ensure we always have the latest values
   */
  const startSolutionGeneration = useLatestCallback(
    ({ filterResourceIds = [] }: { filterResourceIds?: string[] } = {}) => {
      if (!resourceId || !currentBranchId) {
        return;
      }

      dispatch(
        createSolutionGeneratorJob({
          resourceId,
          branchId: currentBranchId,
          filterResourceIds,
        }),
      );
    },
  );

  /**
   * Stops the current solution generation job
   * Cleans up resources when component unmounts or conditions change
   */
  const stopSolutionGeneration = useCallback(() => {
    if (resourceId && currentBranchId) {
      dispatch(
        deleteSolutionGeneratorJob({
          resourceId,
          branchId: currentBranchId,
        }),
      );
    }
  }, [dispatch, resourceId, currentBranchId]);

  /**
   * Handles refresh button click
   * Restarts solution generation with current filter settings
   */
  const handleRefreshClick = useCallback(() => {
    startSolutionGeneration({
      filterResourceIds: selectedResourceFilters.map((r) => r.value),
    });
  }, [startSolutionGeneration, selectedResourceFilters]);

  // Effects - component lifecycle management
  useEffect(() => {
    // Update calendar size after component renders
    window.setTimeout(updateCalendarSize);

    // Start initial solution generation
    startSolutionGeneration();

    // Cleanup on unmount
    return stopSolutionGeneration;
  }, [updateCalendarSize, startSolutionGeneration, stopSolutionGeneration]);

  // Early return if no job exists - component not ready to render
  if (!currentJob) {
    return null;
  }

  return (
    <Stack direction='column' px={1} pt={1} pb={1.5} rowGap={1}>
      {/* Header Section - Title and Refresh Button */}
      <Stack direction='row' columnGap={1} alignItems='center'>
        <Typography fontSize='1rem!important'>Possible Solutions</Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: 0.5,
          }}
        >
          {isJobLoading ? (
            <Tooltip title={'Generating solutions...'} placement='top' arrow>
              <RefreshIcon
                data-qa='sol-gen-status'
                data-status='loading'
                sx={{
                  color: '#abafc9',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </Tooltip>
          ) : isJobFailed ? (
            <Tooltip
              title={`Failed to generate solutions: ${errorMessage}. Click to retry.`}
              placement='top'
              arrow
            >
              <ErrorOutlineIcon
                data-qa='sol-gen-status'
                data-status='error'
                sx={{
                  color: '#d32f2f',
                  fontSize: '1.35rem',
                }}
              />
            </Tooltip>
          ) : (
            <Tooltip
              title={`Solutions generated successfully`}
              placement='top'
              arrow
            >
              <CheckCircleOutlineIcon
                data-qa='sol-gen-status'
                data-status='success'
                sx={{
                  color: 'green',
                  fontSize: '1.35rem',
                }}
              />
            </Tooltip>
          )}
          <Tooltip title={`Refresh Solutions`} placement='top' arrow>
            <IconButton
              sx={{
                p: '2px',
                position: 'relative',
                visibility: isJobLoading ? 'hidden' : 'visible',
              }}
              aria-label='refresh'
              onClick={handleRefreshClick}
            >
              <RefreshIcon
                sx={{
                  color: '#4d53e0',
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>

      {/* Event Count Display */}
      <Stack pt={0.25} pb={0.5} direction='row' alignItems='center'>
        <Typography
          fontSize='0.75rem!important'
          sx={{
            display: 'flex',
            alignItems: 'center',
            columnGap: 1,
          }}
        >
          Total Events:{' '}
          {isJobLoading ? (
            <Skeleton
              component='span'
              variant='text'
              width='1rem'
              height='0.875rem'
              animation='wave'
              sx={{ transform: 'none' }}
            />
          ) : (
            <Box
              component='span'
              sx={{
                color: '#4d53e0',
                fontWeight: 500,
              }}
            >
              {totalEventsCount}
            </Box>
          )}
        </Typography>
      </Stack>

      {/* Resource Filters Section */}
      <Stack spacing={0.5}>
        <Typography fontSize='0.75rem'>Filter by Resources:</Typography>
        <CustomAsyncSelect
          isMulti
          loadOptions={loadResourceOptions}
          defaultOptions={shouldShowDefaultOptions}
          value={selectedResourceFilters}
          onChange={handleResourceFiltersChange}
          styles={SELECT_STYLES}
        />
      </Stack>

      {/* Sort Criteria Section */}
      <Stack spacing={0.5}>
        <Typography fontSize='0.75rem'>Sort by Criteria:</Typography>
        <CustomSelect
          onChange={handleSortCriteriaChange}
          options={SORT_OPTIONS}
          value={resourceSortsSolGen?.[0] || null}
          isClearable
          styles={SELECT_STYLES}
        />
      </Stack>
    </Stack>
  );
};

export default memo(CalendarResourceLabelSolutionGenerate);
