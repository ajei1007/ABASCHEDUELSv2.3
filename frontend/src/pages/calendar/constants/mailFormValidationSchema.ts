import * as Yup from 'yup';

const mailFormValidationSchema = () => {
  const yupShape: any = {
    users: Yup.array().of(Yup.object()).min(1, 'Please select at least one user').required('User is required'),
    subject: Yup.string()
      .test(
        'subject-required',
        'Subject is required',
        function (subject) {
          const { emailEnabled } = this.parent;
          if (!subject && emailEnabled) return false;
          return true;
        },
    ),
    pushNotificationMessage: Yup.string()
      .test(
        'message-required',
        'Message is required',
        function (pushNotificationMessage) {
          const { pushNotificationEnabled } = this.parent;
          if (!pushNotificationMessage && pushNotificationEnabled) return false;
          return true;
        },
    ),
  };
  return Yup.object().shape(yupShape);
};
export default mailFormValidationSchema;