import { Formik } from 'formik';
import Loader from 'components/Loader/Loader';
import InputFormItem from 'components/FormItems/items/InputFormItem';

import branchtypeFields from 'pages/CRUD/Branchtype/helpers/branchtypeFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget/Widget';

import BranchtypeSelectItem from 'pages/CRUD/Branchtype/helpers/BranchtypeSelectItem';
import FormActions from 'pages/CRUD/components/FormActions';
import type { FormEvent } from 'react';
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
import { Grid2 as Grid } from '@mui/material';

type BranchtypeFormProps = {
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

const BranchtypeForm = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
}: BranchtypeFormProps) => {
  const iniValues = () => {
    return IniValues(branchtypeFields, record || {});
  };

  const formValidations = () => {
    return FormValidations(branchtypeFields, record || {});
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(branchtypeFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }

    return isEditing ? 'Edit Branchtype' : 'Add Branchtype';
  };

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  // @ts-ignore
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={formValidations()}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <Grid container spacing={2} columns={{ sm: 12, md: 12, xs: 12 }}>
              <Grid
                size={{
                  sm: 12,
                  md: 12,
                  xs: 12
                }}>
                <InputFormItem
                  name={'name'}
                  schema={branchtypeFields}
                  autoFocus
                />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 12,
                  xs: 12
                }}>
                <BranchtypeSelectItem
                  name={'parent'}
                  schema={branchtypeFields}
                  showCreate={!modal}
                  form={form}
                />
              </Grid>
              <Grid
                size={{
                  sm: 1,
                  md: 1,
                  xs: 6
                }}>
                <SwitchFormItem name={'bol'} schema={branchtypeFields} />
              </Grid>
              <Grid
                size={{
                  sm: 1,
                  md: 1,
                  xs: 6
                }}>
                <SwitchFormItem name={'physical'} schema={branchtypeFields} />
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  md: 12,
                  xs: 12
                }}>
              <FormActions
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  form.handleSubmit(e);
                }}
                onReset={form.handleReset}
                onCancel={() => onCancel()}
                saveLoading={saveLoading}
              />
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </Widget>
  );
};

export default BranchtypeForm;
