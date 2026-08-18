import React, { useState, useEffect } from 'react';
import BranchesForm from 'pages/CRUD/Branches/form/BranchesForm';
import actions from 'store/actions/branches/branchesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { useParams, useMatch, useNavigate } from 'react-router';

const BranchesFormPage = () => {
  const record = useTypedSelector((store) => store.branches.form.record);
  const findLoading = useTypedSelector(
    (store) => store.branches.form.findLoading,
  );
  const saveLoading = useTypedSelector(
    (store) => store.branches.form.saveLoading,
  );
  const currentUser = useTypedSelector((store) => store.auth.currentUser);

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

  const doSubmit = (id: string, data: any) => {
    if (isEditing() || isProfile()) {
      dispatch(actions.doUpdate(id, data, isProfile()));
    } else {
      dispatch(actions.doCreate(data));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, isProfileMatch]);

  return (
    <React.Fragment>
      {dispatched && (
        <BranchesForm
          saveLoading={saveLoading}
          findLoading={findLoading}
          currentUser={currentUser}
          record={isEditing() || isProfile() ? record : {}}
          isEditing={isEditing()}
          isProfile={isProfile()}
          onSubmit={doSubmit}
          onCancel={() => navigate('/admin/branches')}
        />
      )}
    </React.Fragment>
  );
};

export default BranchesFormPage;
