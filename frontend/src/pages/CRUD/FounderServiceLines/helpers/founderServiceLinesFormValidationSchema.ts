import * as Yup from 'yup';

const founderServiceLinesFormValidationSchema = () => {
  const yupShape: any = {};
  return Yup.object().shape(yupShape);
};
export default founderServiceLinesFormValidationSchema;