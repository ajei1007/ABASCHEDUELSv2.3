import { Formik } from 'formik';
import type { FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
// eslint-disable-next-line no-unused-vars
import InputFormItem from 'components/FormItems/items/InputFormItem';
import mobiletokensFields from 'pages/CRUD/Mobiletokens/helpers/mobiletokensFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget/Widget';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import FormActions from 'pages/CRUD/components/FormActions';

type MobiletokensFormProps = {
  isEditing: boolean;
  isProfile: boolean;
  findLoading: boolean;
  saveLoading: boolean;
  record: {
    [rest: string]: any;
  };
  onSubmit: Function;
  onCancel: Function;
  modal?: any;
  currentUser?: any;
};

const MobiletokensForm = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
}: MobiletokensFormProps) => {
  const iniValues = () => {
    return IniValues(mobiletokensFields, record || {});
  };

  const formValidations = () => {
    return FormValidations(mobiletokensFields, record || {});
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(mobiletokensFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }

    return isEditing ? 'Edit Mobiletokens' : 'Add Mobiletokens';
  };

  // @ts-ignore
  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={formValidations()}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <InputFormItem
              name={'token'}
              schema={mobiletokensFields}
              autoFocus
            />

            <UsersSelectItem
              name={'users'}
              schema={mobiletokensFields}
              showCreate={!modal}
              mode='multiple'
              form={form}
            />

            <FormActions
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                form.handleSubmit(e);
              }}
              onReset={form.handleReset}
              onCancel={() => onCancel()}
              saveLoading={saveLoading}
            />
          </form>
        )}
      </Formik>
    </Widget>
  );
};

export default MobiletokensForm;
