import * as Yup from 'yup';

export const supportTicketFormValidationSchema = Yup.object().shape({
  firstName: Yup.string().when('type', {
    is: (val: any) => val?.value === 'bug',
    then: Yup.string().required('First name is required for bug issues'),
    otherwise: Yup.string().notRequired(),
  }),
  lastName: Yup.string().when('type', {
    is: (val: any) => val?.value === 'bug',
    then: Yup.string().required('Last name is required for bug issues'),
    otherwise: Yup.string().notRequired(),
  }),
  urgency: Yup.object().shape({
    value: Yup.number().required(),
    label: Yup.string().required(),
  }),
  type: Yup.object().shape({
    value: Yup.string().required(),
    label: Yup.string().required(),
  }),
  subject: Yup.string().required('Please describe your question or issue'),
  description: Yup.string().required('Please provide a detailed description'),
  attachments: Yup.array()
    .of(
      Yup.mixed<File>().test(
        'fileType',
        'Video files are not allowed',
        (file) => !file || !file.type.startsWith('video/'),
      ),
    )
    .nullable(),

  loomVideoUrl: Yup.string()
    .url('Must be a valid URL')
    .nullable()
    .test(
      'loom-or-file',
      'Add at least one attachment **or** paste a Loom URL.',
      function (value) {
        const { attachments } = this.parent as { attachments?: File[] };
        const hasFile = Array.isArray(attachments) && attachments.length > 0;
        const hasUrl = Boolean(value && value.trim());
        if (hasFile || hasUrl) return true;
        return this.createError({ path: 'loomVideoUrl' });
      },
    ),
});
