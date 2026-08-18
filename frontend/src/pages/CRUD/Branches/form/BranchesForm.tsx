import { Formik } from 'formik';
import type { FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
import InputFormItem from 'components/FormItems/items/InputFormItem';
import branchesFields from 'pages/CRUD/Branches/helpers/branchesFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import Widget from 'components/Widget/Widget';
import { branches_array } from 'constants/user_arrays';
import BranchtypeSelectItem from 'pages/CRUD/Branchtype/helpers/BranchtypeSelectItem';
import BranchesSelectItem from 'pages/CRUD/Branches/helpers/BranchesSelectItem';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import branchesFormValidationSchema from 'pages/CRUD/Branches/helpers/branchesFormValidationSchema';
import FormActions from 'pages/CRUD/components/FormActions';
import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
import { getTimezoneObjectFromValue, getTimeZones } from 'utils/timezones';
import type { TimezoneType } from 'constants/timezonesArr';

type BranchesFormProps = {
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

const BranchesForm = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
}: BranchesFormProps) => {
  const iniValues = () => {
    const timezone = record?.timezone ?? null ? getTimezoneObjectFromValue(record.timezone) : null;
    return IniValues(branchesFields, {
      ...record,
      timezone
    });
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(branchesFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }
    return isEditing ? 'Edit Branches' : 'Add Branches';
  };

  const timezoneSearch = (_: any, val: any = '') => {
    return getTimeZones().filter((tz: TimezoneType) =>
      tz.label.toLowerCase().includes(val.toLowerCase()),
    );
  };

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={branchesFormValidationSchema()}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <InputFormItem
              name={'name'}
              schema={branchesFields}
              autoFocus
              required={branches_array['Branch']['name']}
            />
            <BranchtypeSelectItem
              name={'branchType'}
              schema={branchesFields}
              showCreate={!modal}
              form={form}
              required={branches_array['Branch']['branchType']}
            />
            <BranchesSelectItem
              name={'parent'}
              schema={branchesFields}
              showCreate={!modal}
              form={form}
              required={branches_array['Branch']['parent']}
            />
            <InputFormItem
              name={'replyToEmail'}
              schema={branchesFields}
              required={branches_array['Branch']['replyToEmail']}
            />
            <UsersSelectItem
              name={'user'}
              schema={branchesFields}
              showCreate={!modal}
              form={form}
            />
            <InputNumberFormItem name={'drivetime'} schema={branchesFields} />
            <UsersSelectItem
              name={'timezone'}
              schema={branchesFields}
              showCreate={!modal}
              form={form}
              fieldName='timezone'
              fieldLabel='Timezone'
              required={false}
              extraFetchFunction={timezoneSearch}
              fieldOptionData={'timezone'}
            />
            <SwitchFormItem name={'inactive'} schema={branchesFields} />
            <div style={{ margin: '1rem 0' }}></div>
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

export default BranchesForm;
