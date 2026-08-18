import { useState, memo, type FC } from 'react';
import { Formik, Form, type FormikValues } from 'formik';
import { Grid2 as Grid, Stack, Typography } from '@mui/material';
import AsyncSelect from 'react-select/async';
import { toast } from 'react-toastify';
import CustomButton from 'components/Button';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import FormErrors from 'components/FormItems/formErrors';
import distanceFields from 'pages/calendar/utils/distanceFields';
import distanceFormValidationSchema from 'pages/calendar/utils/distanceValidationSchema';
import { useAppDispatch } from 'store/hooks';
import { distanceCalculator } from 'store/slices/calendar/thunks';
import asyncSearchUsers from 'utils/asyncSearchUsers';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';

function metersToMiles(meters: number) {
  const miles = (meters / 1609.344).toFixed(2);
  return `${miles} miles`;
}

function formatDuration({
  days,
  hours,
  minutes,
}: {
  days: number;
  hours: number;
  minutes: number;
}) {
  let parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

  if (parts.length === 0) return 'less than a minute';
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(', ') + ' and ' + parts.slice(-1);
}

function durationFormattingFromSeconds(seconds: number) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  return formatDuration({ days, hours, minutes });
}

export interface IDistanceModalContentProps {
  toggleModalOpen: () => void;
}

const DistanceModalContent: FC<IDistanceModalContentProps> = ({
  toggleModalOpen,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    distance: '',
    duration: '',
    user1Id: '',
    user2Id: '',
  });

  const handleSubmit = async (values: FormikValues) => {
    setLoading(true);
    try {
      if (values.user1 && values.user2) {
        const user1 = values.user1;
        const user2 = values.user2;

        const user1Id = user1.value;
        const user2Id = user2.value;
        // If user is not changed
        if (result.user1Id === user1Id && result.user2Id === user2Id) {
          return;
        }

        const address1 = user1?.address;
        const address2 = user2?.address;

        if (!address1)
          return toast.error(`${user1?.label} does not have address`);
        if (!address2)
          return toast.error(`${user2?.label} does not have address`);

        const { distance, duration } = await dispatch(
          distanceCalculator({ address1, address2 }),
        );

        const distanceKm = metersToMiles(distance);
        const durationStr = durationFormattingFromSeconds(duration);

        setResult({
          distance: distanceKm,
          duration: durationStr,
          user1Id,
          user2Id,
        });
      }
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    toggleModalOpen();
    setResult({
      distance: '',
      duration: '',
      user1Id: '',
      user2Id: '',
    });
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={distanceFields}
      validationSchema={distanceFormValidationSchema()}
      enableReinitialize
    >
      {(form) => {
        const filterOptions = (
          candidate: any,
          _: any,
          exludingFormName: any,
        ) => {
          const selectedOpt = (form.values as any)?.[exludingFormName];
          if (candidate?.value === selectedOpt?.value) {
            return false;
          }
          return true;
        };
        const disabledButton =
          // @ts-ignore
          form.values?.user1?.value === result.user1Id &&
          // @ts-ignore
          form.values?.user2?.value === result.user2Id;
        return (
          <Form onSubmit={form.handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <label htmlFor='user1'>User 1</label>
                <AsyncSelect
                  name='user1'
                  className='w-100'
                  classNamePrefix='select'
                  placeholder=''
                  styles={selectInputControlStyles(
                    !!FormErrors.displayableError(form, 'user1') || false,
                  )}
                  defaultOptions={true}
                  loadOptions={asyncSearchUsers}
                  value={form.values.user1}
                  onChange={(val) => form.setFieldValue('user1', val)}
                  filterOption={(candidate, input) =>
                    filterOptions(candidate, input, 'user2')
                  }
                />
                <CustomErrorMessage name={'user1'} form={form} />
              </Grid>
              <Grid size={6}>
                <label htmlFor='user2'>User 2</label>
                <AsyncSelect
                  name='user2'
                  className='w-100'
                  classNamePrefix='select'
                  placeholder=''
                  styles={selectInputControlStyles(
                    !!FormErrors.displayableError(form, 'user2') || false,
                  )}
                  defaultOptions={true}
                  loadOptions={asyncSearchUsers}
                  value={form.values.user2}
                  onChange={(val) => form.setFieldValue('user2', val)}
                  filterOption={(candidate, input) =>
                    filterOptions(candidate, input, 'user1')
                  }
                />
                <CustomErrorMessage name={'user2'} form={form} />
              </Grid>
            </Grid>
            <Stack direction='row' justifyContent='space-between' mt={2}>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Stack direction='row' alignItems='flex-end'>
                  <Stack direction='row' spacing={1}>
                    <Typography>Distance:</Typography>
                    {result.distance && (
                      <Typography>{result.distance}</Typography>
                    )}
                  </Stack>
                </Stack>
                <Stack direction='row' alignItems='center'>
                  <Stack direction='row' spacing={1}>
                    <Typography>Duration:</Typography>
                    {result.duration && (
                      <Typography>{result.duration}</Typography>
                    )}
                  </Stack>
                </Stack>
              </Stack>
              <Stack direction='row' spacing={1}>
                <CustomButton
                  type='submit'
                  loading={loading}
                  disabled={disabledButton}
                >
                  Calculate
                </CustomButton>
                <CustomButton onClick={handleCloseModal} variant='outlined'>
                  Cancel
                </CustomButton>
              </Stack>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
};

DistanceModalContent.displayName = 'DistanceModalContent';

export default memo(DistanceModalContent);
