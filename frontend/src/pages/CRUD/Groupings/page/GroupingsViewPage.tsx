import React, { useEffect } from 'react';
import GroupingsWidget from 'pages/CRUD/Groupings/page/GroupingsWidget';
import actions from 'store/actions/groupings/groupingsFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const GroupingsViewPage = () => {
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
      <GroupingsWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default GroupingsViewPage;
