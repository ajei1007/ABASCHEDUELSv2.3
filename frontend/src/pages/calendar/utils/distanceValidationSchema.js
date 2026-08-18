import * as Yup from 'yup';

const distanceFormValidationSchema = () => {
  const yupShape = {
    user1: Yup.object()
      .nullable()
      .test('not empty', 'User 1 is required', function (value) {
        return !!value;
      })
      .test('oneOfRequired', 'You need to select user', function (value) {
        const { user2 } = this.parent;
        if (user2) {
          const hasUser = value;
          return hasUser;
        }
        return true;
      }),
    user2: Yup.object().nullable().required('User 2 is required'),
    // date: Yup.string()
    //   .nullable()
    //   .required('not empty', 'Date is required', function (value) {
    //     return !!value;
    //   }),
    // time: Yup.string().nullable().required('Time is required'),
    // startTime: Yup.string()
    //   .nullable()
    //   .test('not empty', 'Start Time is required', function (value) {
    //     return !!value;
    //   })
    //   .test(
    //     'start_time_test',
    //     'Start time must be before end time',
    //     function (value) {
    //       const { endTime } = this.parent;
    //       return isSameOrBefore(value, endTime);
    //     },
    //   ),
    // endTime: Yup.string().nullable().required('End Time is required'),
  };

  return Yup.object().shape(yupShape);
};
export default distanceFormValidationSchema;