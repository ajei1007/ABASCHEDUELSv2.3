import { Formik } from 'formik';
import Loader from '../../../components/Loader/Loader';
import InputFormItem from '../../../components/FormItems/items/InputFormItem';
import Widget from '../../../components/Widget/Widget';
import CustomButton from 'components/Button';

const UsersForm = (props) => {
  const { onSubmit, isEditing, findLoading, saveLoading, record, onCancel } =
    props;

  const handleSubmit = (values) => {
    const { ...data } = values || {};
    onSubmit(data);
  };

  // eslint-disable-next-line no-unused-vars
  const title = () => {
    return 'Change Password';
  };

  const passwordSchema = {
    currentPassword: { type: 'string', label: 'Current Password' },
    newPassword: { type: 'string', label: 'New Password' },
    confirmNewPassword: { type: 'string', label: 'Confirm new Password' },
  };

  const iniValues = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };
  if (findLoading) {
    return <Loader />;
  }

  if (isEditing && !record) {
    return <Loader />;
  }

  return (
    <Widget className='widget-p-md'>
      <Formik onSubmit={handleSubmit} initialValues={iniValues}>
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <InputFormItem
              name={'currentPassword'}
              password
              schema={passwordSchema}
            />

            <InputFormItem
              name={'newPassword'}
              schema={passwordSchema}
              password
            />

            <InputFormItem
              name={'confirmNewPassword'}
              schema={passwordSchema}
              password
            />
            <div>
              <CustomButton disabled={saveLoading} onClick={form.handleSubmit}>
                {' '}
                Change Password
              </CustomButton>{' '}
              <CustomButton
                disabled={saveLoading}
                onClick={() => onCancel()}
                variant='outlined'
              >
                {' '}
                Cancel
              </CustomButton>
            </div>
          </form>
        )}
      </Formik>
    </Widget>
  );
};

export default UsersForm;
