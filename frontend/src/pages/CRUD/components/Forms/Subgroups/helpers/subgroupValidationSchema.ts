import * as Yup from 'yup';

const subgroupValidationSchema = () => {
  const yupShape: any = {
    name: Yup.string().nullable().required('Name is required'),
    //user: Yup.array().of(Yup.object()).min(1, 'You must select at least one user').required('User is required'),
  };
  return Yup.object().shape(yupShape);
};

export default subgroupValidationSchema;
