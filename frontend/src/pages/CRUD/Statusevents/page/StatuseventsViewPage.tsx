import React, { useEffect } from 'react';
import StatuseventsWidget from 'pages/CRUD/Statusevents/page/StatuseventsWidget';
import actions from 'store/actions/statusevents/statuseventsFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const StatuseventsViewPage = () => {
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
      <StatuseventsWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default StatuseventsViewPage;
