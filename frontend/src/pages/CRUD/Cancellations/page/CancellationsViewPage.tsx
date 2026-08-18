import React from 'react';
import CancellationsWidget from 'pages/CRUD/Cancellations/page/CancellationsWidget';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";

const CancellationsViewPage = () => {
  const loading = useTypedSelector(store => store.users.form.findLoading);
  const record = useTypedSelector(store => store.users.form.record);

  return (
    <React.Fragment>
      <CancellationsWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default CancellationsViewPage;
