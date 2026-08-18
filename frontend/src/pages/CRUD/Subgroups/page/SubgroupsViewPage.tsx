import React, { useEffect } from 'react';
import SubgroupsWidget from 'pages/CRUD/Subgroups/page/SubgroupsWidget';
import actions from 'store/actions/subgroups/subgroupsFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const SubgroupsViewPage = () => {
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
      <SubgroupsWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default SubgroupsViewPage;
