import React, { useEffect } from 'react';
import PrioritiesWidget from 'pages/CRUD/Priorities/page/PrioritiesWidget';
import actions from 'store/actions/priorities/prioritiesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const PrioritiesViewPage = () => {
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
      <PrioritiesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default PrioritiesViewPage;
