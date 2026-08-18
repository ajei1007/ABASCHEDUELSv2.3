import Widget from 'components/Widget/Widget';
import { Formik } from 'formik';
import React, { type FormEvent } from 'react';
import IniValues from 'components/FormItems/iniValues';
import distanceMatrixFields from 'pages/CRUD/DistanceMatrix/helpers/distanceMatrixFields';
import PreparedValues from 'components/FormItems/preparedValues';
import Loader from 'components/Loader/Loader';
import FormActions from 'pages/CRUD/components/FormActions';
import { Grid2 as Grid } from '@mui/material';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import distanceMatrixFormValidationSchema from '../helpers/distanceMatrixFormValidationSchema';
import AddressAutcompleteInput from 'pages/CRUD/Users/form/FormGroups/AddressAutcompleteInput';
import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';

type DistanceMatrixFormProps = {
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

const DistanceMatrixForm = (props: DistanceMatrixFormProps) => {
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
    return IniValues(distanceMatrixFields, record || {});
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(distanceMatrixFields, values || {});

    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }
    return isEditing ? 'Edit Distance Matrix' : 'Add Distance Matix';
  };
  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={distanceMatrixFormValidationSchema()}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
              <Grid
                size={{
                  sm: 12,
                  md: 6
                }}>
                <UsersSelectItem
                  name={'user1'}
                  schema={distanceMatrixFields}
                  showCreate={!modal}
                  form={form}
                  required={true}
                />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 6
                }}>
                <UsersSelectItem
                  name={'user2'}
                  schema={distanceMatrixFields}
                  showCreate={!modal}
                  form={form}
                  required={true}
                />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 6
                }}>
                <AddressAutcompleteInput
                  form={form}
                  name='address1'
                  label='Address 1'
                />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 6
                }}>
                <AddressAutcompleteInput
                  form={form}
                  name='address2'
                  label='Address 2'
                />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 3
                }}>
                <InputNumberFormItem
                  name={'distance'}
                  schema={distanceMatrixFields}
                />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 3
                }}>
                <InputNumberFormItem
                  name={'duration'}
                  schema={distanceMatrixFields}
                />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 3
                }}>
                <InputNumberFormItem
                  name={'duration_early'}
                  schema={distanceMatrixFields}
                />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 3
                }}>
                <InputNumberFormItem
                  name={'duration_late'}
                  schema={distanceMatrixFields}
                />
              </Grid>
            </Grid>

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

export default DistanceMatrixForm;
