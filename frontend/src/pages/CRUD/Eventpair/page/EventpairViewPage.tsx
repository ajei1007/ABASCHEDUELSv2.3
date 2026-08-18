import React, { useEffect } from 'react';
import EventpairWidget from 'pages/CRUD/Eventpair/page/EventpairWidget';
import actions from 'store/actions/eventpair/eventpairFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const EventpairViewPage = () => {
  const loading = useTypedSelector(store => store.users.form.findLoading);
  const record = useTypedSelector(store => store.users.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <React.Fragment>
      <EventpairWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default EventpairViewPage;
