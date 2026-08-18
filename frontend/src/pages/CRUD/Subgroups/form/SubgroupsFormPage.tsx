import React, { useState, useEffect } from 'react';
import SubgroupsForm from 'pages/CRUD/Subgroups/form/SubgroupsForm';
import actions from 'store/actions/subgroups/subgroupsFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { useParams, useMatch, useNavigate } from 'react-router';

const SubgroupsFormPage = () => {
  const record = useTypedSelector((store) => store.subgroups.form.record);
  const findLoading = useTypedSelector(
    (store) => store.subgroups.form.findLoading,
  );
  const saveLoading = useTypedSelector(
    (store) => store.subgroups.form.saveLoading,
  );
  const currentUser = useTypedSelector((store) => store.auth.currentUser);

  type Params = {
    groups: any;
  };
  let { groups } = useParams<Params>();

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
      dispatch(actions.doUpdate(id, data, isProfile(), groups));
    } else {
      dispatch(actions.doCreate(data, groups));
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
        <SubgroupsForm
          saveLoading={saveLoading}
          findLoading={findLoading}
          currentUser={currentUser}
          record={isEditing() || isProfile() ? record : {}}
          isEditing={isEditing()}
          isProfile={isProfile()}
          onSubmit={doSubmit}
          onCancel={() => navigate(`/admin/subgroups/groupings/${groups}`)}
          groupName={groups}
        />
      )}
    </React.Fragment>
  );
};

export default SubgroupsFormPage;
