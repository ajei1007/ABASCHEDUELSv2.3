import { memo } from 'react';
import { useAppSelector } from 'store/hooks';
import BackdropLoading from '../BackdropLoading';

const PasteEventsLoading = () => {
  const pasteEventsLoading = useAppSelector(
    (state) => state.calendar.pasteEventsLoading,
  );

  return (
    <BackdropLoading
      open={pasteEventsLoading}
      title='Pasting Appointments...'
    />
  );
};

PasteEventsLoading.displayName = 'PasteEventsLoading';

export default memo(PasteEventsLoading);
