import { Formik } from 'formik';
import type { FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
import InputFormItem from 'components/FormItems/items/InputFormItem';
import companiesFields from 'pages/CRUD/Companies/helpers/companiesFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import Widget from 'components/Widget/Widget';
import companiesFormValidationSchema from 'pages/CRUD/Companies/helpers/companiesFormValidationSchema';
import FormActions from 'pages/CRUD/components/FormActions';
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';

type CompaniesFormProps = {
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

const CompaniesForm = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
}: CompaniesFormProps) => {
  const iniValues = () => {
    return IniValues(companiesFields, {
      ...record,
    });
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(companiesFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }
    return isEditing ? 'Edit Companies' : 'Add Companies';
  };

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={companiesFormValidationSchema()}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <InputFormItem
              name={'membership'}
              schema={companiesFields}
            />
            <SwitchFormItem
              name={'disabled'}
              schema={companiesFields}
              isClearable={false}
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

export default CompaniesForm;
