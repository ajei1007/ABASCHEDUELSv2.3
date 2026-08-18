import * as Yup from 'yup';

const groupingsFormValidationSchema = () => {
  const yupShape: any = {
    name: Yup.string().required('Name is required'),
  //   min: Yup.string()
  //   .nullable()
  //   .test('not empty', 'Min is required', function (value) {
  //     return !!value;
  //   })
  //   .test('min_test', 'Min must be less than max', function (value: any) {
  //     const { max } = this.parent;
  //     return Number(max) >= Number(value);
  //   }),
  // max: Yup.string().nullable().required('Max is required'),
  //   roles1: Yup.array()
  //   .of(Yup.object())
  //   .min(1, 'Minimum of one role 1')
  //   .required('Must have at least one role 1'),
  //   roles2: Yup.array()
  //   .of(Yup.object())
  //   .min(1, 'Minimum of one role 2')
  //   .required('Must have at least one role 2 '),
  };
  return Yup.object().shape(yupShape);
};
export default groupingsFormValidationSchema;