import { Formik } from 'formik';
import type { FormEvent } from 'react';
import Loader from 'components/Loader/Loader'
import InputFormItem from 'components/FormItems/items/InputFormItem';
import groupingsFields from 'pages/CRUD/Groupings/helpers/groupingsFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import Widget from 'components/Widget/Widget';
import RolesSelectItem from 'pages/CRUD/Roles/helpers/RolesSelectItem';
import { groupings_array } from 'constants/user_arrays';
import FormActions from 'pages/CRUD/components/FormActions';
import groupingsFormValidationSchema from '../helpers/groupingsFormValidationSchema'
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';

type GroupingsFormProps = {
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

const FORM_NAME = 'Grouping';

const GroupingsForm = ({
    isEditing,
    isProfile,
    findLoading,
    saveLoading,
    record,
    onSubmit,
    onCancel,
    modal,
  } : GroupingsFormProps) => {
    const iniValues = () => {
      return IniValues(groupingsFields, record || {});
  }

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(groupingsFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }
    return isEditing ? 'Edit Groupings' : 'Add Groupings';
  };
  console.log('record', record)
  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={groupingsFormValidationSchema}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            {Object.keys(groupings_array[FORM_NAME]).includes('name') && (
              <InputFormItem
                name={'name'}
                schema={groupingsFields}
                autoFocus
                required={groupings_array[FORM_NAME]['name']}
              />
            )}
            {/* {Object.keys(groupings_array[FORM_NAME]).includes('min') && (
              <InputNumberFormItem
                name={'min'}
                schema={groupingsFields}
                required={groupings_array[FORM_NAME]['min']}
              />
            )}
            {Object.keys(groupings_array[FORM_NAME]).includes('max') && (
              <InputNumberFormItem
                name={'max'}
                schema={groupingsFields}
                required={groupings_array[FORM_NAME]['max']}
              />
            )} */}
            {Object.keys(groupings_array[FORM_NAME]).includes('roles1') && (
              <RolesSelectItem
                name={'roles1'}
                schema={groupingsFields}
                showCreate={!modal}
                mode='multiple'
                form={form}
                required={groupings_array[FORM_NAME]['roles1']}
              />
            )}
            {/* {Object.keys(groupings_array[FORM_NAME]).includes('roles2') && (
              <RolesSelectItem
                name={'roles2'}
                schema={groupingsFields}
                showCreate={!modal}
                mode='multiple'
                form={form}
                required={groupings_array[FORM_NAME]['roles2']}
              />
            )} */}
            {Object.keys(groupings_array[FORM_NAME]).includes('required') && ( 
              <SwitchFormItem
                name={'required'}
                schema={groupingsFields}
              />
            )}
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
};

export default GroupingsForm;
