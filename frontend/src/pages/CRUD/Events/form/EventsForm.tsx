import { Formik } from 'formik';
import React from 'react';
import Loader from 'components/Loader/Loader';

// eslint-disable-next-line no-unused-vars
import InputFormItem from 'components/FormItems/items/InputFormItem';
// eslint-disable-next-line no-unused-vars
import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
// eslint-disable-next-line no-unused-vars
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
// eslint-disable-next-line no-unused-vars
import RadioFormItem from 'components/FormItems/items/RadioFormItem';
// eslint-disable-next-line no-unused-vars
import SelectFormItem from 'components/FormItems/items/SelectFormItem';
// eslint-disable-next-line no-unused-vars
import DatePickerFormItem from 'components/FormItems/items/DatePickerFormItem';

import eventsFields from 'pages/CRUD/Events/helpers/eventsFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget/Widget';

import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import DaysofweekSelectItem from 'components/DaysofweekSelectItem/DaysofweekSelectItem';

type EventsFormProps = {
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

const EventsForm = (props: EventsFormProps) => {
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
    return IniValues(eventsFields, record || {});
  };

  const formValidations = () => {
    return FormValidations(eventsFields, record || {});
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(eventsFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }

    return isEditing ? 'Edit Events' : 'Add Events';
  };

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
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
            ></button>
            <UsersSelectItem
              name={'users'}
              schema={eventsFields}
              showCreate={!modal}
              mode='multiple'
              form={form}
            />

            <DatePickerFormItem
              name={'start'}
              schema={eventsFields}
              showTimeInput
            />

            <DatePickerFormItem
              name={'end'}
              schema={eventsFields}
              showTimeInput
            />

            <InputFormItem name={'address'} schema={eventsFields} />

            {/* <InputFormItem
              name={'longitude'}
              schema={eventsFields}

            />

            <InputFormItem
              name={'latitude'}
              schema={eventsFields}

            /> */}

            {/* <CancellationsSelectItem
              name={'cancellations'}
              schema={eventsFields}
              showCreate={!modal}
              mode="multiple"
              form={form}
            /> */}

            {/* <ExclusionsSelectItem
              name={'exclusions'}
              schema={eventsFields}
              showCreate={!modal}
              mode="multiple"
              form={form}
            /> */}

            <DaysofweekSelectItem
              name={'daysOfWeek'}
              schema={eventsFields}
              showCreate={!modal}
              mode='multiple'
              form={form}
            />

            <DatePickerFormItem name={'startRecur'} schema={eventsFields} />

            <DatePickerFormItem name={'endRecur'} schema={eventsFields} />

            <RadioFormItem name={'frequency'} schema={eventsFields} />

            <InputNumberFormItem name={'interval'} schema={eventsFields} />

            {/* <InputFormItem
              name={'background'}
              schema={eventsFields}

            />

            <InputFormItem
              name={'border'}
              schema={eventsFields}

            /> */}

            <InputFormItem name={'notes'} schema={eventsFields} />

            {/* <SwitchFormItem
              name={'secondary'}
              schema={eventsFields}
            />

            <EventsSelectItem
              name={'eventConnect'}
              schema={eventsFields}
              showCreate={!modal}
              form={form}
            /> */}

            {/* <SwitchFormItem
              name={'allDay'}
              schema={eventsFields}
            /> */}

            <UsersSelectItem
              name={'usersVirtual'}
              schema={eventsFields}
              showCreate={!modal}
              mode='multiple'
              form={form}
            />

            <SwitchFormItem name={'visible'} schema={eventsFields} />

            <UsersSelectItem
              name={'activity0'}
              schema={eventsFields}
              showCreate={!modal}
              form={form}
            />

            <UsersSelectItem
              name={'location0'}
              schema={eventsFields}
              showCreate={!modal}
              form={form}
            />

            <SwitchFormItem name={'M'} schema={eventsFields} />

            <SwitchFormItem name={'T'} schema={eventsFields} />

            <SwitchFormItem name={'W'} schema={eventsFields} />

            <SwitchFormItem name={'R'} schema={eventsFields} />

            <SwitchFormItem name={'F'} schema={eventsFields} />

            <SwitchFormItem name={'S'} schema={eventsFields} />

            <SwitchFormItem name={'U'} schema={eventsFields} />

            <SelectFormItem name={'bysetpos'} schema={eventsFields} />

            <div className='form-buttons'>
              <button
                className='btn btn-primary'
                disabled={saveLoading}
                type='button'
                // @ts-ignore
                onClick={(e: React.FormEvent<HTMLFormElement>) =>
                  form.handleSubmit(e)
                }
              >
                Save
              </button>{' '}
              <button
                className='btn btn-light'
                type='button'
                disabled={saveLoading}
                onClick={form.handleReset}
              >
                Reset
              </button>{' '}
              <button
                className='btn btn-light'
                type='button'
                disabled={saveLoading}
                onClick={() => onCancel()}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Formik>
    </Widget>
  );

  if (findLoading) {
    return <Loader />;
  }

  if (isEditing && !record) {
    return <Loader />;
  }

  return renderForm();
};

export default EventsForm;
