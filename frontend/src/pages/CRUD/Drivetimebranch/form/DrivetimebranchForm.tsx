import { Formik } from 'formik';
import type { FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
import drivetimebranchFields from 'pages/CRUD/Drivetimebranch/helpers/drivetimebranchFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget/Widget';

import BranchesSelectItem from 'pages/CRUD/Branches/helpers/BranchesSelectItem';
import FormActions from 'pages/CRUD/components/FormActions';

type DrivetimebranchFormProps = {
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

const DrivetimebranchForm = (props: DrivetimebranchFormProps) => {

  const {
    isEditing,
    isProfile,
    findLoading,
    saveLoading,
    record,
    onSubmit,
    onCancel,
    modal
  } = props;

  const iniValues = () => {
    return IniValues(drivetimebranchFields, record || {});
  }
  console.log('iniValues', iniValues())

  const formValidations = () => {
    return FormValidations(drivetimebranchFields, record || {});
  }

  const handleSubmit = (values: {[rest: string]: any}) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(drivetimebranchFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if(isProfile) {
      return 'Edit My Profile';
    }

    return isEditing
      ? 'Edit Drivetimebranch'
      : 'Add Drivetimebranch';
  };

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;

  // @ts-ignore
  const renderForm = () => (
    <Widget className="widget-p-md" title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        enableReinitialize
        validationSchema={formValidations()}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>

            <BranchesSelectItem
              name={'branch1'}
              schema={drivetimebranchFields}
              showCreate={!modal}
              form={form}
            />

            <BranchesSelectItem
              name={'branch2'}
              schema={drivetimebranchFields}
              showCreate={!modal}
              form={form}
            />

            <InputNumberFormItem
              name={'time'}
              schema={drivetimebranchFields}
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
        )
        }
      </Formik>
    </Widget>
  );

  return renderForm();
}

export default DrivetimebranchForm;
