import React, { useEffect } from 'react';
import TotaltypesWidget from 'pages/CRUD/Totaltypes/page/TotaltypesWidget';
import actions from 'store/actions/totaltypes/totaltypesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const TotaltypesViewPage = () => {
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
      <TotaltypesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default TotaltypesViewPage;
