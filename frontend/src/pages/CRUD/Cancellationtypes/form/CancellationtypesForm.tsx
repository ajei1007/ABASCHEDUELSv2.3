import { Formik } from 'formik';
import Loader from 'components/Loader/Loader';
import InputFormItem from 'components/FormItems/items/InputFormItem';

import cancellationtypesFields from 'pages/CRUD/Cancellationtypes/helpers/cancellationtypesFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget/Widget';
import FormActions from 'pages/CRUD/components/FormActions';
import type { FormEvent } from 'react';

type CancellationtypesFormProps = {
  isEditing: boolean;
  isProfile: boolean;
  findLoading: boolean;
  saveLoading: boolean;
  record: {
    [rest: string]: any
  };
  onSubmit: Function;
  onCancel: Function;
  modal?: any;
  currentUser?: any;
}

const CancellationtypesForm = (props: CancellationtypesFormProps) => {

  const {
    isEditing,
    isProfile,
    findLoading,
    saveLoading,
    record,
    onSubmit,
    onCancel,
    // modal
  } = props;

  const iniValues = () => {
    return IniValues(cancellationtypesFields, record || {});
  }

  const formValidations = () => {
    return FormValidations(cancellationtypesFields, record || {});
  }

  const handleSubmit = (values: {[rest: string]: any}) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(cancellationtypesFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if(isProfile) {
      return 'Edit My Profile';
    }

    return isEditing
      ? 'Edit Cancellationtypes'
      : 'Add Cancellationtypes';
  };

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
              schema={cancellationtypesFields}
              autoFocus
            />

            <FormActions
              onSubmit={(e: FormEvent<HTMLFormElement>) => form.handleSubmit(e)}
              onReset={form.handleReset}
              onCancel={() => onCancel()}
              saveLoading={saveLoading}
            />
          </form>
        )}
      </Formik>
    </Widget>
  );

  if (findLoading) {
    return <Loader />;
  }

  if (isEditing && !record) {
    return <Loader />;
  }

  return renderForm();
}

export default CancellationtypesForm;
