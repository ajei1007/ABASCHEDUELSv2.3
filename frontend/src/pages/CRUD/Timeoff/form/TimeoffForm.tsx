import { Formik } from 'formik';
import type { FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
// eslint-disable-next-line no-unused-vars
import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
// eslint-disable-next-line no-unused-vars
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
// eslint-disable-next-line no-unused-vars
import RadioFormItem from 'components/FormItems/items/RadioFormItem';
// eslint-disable-next-line no-unused-vars
import DatePickerFormItem from 'components/FormItems/items/DatePickerFormItem';
// eslint-disable-next-line no-unused-vars
import TextAreaFormItem from 'components/FormItems/items/TextAreaFormItem';
// eslint-disable-next-line no-unused-vars
import timeoffFields from 'pages/CRUD/Timeoff/helpers/timeoffFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget/Widget';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import TimeofftypesSelectItem from 'pages/CRUD/Timeofftypes/helpers/TimeofftypesSelectItem';
import FormActions from 'pages/CRUD/components/FormActions';

type TimeoffFormProps = {
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

const TimeoffForm = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
}: TimeoffFormProps) => {
  const iniValues = () => {
    return IniValues(timeoffFields, record || {});
  };

  const formValidations = () => {
    return FormValidations(timeoffFields, record || {});
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(timeoffFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }

    return isEditing ? 'Edit Timeoff' : 'Add Timeoff';
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
            <UsersSelectItem
              name={'user'}
              schema={timeoffFields}
              showCreate={!modal}
              form={form}
            />

            <RadioFormItem name={'reason'} schema={timeoffFields} />

            <TextAreaFormItem name={'notes'} schema={timeoffFields} />

            <SwitchFormItem name={'approved'} schema={timeoffFields} />

            <InputNumberFormItem name={'duration'} schema={timeoffFields} />

            <DatePickerFormItem
              name={'datetimestart'}
              schema={timeoffFields}
              showTimeInput
            />

            <TimeofftypesSelectItem
              name={'reasontype'}
              schema={timeoffFields}
              showCreate={!modal}
              form={form}
            />

            <RadioFormItem name={'paid'} schema={timeoffFields} />

            <DatePickerFormItem
              name={'datetimeend'}
              schema={timeoffFields}
              showTimeInput
            />

            <RadioFormItem name={'status'} schema={timeoffFields} />

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

export default TimeoffForm;
