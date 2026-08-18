import { type FC, memo, useMemo, useState } from 'react';
import { Formik } from 'formik';
import { Stack } from '@mui/material';
import { toast } from 'react-toastify';
import CustomButton from 'components/Button';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import { sendMultipleEmails } from 'store/slices/calendar/thunks';
import mailFormValidationSchema from '../../../constants/mailFormValidationSchema';
import MailsModalForm from './MailsModalForm';
import { useCalendarSelectedResourcesContext } from '../../../context/CalendarSelectedResourcesContext';

const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
const validateEmailStringArr = (string: string) => {
  const emails = string.replace(',', '').split(' ');

  for (const email of emails) {
    if (!isValidEmail(email)) {
      toast.error(`This '${email}' is not valid email address!`);
      return [];
    }
  }

  return emails;
};

export interface IMailsModalContentProps {
  toggleModalOpen: () => void;
}

const MailsModalContent: FC<IMailsModalContentProps> = ({
  toggleModalOpen,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const currentBranch = useAppSelector(
    (state) => state.calendar.current_branches,
  );

  // Get selected resources from context
  const { selectedResources } = useCalendarSelectedResourcesContext();

  const handleSubmit = async (values: any) => {
    const {
      users,
      emailEnabled,
      subject,
      message,
      cc,
      bcc,
      replyTo,
      weeklySchedulesEnabled,
      pushNotificationEnabled,
      pushNotificationMessage,
    } = values;

    setLoading(true);
    try {
      const reqBody = {
        users,
        subject,
        message,
        cc: [] as any[],
        bcc: [] as any[],
        replyTo: [] as any[],
        emailEnabled,
        weeklySchedulesEnabled,
        pushNotificationEnabled,
        pushNotificationMessage,
      };
      if (!emailEnabled && !pushNotificationEnabled)
        return toast.error('Nothing to send!');

      // Validate cc
      if (cc) {
        reqBody.cc = validateEmailStringArr(cc);
      }
      if (bcc) {
        reqBody.bcc = validateEmailStringArr(bcc);
      }
      if (replyTo) {
        reqBody.replyTo = validateEmailStringArr(replyTo);
      }

      const res = await dispatch(sendMultipleEmails(reqBody));

      if (res) {
        toggleModalOpen();
        toast.success('Notifications sent successfully!');
        dispatch(
          checkNpsSurvey({
            chance: 1, // 100% chance to show NPS survey
          }),
        );
      }
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

  const initValues = useMemo(() => {
    const iniValues = {
      emailEnabled: false,
      users: [...selectedResources],
      subject: '',
      message: '',
      cc: '',
      bcc: '',
      replyTo: currentBranch[0]?.replyToEmail ?? '',
      weeklySchedulesEnabled: true,

      pushNotificationEnabled: false,
      pushNotificationMessage: '',
    };
    return iniValues;
  }, [selectedResources, currentBranch]);

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={initValues}
      enableReinitialize
      validationSchema={mailFormValidationSchema()}
    >
      {(form) => (
        <form>
          <MailsModalForm form={form} />
          <Stack
            flexDirection='row'
            justifyContent='flex-end'
            marginTop={2}
            alignItems='center'
            columnGap={1}
          >
            <CustomButton
              onClick={() => form.handleSubmit()}
              variant='contained'
              loading={loading}
            >
              Send
            </CustomButton>
            <CustomButton onClick={toggleModalOpen} variant='outlined'>
              Cancel
            </CustomButton>
          </Stack>
        </form>
      )}
    </Formik>
  );
};

MailsModalContent.displayName = 'MailsModalContent';

export default memo(MailsModalContent);
