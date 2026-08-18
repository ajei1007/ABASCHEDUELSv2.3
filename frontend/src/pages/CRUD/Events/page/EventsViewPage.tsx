import React, { useEffect } from 'react';
import EventsWidget from 'pages/CRUD/Events/page/EventsWidget';
import actions from 'store/actions/events/eventsFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const EventsViewPage = () => {
  const loading = useTypedSelector(store => store.events.form.findLoading);
  const record = useTypedSelector(store => store.events.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <React.Fragment>
      <EventsWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default EventsViewPage;
