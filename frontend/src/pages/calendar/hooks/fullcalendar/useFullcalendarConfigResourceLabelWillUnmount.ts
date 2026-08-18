import { useAppDispatch, useAppSelector } from 'store/hooks';
import { filterOutVisibleResource } from 'store/slices/calendar/actions';
import { useLatestCallback } from 'hooks/useLatestCallback';
import socket from 'services/socket';

export function useFullcalendarConfigResourceLabelWillUnmount() {
  const dispatch = useAppDispatch();
  const storeVisibleResources = useAppSelector(
    (state) => state.calendar.visibleResources,
  );

  const resourceLabelWillUnmount = useLatestCallback((arg: any) => {
    if (!Array.isArray(arg.resource.extendedProps?.roles)) {
      return;
    }

    const resourceId = arg.resource.id as string;
    if (!storeVisibleResources.some(({ id }) => id === resourceId)) {
      return;
    }
    const isPerson =
      arg.resource.extendedProps?.roles?.includes('Person') || false;

    if (isPerson && arg.resource.extendedProps.name) {
      // SOCKET CODE
      socket.emit('leave_room', resourceId);
    }

    dispatch(filterOutVisibleResource(resourceId));
  });

  return resourceLabelWillUnmount;
}
