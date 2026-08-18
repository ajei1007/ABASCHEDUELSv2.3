/* eslint-disable react-hooks/exhaustive-deps */
import { Grid2 as Grid, Stack } from '@mui/material';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import DatePickerFormItem from 'components/FormItems/items/DatePickerFormItem';
import { Formik } from 'formik';
import moment from 'moment';
import { timeOffreasons } from 'pages/calendar/constants/reasons';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import momentTimezone from 'moment-timezone';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useDispatch } from 'react-redux';
import {
  createRequest,
  getAvailabilityRequests,
  getRequestById,
  getTimeOffRequests,
  updateRequest,
} from 'store/actions/requestsActions';
import _ from 'lodash';
import FormActions from 'pages/CRUD/components/FormActions';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import { weekdayOptionsForSelect } from 'pages/calendar/constants';
import Loader from 'components/Loader/Loader';
import axios from 'axios';

const AUTOCOMPLETE_SERVER_FETCH_SIZE = 300;

const timeoffFormFields = {
  id: { type: 'id', label: 'ID' },
  startTime: { type: 'datetime', label: 'Start Time' },
  endTime: { type: 'datetime', label: 'End Time' },
  days: { type: 'relation_many', label: 'Days' },
  startRange: { type: 'date', label: 'Start Range' },
  endRange: { type: 'date', label: 'End Range' },
  notes: { type: 'string', label: 'Notes' },
  reason: { type: 'relation_one', label: 'Reason' },
  location2: {
    type: 'relation_many',
    type_type: 'Location',
    label: 'Location',
    options: [{ value: 'value', label: 'value' }],
  },
};

const timeOffReasonOptions = timeOffreasons.map((reason) => ({
  value: reason.id,
  label: reason.label,
}));

const morningTime = moment().set({
  hour: 8,
  minute: 0,
  second: 0,
  millisecond: 0,
});

const eveningTime = moment().set({
  hour: 16,
  minute: 0,
  second: 0,
  millisecond: 0,
});

const iniStartRange = morningTime.toDate();
const iniEndRange = eveningTime.toDate();

const shouldBeSelectedDays = (weekday: number) => {
  return weekdayOptionsForSelect.find((opt) => opt.pos === weekday) ?? null;
};

const formValidations = (isTimeoff: boolean) => {
  const yupShape: any = {
    startTime: Yup.date().required('Start time is required'),
    endTime: Yup.date()
      .required('End time is required')
      .test(
        'is-after-or-equal-start',
        'End time must be after start time',
        function (value) {
          const { startTime } = this.parent;
          return moment(value).isSameOrAfter(moment(startTime));
        },
      ),
    days: Yup.array()
      .nullable()
      .min(1, 'Select at least one weekday')
      .required('Select at least one weekday'),
    startRange: Yup.date().required('Start range is required'),
    endRange: Yup.date()
      .required('End range is required')
      .test(
        'is-after-or-equal-startRange',
        'End range must be after start range',
        function (value) {
          const { startRange } = this.parent;
          return moment(value).isSameOrAfter(moment(startRange));
        },
      ),
    notes: Yup.string(),
  };
  let yup = Yup.object().nullable();
  if (!isTimeoff) {
    yup = yup.required('Location is required');
  }
  yupShape.location2 = yup;

  return Yup.object().shape(yupShape);
};

const RequestsFormModalContent = ({
  isEdit,
  openFormModal,
  setOpenFormModal,
  requestTab,
  selectedRequest,
  record,
  setRecord,
}: {
  isEdit: boolean;
  openFormModal: boolean;
  setOpenFormModal: React.Dispatch<React.SetStateAction<boolean>>;
  requestTab: number;
  selectedRequest: string | null;
  record: any;
  setRecord: (record: any) => void;
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const isTimeoff = requestTab === 0;
  //
  const [loading, setLoading] = useState<boolean>(false);
  const [locations, setLocations] = useState<any[]>([]);
  const toggleFormModal = () => {
    setOpenFormModal((prev) => !prev);
  };

  useEffect(() => {
    if (selectedRequest) {
      (async () => {
        const data = await getRequestById(selectedRequest);
        let reason: any = {};
        let location2 = null;

        if (data.reason) {
          reason = timeOffReasonOptions.find(
            (r) => r.value === data.reason.toLowerCase(),
          );
        } else {
          reason = timeOffReasonOptions[0];
        }

        if (data.location2?.[0]) {
          location2 = {
            id: data?.location2[0]?.id,
            value: data?.location2[0]?.id,
            label: data?.location2[0]?.firstName,
          };
        }

        let days = [];

        if (data?.days?.length > 0) {
          days = data.days.map((d: any) => {
            const findDay = weekdayOptionsForSelect.find(
              (w) => w.value === d.id,
            );
            return findDay;
          });
        }

        setRecord({
          reason,
          startTime: moment(data.startTime).toDate(),
          endTime: moment(data.endTime).toDate(),
          startRange: moment(data.startRange).toDate(),
          endRange: moment(data.endRange).toDate(),
          days,
          notes: data.notes ?? '',
          location2,
        });
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest]);

  useEffect(() => {
    if (!isTimeoff && openFormModal) init();
  }, [isTimeoff, openFormModal]);

  const init = async () => {
    setLoading(true);
    try {
      await fetchLocations();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const fetchLocations = async () => {
    // const params = { limit: AUTOCOMPLETE_SERVER_FETCH_SIZE };
    const response = await axios.get(`/users/autocomplete/Location`, {
      // params,
    });
    setLocations(response.data);
  };
  const searchLocation = (_: any, val: string) => {
    if (locations.length) {
      return locations.filter((l: any) =>
        val ? l.label.toLowerCase().includes(val.toLowerCase()) : l,
      );
    }
    return [];
  };

  const iniValues = useMemo(() => {
    if (record) return record;

    return {
      reason: timeOffReasonOptions.length > 0 ? timeOffReasonOptions[0] : {},
      startTime: morningTime.toDate(),
      endTime: eveningTime.toDate(),
      startRange: iniStartRange,
      endRange: iniEndRange,
      days: [shouldBeSelectedDays(morningTime.isoWeekday())],
      notes: '',
      location2: null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, timeOffReasonOptions]);

  const handleSubmit = async (values: any) => {
    setLocalLoading(true);
    const updatedObj = {
      ...values,
      startRange: momentTimezone(values.startRange).format('YYYY-MM-DD'),
      endRange: momentTimezone(values.endRange).format('YYYY-MM-DD'),
      reason: isTimeoff ? values?.reason?.value || null : null,
      timeoff: isTimeoff,
      available: !isTimeoff,
      requestedAt: momentTimezone().format(),
      statusType: 'Add',
      status: 'Pending',
      user: currentUser.id,
      location2: values.location2 ? [values.location2.id] : [],
      days: values?.days?.map((day: any) => day.value),
    };
    try {
      if (isEdit) {
        await dispatch(
          updateRequest({
            ...updatedObj,
            statusType: 'Edit',
            id: selectedRequest,
          }),
        );
      } else {
        await dispatch(createRequest(updatedObj));
      }
      toggleFormModal();

      if (isTimeoff) {
        await dispatch(getTimeOffRequests());
      } else {
        await dispatch(getAvailabilityRequests());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLocalLoading(false);
    }
  };

  return (isEdit && !record) || loading ? (
    <Loader />
  ) : (
    <Formik
      onSubmit={handleSubmit}
      initialValues={iniValues}
      validationSchema={formValidations(isTimeoff)}
      enableReinitialize
    >
      {(form) => (
        <form onSubmit={form.handleSubmit}>
          <Grid container spacing={2}>
            {isTimeoff && (
              <Grid
                marginBottom={2}
                size={{
                  sm: 12,
                  md: 6,
                }}
              >
                <label>Reason</label>
                <CustomSelect
                  isMulti={false}
                  options={timeOffReasonOptions}
                  value={form.values.reason}
                  onChange={(val: any) => form.setFieldValue('reason', val)}
                  name={'reason'}
                  isInvalid={!!form.touched.reason && !!form.errors.reason}
                />
              </Grid>
            )}
            <Grid
              marginBottom={2}
              size={{
                sm: 12,
                md: 6,
              }}
            >
              <label>Days</label>
              <CustomSelect
                isMulti
                options={weekdayOptionsForSelect}
                value={form.values.days}
                onChange={(val: any) => form.setFieldValue('days', val)}
                name={'days'}
                isInvalid={!!form.touched.days && !!form.errors.days}
              />
            </Grid>
          </Grid>
          {!isTimeoff && (
            <UsersSelectItem
              name={'location2'}
              schema={timeoffFormFields}
              form={form}
              fieldName='location2'
              fieldOptionData={'location2'}
              required
              extraFetchFunction={searchLocation}
            />
          )}
          <Grid container spacing={2}>
            <Grid
              size={{
                sm: 12,
                md: 6,
              }}
            >
              <DatePickerFormItem
                name={`startTime`}
                schema={timeoffFormFields}
                showTimeInput
                fieldName='startTime'
                required
                showTimeSelectOnly={true}
              />
            </Grid>
            <Grid
              size={{
                sm: 12,
                md: 6,
              }}
            >
              <DatePickerFormItem
                name={'endTime'}
                schema={timeoffFormFields}
                showTimeInput
                fieldName='endTime'
                required
                showTimeSelectOnly={true}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid
              size={{
                sm: 12,
                md: 6,
              }}
            >
              <DatePickerFormItem
                name={'startRange'}
                schema={timeoffFormFields}
                required
                fieldName='startRange'
              />
            </Grid>
            <Grid
              size={{
                sm: 12,
                md: 6,
              }}
            >
              <DatePickerFormItem
                name={'endRange'}
                schema={timeoffFormFields}
                required
                fieldName='endRange'
              />
            </Grid>
          </Grid>

          <Stack marginBottom={2}>
            <label htmlFor='notes'>Notes</label>
            <textarea
              name='notes'
              id='notes'
              rows={2}
              value={form.values.notes}
              onChange={form.handleChange}
              placeholder=''
              className='form-control'
            />
          </Stack>

          <div style={{ marginTop: '0.5rem' }}>
            <FormActions
              onSubmit={(e: FormEvent<HTMLFormElement>) => form.handleSubmit(e)}
              onReset={form.handleReset}
              onCancel={() => toggleFormModal()}
              saveLoading={localLoading}
            />
          </div>
        </form>
      )}
    </Formik>
  );
};

export default RequestsFormModalContent;
