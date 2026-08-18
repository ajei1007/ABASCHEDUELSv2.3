import React, { useState, useEffect } from 'react';
import CapacityconstraintsForm from 'pages/CRUD/Capacityconstraints/form/CapacityconstraintsForm';
import actions from 'store/actions/capacityconstraints/capacityconstraintsFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams, useMatch, useNavigate } from 'react-router';

const CapacityconstraintsFormPage = () => {

  const record = useTypedSelector(store => store.capacityconstraints.form.record);
  const findLoading = useTypedSelector(store => store.capacityconstraints.form.findLoading);
  const saveLoading = useTypedSelector(store => store.capacityconstraints.form.saveLoading);
  const currentUser = useTypedSelector(store => store.auth.currentUser);

  const navigate = useNavigate();
  const {id} = useParams()
  const isProfileMatch = useMatch('/app/user');

  const dispatch = useAppDispatch()

  const [dispatched, setDispatched] = useState(false);

  const isEditing = () => {
    return !!id;
  };

  const isProfile = () => {
    return !!isProfileMatch;
  };

  const doSubmit = (id: string, data: any) => {
    if (isEditing() || isProfile()) {
      dispatch(actions.doUpdate(id, data, isProfile()))
    } else {
      dispatch(actions.doCreate(data))
    }
  };

  useEffect(() => {
    if (isEditing()) {
      dispatch(actions.doFind(id || ''));
    } else {
      if (isProfile()) {
        // @ts-ignore
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserId = currentUser.user.id;
        dispatch(actions.doFind(currentUserId));
      } else {
        dispatch(actions.doNew())
      }
    }
    setDispatched(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, isProfileMatch]);

  return (
    <React.Fragment>
      {dispatched && (
        <CapacityconstraintsForm
          saveLoading={saveLoading}
          findLoading={findLoading}
          record={(isEditing() || isProfile()) ? record : {}}
          isEditing={isEditing()}
          onSubmit={doSubmit}
          onCancel={() => navigate('/admin/capacityconstraints')} modal={false}        />
        )}
    </React.Fragment>
  );
}

export default CapacityconstraintsFormPage;
