import React, { useEffect } from 'react';
import TimeofftypesWidget from 'pages/CRUD/Timeofftypes/page/TimeofftypesWidget';
import actions from 'store/actions/timeofftypes/timeofftypesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const TimeofftypesViewPage = () => {
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
      <TimeofftypesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default TimeofftypesViewPage;
