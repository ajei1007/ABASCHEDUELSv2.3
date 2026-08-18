import * as Yup from 'yup';

const branchesFormValidationSchema = () => {
  const yupShape: any = {
    name: Yup.string().required('Name is required'),
    branchType: Yup.object().nullable().required('Branch type is required'),
    parent: Yup.object().nullable().required('Parent is required'),
    replyToEmail : Yup.string().email('Invalid email'),
    user: Yup.object().nullable(),
  };
  return Yup.object().shape(yupShape);
};
export default branchesFormValidationSchema;
