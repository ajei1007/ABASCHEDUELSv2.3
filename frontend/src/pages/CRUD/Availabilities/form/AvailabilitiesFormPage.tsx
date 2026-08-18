/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import AvailabilitiesForm from 'pages/CRUD/Availabilities/form/AvailabilitiesForm';
import actions from 'store/actions/availabilities/availabilitiesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { useParams, useMatch, useNavigate } from 'react-router';

type Params = {
  resources: any;
};

const AvailabilitiesFormPage = () => {
  const record = useTypedSelector((store) => store.availabilities.form.record);
  const findLoading = useTypedSelector(
    (store) => store.availabilities.form.findLoading,
  );
  const saveLoading = useTypedSelector(
    (store) => store.availabilities.form.saveLoading,
  );
  const currentUser = useTypedSelector((store) => store.auth.currentUser);

  let { resources } = useParams<Params>();

  const navigate = useNavigate();
  const { id } = useParams();
  const isProfileMatch = useMatch('/app/user');
  const dispatch = useAppDispatch();

  const [dispatched, setDispatched] = useState(false);

  const isEditing = () => {
    return !!id;
  };

  const isProfile = () => {
    return !!isProfileMatch;
  };

  const doSubmit = (id: string | undefined, data: any) => {
    if (isEditing() || isProfile()) {
      dispatch(actions.doUpdate(id || '', data, isProfile(), resources));
    } else {
      dispatch(actions.doCreate(data, resources));
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
        dispatch(actions.doNew());
      }
    }
    setDispatched(true);
  }, [dispatch, id, isProfileMatch]);

  return (
    <React.Fragment>
      {dispatched && (
        <AvailabilitiesForm
          saveLoading={saveLoading}
          findLoading={findLoading}
          currentUser={currentUser}
          record={isEditing() || isProfile() ? record : {}}
          isEditing={isEditing()}
          isProfile={isProfile()}
          onSubmit={doSubmit}
          onCancel={() =>
            navigate(`/admin/availabilities/resources/${resources}`)
          }
        />
      )}
    </React.Fragment>
  );
};

export default AvailabilitiesFormPage;
