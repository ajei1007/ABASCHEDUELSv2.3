import { memo } from 'react';
import DeleteEventsLoading from './DeleteEventsLoading';
import OverbookingLoading from './OverbookingLoading';
import PasteEventsLoading from './PasteEventsLoading';
import UndeleteEventsLoading from './UndeleteEventsLoading';
import NewIntegrationCredentialsCheckLoading from '../new-integrations/NewIntegrationCredentialsCheckLoading';

const CalendarBackdropLoadings = () => {
  return (
    <>
      <OverbookingLoading />
      <DeleteEventsLoading />
      <PasteEventsLoading />
      <UndeleteEventsLoading />
      <NewIntegrationCredentialsCheckLoading />
    </>
  );
};

CalendarBackdropLoadings.displayName = 'CalendarBackdropLoadings';

export default memo(CalendarBackdropLoadings);
