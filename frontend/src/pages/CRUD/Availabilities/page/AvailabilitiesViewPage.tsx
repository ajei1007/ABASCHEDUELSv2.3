import React, { useEffect } from 'react';
import AvailabilitiesWidget from 'pages/CRUD/Availabilities/page/AvailabilitiesWidget';
import actions from 'store/actions/availabilities/availabilitiesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const AvailabilitiesViewPage = () => {
  const loading = useTypedSelector(store => store.users.form.findLoading);
  const record = useTypedSelector(store => store.users.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  }, [dispatch, id]);

  return (
    <React.Fragment>
      <AvailabilitiesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default AvailabilitiesViewPage;
