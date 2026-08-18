import React, { useEffect } from 'react';
import DrivetimelocationWidget from 'pages/CRUD/Drivetimelocation/page/DrivetimelocationWidget';
import actions from 'store/actions/drivetimelocation/drivetimelocationFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const DrivetimelocationViewPage = () => {
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
      <DrivetimelocationWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default DrivetimelocationViewPage;
