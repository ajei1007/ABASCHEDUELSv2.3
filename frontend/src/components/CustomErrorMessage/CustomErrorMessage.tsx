import { getIn } from 'formik';

const CustomErrorMessage = ({ name, form }: { name: any, form: any }) => {
  const error = getIn(form.errors, name);
  if (error) return <p className='error-message'>{error}</p>;
  return null;
};

export default CustomErrorMessage;
