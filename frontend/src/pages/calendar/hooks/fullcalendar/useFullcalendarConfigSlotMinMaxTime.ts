import { useMemo } from 'react';
import { useAppSelector } from 'store/hooks';
import { timeFormats } from '../../constants';

export function useFullcalendarConfigSlotMinMaxTime() {
  const businessStartTime = useAppSelector(
    (state) => state.settings.settingValues.businessStartTime,
  );
  const businessEndTime = useAppSelector(
    (state) => state.settings.settingValues.businessEndTime,
  );

  const businessStartTimeString = useMemo(
    () =>
      businessStartTime.toLocaleTimeString(
        'en-US',
        timeFormats as Intl.DateTimeFormatOptions,
      ),
    [businessStartTime],
  );
  const businessEndTimeString = useMemo(
    () =>
      businessEndTime.toLocaleTimeString(
        'en-US',
        timeFormats as Intl.DateTimeFormatOptions,
      ),
    [businessEndTime],
  );

  return {
    slotMinTime: businessStartTimeString,
    slotMaxTime: businessEndTimeString,
  };
}
