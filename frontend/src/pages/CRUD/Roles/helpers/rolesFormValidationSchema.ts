import * as Yup from 'yup';

const rolesFormValidationSchema = () => {
  const yupShape: any = {
    name: Yup.string().required('Name is required'),
    dataAccess: Yup.string().required('Data Access is required'),
    branchType: Yup.object().nullable().required('Branch type is required'),
  };
  return Yup.object().shape(yupShape);
};
export default rolesFormValidationSchema;