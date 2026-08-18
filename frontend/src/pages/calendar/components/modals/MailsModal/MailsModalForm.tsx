import { useMemo, type FC } from 'react';
import { Stack, Typography } from '@mui/material';
import type { FormikProps } from 'formik';
import { useAppSelector } from 'store/hooks';
import { useLoadResourceOptions } from 'pages/calendar/hooks/useLoadResourceOptions';
import CustomAsyncSelect from 'components/CustomAsyncSelect/CustomAsyncSelect';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';

export interface IMailsModalFormProps {
  form: FormikProps<any>;
}

const MailsModalForm: FC<IMailsModalFormProps> = ({ form }) => {
  const { values, setFieldValue, handleChange, handleBlur } = form;

  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const storeLazyResources = useAppSelector(
    (state) => state.calendar.lazyResources,
  );
  const storeLocationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const storeLazyResourcesFetchStatus = useAppSelector(
    (state) => state.calendar.lazyResourcesFetchStatus,
  );

  const currentBranchId = storeCurrentBranches[0]?.value;
  const resources = useMemo(
    () => [
      ...storeLazyResources.filter((r) =>
        ['Employee', 'Client'].includes(r.type),
      ),
      ...storeLocationResources,
    ],
    [storeLazyResources, storeLocationResources],
  );
  const resourcesLoaded = [
    storeLazyResourcesFetchStatus[`${currentBranchId}:Employee`],
    storeLazyResourcesFetchStatus[`${currentBranchId}:Client`],
  ].every((status) => status === 'success');

  const { loadResourceOptions, shouldShowDefaultOptions } =
    useLoadResourceOptions({
      resourceTypes: ['Employee', 'Client', 'Location'],
      resources,
      resourcesLoaded,
      transformData: (data) =>
        data.map((item) => ({
          value: item.id,
          label: item.title,
          type: item.type,
          email: item.email,
          email1: item.email1,
          email2: item.email2,
        })),
    });

  return (
    <Stack spacing={2}>
      <Stack>
        <label>Selected Users</label>
        <CustomAsyncSelect
          isMulti={true}
          loadOptions={loadResourceOptions}
          defaultOptions={shouldShowDefaultOptions}
          value={values.users}
          onChange={(val: any) => setFieldValue('users', val)}
          name={'users'}
          isInvalid={!!form.touched.users && !!form.errors.users}
        />
        <CustomErrorMessage name={'users'} form={form} />
      </Stack>
      <Stack spacing={2}>
        <Stack direction='row' spacing={1}>
          <CustomSwitch
            name='Push Notification'
            checked={values.pushNotificationEnabled}
            onChange={(e) =>
              setFieldValue('pushNotificationEnabled', e.target.checked)
            }
          />
          <label>Send Mass Push Notifications</label>
        </Stack>
        {values.pushNotificationEnabled && (
          <Stack className='accordion-item' p={2} borderRadius='8px'>
            <CustomInput
              name='pushNotificationMessage'
              id='pushNotificationMessage'
              value={values.pushNotificationMessage}
              onChange={handleChange}
              onBlur={handleBlur}
              type='text'
              label='Message'
              error={
                !!form.touched.pushNotificationMessage &&
                !!form.errors.pushNotificationMessage
              }
            />
            <CustomErrorMessage name='pushNotificationMessage' form={form} />
          </Stack>
        )}
      </Stack>
      <Stack spacing={2}>
        <Stack direction='row' spacing={1}>
          <CustomSwitch
            name='Email'
            checked={values.emailEnabled}
            onChange={(e) => setFieldValue('emailEnabled', e.target.checked)}
          />
          <label>Send Emails</label>
        </Stack>
        {values.emailEnabled && (
          <Stack
            className='accordion-item'
            p={2}
            borderRadius='8px'
            spacing={2}
          >
            <div>
              <CustomInput
                name='subject'
                id='subject'
                value={values.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                type='text'
                label='Subject'
                error={!!form.touched.subject && !!form.errors.subject}
              />
              <CustomErrorMessage name='subject' form={form} />
              {/* <Typography fontSize='0.85rem' pt={'0.25rem'} color='#6b859e'>If left blank subject will be "Start date to End date Company Name"</Typography> */}
            </div>
            <div>
              <label htmlFor='desc'>Message</label>
              <textarea
                name='message'
                id='message'
                value={values.message}
                onChange={handleChange}
                onBlur={handleBlur}
                className='form-control'
                // label='Message'
                // error={!!form.touched.message && !!form.errors.message}
                // helperText={`If left blank messages will be "Hello, here is your ABA schedule for Start date to End date"`}
              />
              {values.weeklySchedulesEnabled && (
                <Typography fontSize='0.85rem' pt={'0.5rem'} color='#6b859e'>
                  If left blank messages will be "Hello, here is your ABA
                  schedule for Start date to End date"
                </Typography>
              )}
            </div>
            <CustomInput
              name='cc'
              id='cc'
              value={values.cc}
              onChange={handleChange}
              onBlur={handleBlur}
              type='text'
              label='CC'
              error={!!form.touched.cc && !!form.errors.cc}
              helperText={'Separate emails by spaces'}
            />
            <CustomInput
              name='bcc'
              id='bcc'
              value={values.bcc}
              onChange={handleChange}
              onBlur={handleBlur}
              type='text'
              label='BCC'
              error={!!form.touched.bcc && !!form.errors.bcc}
              helperText={'Separate emails by spaces'}
            />
            <CustomInput
              name='replyTo'
              id='replyTo'
              value={values.replyTo}
              onChange={handleChange}
              onBlur={handleBlur}
              type='text'
              label='Reply To'
              error={!!form.touched.replyTo && !!form.errors.replyTo}
              helperText={`Separate emails by spaces. If left blank Reply-to will be the email on branch file`}
            />
            <Stack direction='row' spacing={1}>
              <CustomSwitch
                name='weeklySchedulesEnabled'
                checked={values.weeklySchedulesEnabled}
                onChange={(e) =>
                  setFieldValue('weeklySchedulesEnabled', e.target.checked)
                }
              />
              <label>Send Week Schedule for Confirmation</label>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

MailsModalForm.displayName = 'MailsModalForm';

export default MailsModalForm;
