import React, { useEffect } from 'react';
import IndustriesWidget from 'pages/CRUD/Industries/page/IndustriesWidget';
import actions from 'store/actions/industries/industriesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const IndustriesViewPage = () => {
  const loading = useTypedSelector(store => store.users.form.findLoading);
  const record = useTypedSelector(store => store.users.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  }, [id]);

  return (
    <React.Fragment>
      <IndustriesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default IndustriesViewPage;
