import * as Yup from 'yup';

const distanceMatrixFormValidationSchema = () => {
  const yupShape: any = {
    user1: Yup.object()
      .nullable()
      .test('not empty', 'User 1 is required', function (value: any) {
        return !!value;
      })
      .test('oneOfRequired', 'You need to select user', function (value: any) {
        const { user2 } = this.parent;
        if (user2) {
          const hasUser = value;
          return hasUser;
        }
        return true;
      }),
    user2: Yup.object().nullable().required('User 2 is required'),
    address1: Yup.object().required('Address 1 is required'),
    address2: Yup.object().required('Address 2 is required'),
  };
  return Yup.object().shape(yupShape);
};
export default distanceMatrixFormValidationSchema;
