import * as Yup from 'yup';

const priorityValidationSchema = (hasUserField: boolean = false) => {
  const yupShape: any = {
    user2: Yup.object().nullable().required('User is required'),
    rank: Yup.number().nullable().required('Rank is required'),
  };
  if (hasUserField) {
    yupShape.user1 = Yup.object().nullable().required('User is required');
  }
  return Yup.object().shape(yupShape);
};

export default priorityValidationSchema;
