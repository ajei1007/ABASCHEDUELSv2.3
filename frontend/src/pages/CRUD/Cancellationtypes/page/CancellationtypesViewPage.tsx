import React, { useEffect } from 'react';
import CancellationtypesWidget from 'pages/CRUD/Cancellationtypes/page/CancellationtypesWidget';
import actions from 'store/actions/cancellationtypes/cancellationtypesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const CancellationtypesViewPage = () => {
  const loading = useTypedSelector(store => store.cancellationtypes.form.findLoading);
  const record = useTypedSelector(store => store.cancellationtypes.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <React.Fragment>
      <CancellationtypesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default CancellationtypesViewPage;
