import React, { useEffect } from 'react';
import MobiletokensWidget from 'pages/CRUD/Mobiletokens/page/MobiletokensWidget';
import actions from 'store/actions/mobiletokens/mobiletokensFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const MobiletokensViewPage = () => {
  const loading = useTypedSelector(store => store.users.form.findLoading);
  const record = useTypedSelector(store => store.users.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  }, [id]);

  return (
    <React.Fragment>
      <MobiletokensWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default MobiletokensViewPage;
