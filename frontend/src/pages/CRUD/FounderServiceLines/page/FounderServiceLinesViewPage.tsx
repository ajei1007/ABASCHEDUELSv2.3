import React, { useEffect } from 'react';
import FounderServiceLinesWidget from 'pages/CRUD/FounderServiceLines/page/FounderServiceLinesWidget';
import actions from 'store/actions/capacityconstraints/capacityconstraintsFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const FounderServiceLinesViewPage = () => {
  const loading = useTypedSelector(store => store.founderServiceLines.form.findLoading);
  const record = useTypedSelector(store => store.founderServiceLines.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <React.Fragment>
      <FounderServiceLinesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default FounderServiceLinesViewPage;
