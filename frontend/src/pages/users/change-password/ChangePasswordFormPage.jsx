import React from 'react';
import { useNavigate } from 'react-router';
import ChangePasswordForm from "./ChangePasswordForm";
import actions from "../../../store/actions/passwordActions";
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';

const ChangePasswordFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const findLoading = useSelector((store) => store.users.form.findLoading);
  const saveLoading = useSelector((store) => store.users.form.saveLoading);

  const doSubmit = (data) => {
    dispatch(actions.doChangePassword(data));
  }

  return (
    <React.Fragment>
      <ChangePasswordForm
        saveLoading={saveLoading}
        findLoading={findLoading}
        onSubmit={doSubmit}
        onCancel={() => navigate('/template/dashboard')}
      />
    </React.Fragment>
  );
}

export default ChangePasswordFormPage;
