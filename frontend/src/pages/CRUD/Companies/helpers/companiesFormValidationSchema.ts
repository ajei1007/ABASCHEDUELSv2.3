import * as Yup from 'yup';

const companiesFormValidationSchema = () => {
  const yupShape: any = {
    name: Yup.string().required('Name is required'),
    adminId: Yup.object().nullable().required('Select admin'),
  };
  return Yup.object().shape(yupShape);
};
export default companiesFormValidationSchema;
