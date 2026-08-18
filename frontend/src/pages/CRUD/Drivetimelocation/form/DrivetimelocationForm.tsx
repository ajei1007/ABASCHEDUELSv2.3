import { Formik } from 'formik';
import React, { type FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
// eslint-disable-next-line no-unused-vars
import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
import drivetimelocationFields from 'pages/CRUD/Drivetimelocation/helpers/drivetimelocationFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget/Widget';

import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import FormActions from 'pages/CRUD/components/FormActions';

type DrivetimelocationFormProps = {
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

const DrivetimelocationForm = (props: DrivetimelocationFormProps) => {
  const {
    isEditing,
    isProfile,
    findLoading,
    saveLoading,
    record,
    onSubmit,
    onCancel,
    modal,
  } = props;

  const iniValues = () => {
    return IniValues(drivetimelocationFields, record || {});
  };

  const formValidations = () => {
    return FormValidations(drivetimelocationFields, record || {});
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(
      drivetimelocationFields,
      values || {},
    );
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }

    return isEditing ? 'Edit Drivetimelocation' : 'Add Drivetimelocation';
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
            <UsersSelectItem
              name={'location1'}
              schema={{
                ...drivetimelocationFields,
                type_type: 'Location',
              }}
              showCreate={!modal}
              form={form}
            />

            <UsersSelectItem
              name={'location2'}
              schema={{
                ...drivetimelocationFields,
                type_type: 'Location',
              }}
              showCreate={!modal}
              form={form}
            />

            <InputNumberFormItem
              name={'time'}
              schema={drivetimelocationFields}
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

export default DrivetimelocationForm;
