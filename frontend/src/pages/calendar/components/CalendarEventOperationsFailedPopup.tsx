import { memo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import SmallPopup from 'components/SmallPopup';
import { setRetryPopup } from 'store/slices/calendar/actions';
import { operateSelectedEvents } from 'store/slices/calendar/thunks';

const CalendarEventOperationsFailedPopup = () => {
  const dispatch = useAppDispatch();
  const retryPopup = useAppSelector((state) => state.calendar.retryPopup);
  const retryData = useAppSelector((state) => state.calendar.retryData);

  const handleRetry = useCallback(
    (retry = false) => {
      if (retry && retryData) {
        dispatch(
          operateSelectedEvents({
            operations: retryData,
            formatted: false,
            availabilityObj: null,
            runFlagging: true,
            revertFunction: null,
            copyActive: false,
            skipValidation: true,
          }),
        );
      }

      dispatch(
        setRetryPopup({
          modal: false,
          data: null,
        }),
      );
    },
    [dispatch, retryData],
  );

  return (
    <SmallPopup
      open={retryPopup}
      message='Operation failed, please try again!'
      actionText='Retry'
      handleClickActionButton={handleRetry}
      handleClosePopup={handleRetry}
    />
  );
};

CalendarEventOperationsFailedPopup.displayName =
  'CalendarEventOperationsFailedPopup';

export default memo(CalendarEventOperationsFailedPopup);
