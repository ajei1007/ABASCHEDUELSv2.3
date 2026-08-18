import { Formik } from 'formik';
import type { FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
import InputFormItem from 'components/FormItems/items/InputFormItem';
import totaltypesFields from 'pages/CRUD/Totaltypes/helpers/totaltypesFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import Widget from 'components/Widget/Widget';
import FormActions from 'pages/CRUD/components/FormActions';
import totalTypesFormValidationSchema from '../helpers/totalTypesFormValidationSchema';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';

type TotaltypesFormProps = {
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

const TotaltypesForm = ({
    isEditing,
    isProfile,
    findLoading,
    saveLoading,
    record,
    onSubmit,
    onCancel,
  }: TotaltypesFormProps) => {
    const iniValues = () => {
      return IniValues(totaltypesFields, record || {});
  }

  const handleSubmit = (values: {[rest: string]: any}) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(totaltypesFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if(isProfile) {
      return 'Edit My Profile';
    }
    return isEditing ? 'Edit Totaltypes' : 'Add New Custom Total';
  };

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={totalTypesFormValidationSchema}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <InputFormItem name={'name'} schema={totaltypesFields} autoFocus />
            <UsersSelectItem
              name={'activities'}
              schema={{...totaltypesFields, type_type: 'Activity'}}
              mode="multiple"
              form={form}
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
}

export default TotaltypesForm;
