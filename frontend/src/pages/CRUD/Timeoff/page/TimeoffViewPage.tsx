/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import TimeoffWidget from 'pages/CRUD/Timeoff/page/TimeoffWidget';
import actions from 'store/actions/timeoff/timeoffFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const TimeoffViewPage = () => {
  const loading = useTypedSelector(store => store.users.form.findLoading);
  const record = useTypedSelector(store => store.users.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  }, [id]);

  return (
    <React.Fragment>
      <TimeoffWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default TimeoffViewPage;
