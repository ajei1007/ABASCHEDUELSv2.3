import { Formik } from 'formik';
import type { FC, FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
import { useParams } from 'react-router-dom';
import availabilitiesFields from 'pages/CRUD/Availabilities/helpers/availabilitiesFields';
import IniValues from 'components/FormItems/iniValues';
import Widget from 'components/Widget/Widget';
import AvailabilityForm from 'pages/CRUD/components/Forms/Availabilities';
import availabilityValidationSchema from 'pages/CRUD/components/Forms/Availabilities/helpers/availabilityValidationSchema';
import formatAvailabilities from '../helpers/formatAvailabilities';
import { getTimezoneObjectFromValue } from 'utils/timezones';
import FormActions from 'pages/CRUD/components/FormActions';
import moment from 'moment';
import convertTZ from 'utils/convertTZ';
import { useSelector } from 'react-redux';
import {
  intervalOptions,
  frequencyOptions,
  weekNumberOptions,
} from 'constants/recurrenceOptions';

type Params = {
  resources: any;
};

type AvailabilitiesFormProps = {
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

const AvailabilitiesForm: FC<AvailabilitiesFormProps> = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
}) => {
  let { resources } = useParams<Params>();
  const defaultTimezone = useSelector(
    (state: any) => state?.settings?.settingValues.timezone,
  );
  const iniValues = () => {
    // TODO make it reusable
    const timezone = getTimezoneObjectFromValue(
      record?.timezone ?? defaultTimezone,
    );
    const forever = record.startRange === '2000-01-01';
    const startRange = record?.startRange
      ? forever
        ? moment().format('YYYY-MM-DD')
        : record?.startRange
      : moment().format('YYYY-MM-DD');
    const endRange = record?.endRange
      ? forever
        ? moment().format('YYYY-MM-DD')
        : moment(record.endRange).subtract(1, 'day').format('YYYY-MM-DD')
      : moment().add('5', 'years').format('YYYY-MM-DD');

    const fmt = (d: any) => moment.tz(d, timezone?.value).format('HH:mm');

    const allDay =
      record?.allDay ??
      (record.startTime &&
        record.endTime &&
        fmt(record.startTime) === '05:00' &&
        fmt(record.endTime) === '22:00');

    const everyDay =
      record?.everyDay ??
      (Array.isArray(record?.days) && record.days.length === 7);

    return IniValues(availabilitiesFields, {
      ...record,
      startTime: record.startTime
        ? convertTZ(record.startTime, timezone?.value)
        : null,
      endTime: record.endTime
        ? convertTZ(record.endTime, timezone?.value)
        : null,
      startRange,
      endRange,
      interval: record?.interval
        ? intervalOptions.find((e) => e.value === String(record.interval))
        : intervalOptions.find((e) => e.value === '1'),
      frequency: record?.frequency
        ? frequencyOptions.find((e) => e.value === record.frequency)
        : frequencyOptions.find((e) => e.value === 'Weekly'),
      bysetpos: record?.bysetpos
        ? weekNumberOptions.find((e) => e.value === record.bysetpos)
        : weekNumberOptions.find((e) => e.value === '1'),
      timezone,
      forever,
      allDay,
      everyDay,
    });
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = formatAvailabilities(values);

    onSubmit(id, data);
  };
  const title = () => {
    if (isProfile) return 'Edit My Profile';
    return isEditing
      ? `Edit ${resources} Availability`
      : `Add ${resources} Availability`;
  };

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={availabilityValidationSchema(true, resources)}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <AvailabilityForm
              form={form}
              modal={modal}
              resourceName={resources}
              hasUserField
            />
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

export default AvailabilitiesForm;
