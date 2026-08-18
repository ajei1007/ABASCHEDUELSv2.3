import { memo, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { fetchResourcesLazy } from 'store/slices/calendar/thunks';
import { CircularProgress, Stack, IconButton } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';

interface ICalendarResourceLabelLoader {
  branchId?: string;
  resourceType: string;
  shouldFetch: boolean;
  updateCalendarSize: () => void;
}
const CalendarResourceLabelLoader = ({
  branchId,
  resourceType,
  shouldFetch,
  updateCalendarSize,
}: ICalendarResourceLabelLoader) => {
  const dispatch = useAppDispatch();
  const lazyResourcesFetchStatus = useAppSelector(
    (state) => state.calendar.lazyResourcesFetchStatus,
  );
  const currentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const prevBranchId = useRef<string | null>(null);

  const _branchId = branchId || currentBranches[0]?.value;
  const fetchStatusKey = `${_branchId}:${resourceType}`;
  const fetchStatus = lazyResourcesFetchStatus[fetchStatusKey];

  const fetchLazyResources = useLatestCallback((branchId: string) => {
    if (!branchId) {
      return;
    }

    dispatch(
      fetchResourcesLazy({
        branchId,
        resourceType,
      }),
    );
  });

  useEffect(() => {
    const _prevBranchId = prevBranchId.current;
    prevBranchId.current = _branchId;

    if (shouldFetch && !_prevBranchId && _branchId) {
      fetchLazyResources(_branchId);
    }
  }, [fetchLazyResources, shouldFetch, _branchId]);

  useEffect(() => {
    updateCalendarSize();
  }, [fetchStatus, updateCalendarSize]);

  if (fetchStatus === 'success') {
    return null;
  }

  return (
    <Stack direction='row' justifyContent='center'>
      {fetchStatus === 'error' ? (
        <IconButton
          size='small'
          color='error'
          onClick={() => fetchLazyResources(_branchId)}
        >
          <ReplayIcon />
        </IconButton>
      ) : (
        <Stack paddingY={'9px'}>
          <CircularProgress size={16} color='info' />
        </Stack>
      )}
    </Stack>
  );
};

export type { ICalendarResourceLabelLoader };
export default memo(CalendarResourceLabelLoader);
