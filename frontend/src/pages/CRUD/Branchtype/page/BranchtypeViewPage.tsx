import React, { useEffect } from 'react';
import BranchtypeWidget from 'pages/CRUD/Branchtype/page/BranchtypeWidget';
import actions from 'store/actions/branchtype/branchtypeFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const BranchtypeViewPage = () => {
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
      <BranchtypeWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default BranchtypeViewPage;
