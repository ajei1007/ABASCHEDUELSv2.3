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
import TextAreaFormItem from 'components/FormItems/items/TextAreaFormItem';
import statuseventsFields from 'pages/CRUD/Statusevents/helpers/statuseventsFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget/Widget';
import EventsSelectItem from 'pages/CRUD/Events/helpers/EventsSelectItem';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import FormActions from 'pages/CRUD/components/FormActions';

type StatuseventsFormProps = {
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

const StatuseventsForm = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
}: StatuseventsFormProps) => {
  const iniValues = () => {
    return IniValues(statuseventsFields, record || {});
  };

  const formValidations = () => {
    return FormValidations(statuseventsFields, record || {});
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(statuseventsFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }

    return isEditing ? 'Edit Statusevents' : 'Add Statusevents';
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
            <EventsSelectItem
              name={'event'}
              schema={statuseventsFields}
              showCreate={!modal}
              form={form}
            />

            <DatePickerFormItem
              name={'startdatetime'}
              schema={statuseventsFields}
              showTimeInput
            />

            <UsersSelectItem
              name={'user'}
              schema={statuseventsFields}
              showCreate={!modal}
              form={form}
            />

            <RadioFormItem name={'status'} schema={statuseventsFields} />

            <TextAreaFormItem name={'note'} schema={statuseventsFields} />

            <TextAreaFormItem name={'noteadmin'} schema={statuseventsFields} />

            <SwitchFormItem name={'late'} schema={statuseventsFields} />

            <InputNumberFormItem
              name={'latetime'}
              schema={statuseventsFields}
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

export default StatuseventsForm;
