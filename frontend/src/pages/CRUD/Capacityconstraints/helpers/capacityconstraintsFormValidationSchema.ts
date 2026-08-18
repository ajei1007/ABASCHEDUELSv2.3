import * as Yup from 'yup';

const capacityconstraintsFormValidationSchema = () => {
  const yupShape: any = {
    user1: Yup.object().nullable().required('Activity is required'),
    role1: Yup.object().nullable().required('Role 1 is required'),
    subgroup1: Yup.object().nullable(),
    enableMinMax1: Yup.boolean(),
    min1: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Min 1 is required', function (value) {
        if (this.parent.enableMinMax1) return !!value;
        return true;
      })
      .test('min_test', 'Min must be less than max', function (value: any) {
        const { max1, enableMinMax1 } = this.parent;
        if (enableMinMax1) return Number(max1) >= Number(value);
        return true;
      }),
    max1: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Max 1 is required', function (value) {
        if (this.parent.enableMinMax1) return !!value;
        return true;
      }),

    role2: Yup.object().nullable(),
    enableMinMax2: Yup.boolean(),
    min2: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Min 2 is required', function (value) {
        if (this.parent.enableMinMax2) return !!value;
        return true;
      })
      .test('min_test', 'Min must be less than max', function (value: any) {
        const { max2, enableMinMax2 } = this.parent;
        if (enableMinMax2) return Number(max2) >= Number(value);
        return true;
      }),

    max2: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Max 2 is required', function (value) {
        if (this.parent.enableMinMax2) return !!value;
        return true;
      }),
    role3: Yup.object().nullable(),
    enableMinMax3: Yup.boolean(),
    min3: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Min 3 is required', function (value) {
        if (this.parent.enableMinMax3) return !!value;
        return true;
      })
      .test('min_test', 'Min must be less than max', function (value: any) {
        const { max3, enableMinMax3 } = this.parent;
        if (enableMinMax3) return Number(max3) >= Number(value);
        return true;
      }),

    max3: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Max 3 is required', function (value) {
        if (this.parent.enableMinMax3) return !!value;
        return true;
      }),
    role4: Yup.object().nullable(),
    enableMinMax4: Yup.boolean(),
    min4: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Min 4 is required', function (value) {
        if (this.parent.enableMinMax4) return !!value;
        return true;
      })
      .test('min_test', 'Min must be less than max', function (value: any) {
        const { max4, enableMinMax4 } = this.parent;
        if (enableMinMax4) return Number(max4) >= Number(value);
        return true;
      }),

    max4: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Max 4 is required', function (value) {
        if (this.parent.enableMinMax4) return !!value;
        return true;
      }),
      role5: Yup.object().nullable(),
    enableMinMax5: Yup.boolean(),
    min5: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Min 5 is required', function (value) {
        if (this.parent.enableMinMax5) return !!value;
        return true;
      })
      .test('min_test', 'Min must be less than max', function (value: any) {
        const { max5, enableMinMax5 } = this.parent;
        if (enableMinMax5) return Number(max5) >= Number(value);
        return true;
      }),

    max5: Yup.string()
      .nullable()
      .test('required-if-enabled', 'Max 5 is required', function (value) {
        if (this.parent.enableMinMax5) return !!value;
        return true;
      }),
  };
  return Yup.object().shape(yupShape);
};
export default capacityconstraintsFormValidationSchema;