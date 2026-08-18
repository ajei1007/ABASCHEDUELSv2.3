import React, { useEffect } from 'react';
import BranchesWidget from 'pages/CRUD/Branches/page/BranchesWidget';
import actions from 'store/actions/branches/branchesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const BranchesViewPage = () => {
  const loading = useTypedSelector(store => store.branches.form.findLoading);
  const record = useTypedSelector(store => store.branches.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <React.Fragment>
      <BranchesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default BranchesViewPage;
