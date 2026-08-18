import { Formik } from 'formik';
import type { FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
// eslint-disable-next-line no-unused-vars
import InputFormItem from 'components/FormItems/items/InputFormItem';
import timeofftypesFields from 'pages/CRUD/Timeofftypes/helpers/timeofftypesFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget/Widget';
import FormActions from 'pages/CRUD/components/FormActions';

type TimeofftypesFormProps = {
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

const TimeofftypesForm = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
}: TimeofftypesFormProps) => {
  const iniValues = () => {
    return IniValues(timeofftypesFields, record || {});
  };

  const formValidations = () => {
    return FormValidations(timeofftypesFields, record || {});
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(timeofftypesFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }

    return isEditing ? 'Edit Timeofftypes' : 'Add Timeofftypes';
  };

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  // @ts-ignore
  const renderForm = () => (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={formValidations()}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <InputFormItem
              name={'name'}
              schema={timeofftypesFields}
              autoFocus
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

  return renderForm();
};

export default TimeofftypesForm;
