import React, { useEffect } from 'react';
import DrivetimebranchWidget from 'pages/CRUD/Drivetimebranch/page/DrivetimebranchWidget';
import actions from 'store/actions/drivetimebranch/drivetimebranchFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const DrivetimebranchViewPage = () => {
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
      <DrivetimebranchWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default DrivetimebranchViewPage;
