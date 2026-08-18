import React, { useEffect } from 'react';
import RolesWidget from 'pages/CRUD/Roles/page/RolesWidget';
import actions from 'store/actions/roles/rolesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const RolesViewPage = () => {
  const loading = useTypedSelector(store => store.roles.form.findLoading);
  const record = useTypedSelector(store => store.roles.form.record);
  const dispatch = useAppDispatch();
  type Params = {
    resources: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {resources} = useParams<Params>();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || '', resources))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, resources]);

  return (
    <React.Fragment>
      <RolesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default RolesViewPage;
