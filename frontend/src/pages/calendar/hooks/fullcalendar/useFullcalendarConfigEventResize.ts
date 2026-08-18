import { useCallback } from 'react';
import { handleResizingEvents } from 'store/slices/calendar/thunks';
import { useAppDispatch } from 'store/hooks';

export function useFullcalendarConfigEventResize({
  handleReplaceEvents,
}: {
  handleReplaceEvents: (eventInfo: any) => void;
}) {
  const dispatch = useAppDispatch();

  const eventResizeStart = useCallback(
    (info: any) => {
      dispatch(handleResizingEvents({ event: info.event }));
    },
    [dispatch],
  );

  const eventResizeStop = useCallback(
    (info: any) => {
      dispatch(handleResizingEvents({ event: info.event, add: false }));
    },
    [dispatch],
  );

  const eventResize = useCallback(
    (eventInfo: any) => handleReplaceEvents(eventInfo),
    [handleReplaceEvents],
  );

  return {
    eventResizeStart,
    eventResizeStop,
    eventResize,
  };
}
