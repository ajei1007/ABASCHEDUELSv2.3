import * as Yup from 'yup';

const totalTypesFormValidationSchema = () => {
  const yupShape: any = {
    name: Yup.string().required('Name is required'),
    activities: Yup.array()
    .of(Yup.object())
    .min(1, 'Minimum of one Activity')
    .required('Must have at least one Activity'),
  };
  return Yup.object().shape(yupShape);
};
export default totalTypesFormValidationSchema;