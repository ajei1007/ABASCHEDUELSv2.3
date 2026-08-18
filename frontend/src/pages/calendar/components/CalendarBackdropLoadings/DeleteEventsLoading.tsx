import { memo } from 'react';
import { useAppSelector } from 'store/hooks';
import BackdropLoading from '../BackdropLoading';

const DeleteEventsLoading = () => {
  const deleteEventsLoading = useAppSelector(
    (state) => state.calendar.deleteEventsLoading,
  );

  return (
    <BackdropLoading
      open={deleteEventsLoading}
      title='Pasting Appointments...'
    />
  );
};

DeleteEventsLoading.displayName = 'DeleteEventsLoading';

export default memo(DeleteEventsLoading);
