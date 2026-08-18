import React, { useState, useEffect } from 'react';
import RolesForm from 'pages/CRUD/Roles/form/RolesForm';
import actions from 'store/actions/roles/rolesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams, useMatch, useNavigate } from 'react-router';

const RolesFormPage = () => {

  const record = useTypedSelector(store => store.roles.form.record);
  const findLoading = useTypedSelector(store => store.roles.form.findLoading);
  const saveLoading = useTypedSelector(store => store.roles.form.saveLoading);
  const currentUser = useTypedSelector(store => store.auth.currentUser);

  type Params = {
    resources: any;
  };
  let { resources } = useParams<Params>();


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
      dispatch(actions.doUpdate(id, data, isProfile(),resources));
    } else {
      dispatch(actions.doCreate(data,resources));
    }
  };

  useEffect(() => {
    if (isEditing()) {
      dispatch(actions.doFind(id || '', resources));
    } else {
      if (isProfile()) {
        // @ts-ignore
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserId = currentUser.user.id;
        dispatch(actions.doFind(currentUserId, resources));
      } else {
        dispatch(actions.doNew())
      }
    }
    setDispatched(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, isProfileMatch, resources]);

  return (
    <React.Fragment>
      {dispatched && (
        <RolesForm
          saveLoading={saveLoading}
          findLoading={findLoading}
          currentUser={currentUser}
          record={isEditing() || isProfile() ? record : {}}
          isEditing={isEditing()}
          isProfile={isProfile()}
          onSubmit={doSubmit}
          onCancel={() => navigate(`/admin/roles/resources/${resources}`)}
          resources={resources}
        />
        )}
    </React.Fragment>
  );
}

export default RolesFormPage;
