import { memo } from 'react';
import { useAppSelector } from 'store/hooks';
import BackdropLoading from '../BackdropLoading';

const UndeleteEventsLoading = () => {
  const undeletingEventsLoading = useAppSelector(
    (state) => state.calendar.undeletingEventsLoading,
  );

  return (
    <BackdropLoading
      open={undeletingEventsLoading}
      title='Undeleting Appointments...'
    />
  );
};

UndeleteEventsLoading.displayName = 'UndeleteEventsLoading';

export default memo(UndeleteEventsLoading);
