import moment from 'moment';
import isSameOrBefore from 'utils/isSameOrBefore';
import * as Yup from 'yup';

const availabilityValidationSchema = (
  hasUserField: boolean = false,
  resourceType: string,
) => {
  const yupShape: any = {
    forever: Yup.boolean(),
    allDay: Yup.boolean(),
    everyDay: Yup.boolean(),

    startTime: Yup.string()
      .nullable()
      .test('not empty', 'Start Time is required', function (value) {
        const { allDay } = this.parent;
        if (allDay) return true;
        return !!value;
      })
      .test(
        'start_time_test',
        'Start time must be before end time',
        function (value) {
          const { endTime, allDay } = this.parent;
          if (allDay) return true;
          return isSameOrBefore(value, endTime);
        },
      ),
    endTime: Yup.string()
      .nullable()
      .test('end_time_not_empty', 'End Time is required', function (value) {
        const { allDay } = this.parent;
        if (allDay) return true;
        return !!value;
      }),

    startRange: Yup.string()
      .nullable()
      .test('not empty', 'Start Range is required', function (value) {
        const { forever } = this.parent;
        if (forever) return true; // Skip validation if 'forever' is true
        return !!value;
      })
      .test(
        'start_range_test',
        'Start Range must be before end time',
        function (value) {
          const { endRange, forever } = this.parent;
          if (forever) return true;
          return moment(value).isSameOrBefore(endRange);
        },
      ),
    // .test(
    //   'start_range_test',
    //   'Start Range must be on one of the weekdays you selected!',
    //   function (value) {
    //     const { days } = this.parent;
    //     if (days) {
    //       const weekday = moment(value).weekday();
    //       const selectedDateWeekdayOption = weekdayOptions[weekday];

    //       if (selectedDateWeekdayOption) {
    //         const isAcceptableWeekday = days.findIndex((d: any) => d.id === selectedDateWeekdayOption.value) !== -1;
    //         return isAcceptableWeekday;
    //       }
    //     }
    //     return false;
    //   },
    // ),
    endRange: Yup.string()
      .nullable()
      .required('End Range is required')
      .test('end_range_test', 'End Range is required', function (value) {
        const { forever } = this.parent;
        if (forever) return true; // Skip validation if 'forever' is true
        return !!value;
      }),

    // .test(
    //   'end_range_test',
    //   'End Range must be on one of the weekdays you selected!',
    //   function (value) {
    //     const { days } = this.parent;
    //     if (days) {
    //       const weekday = moment(value).weekday();
    //       const selectedDateWeekdayOption = weekdayOptions[weekday];

    //       if (selectedDateWeekdayOption) {
    //         const isAcceptableWeekday = days.findIndex((d: any) => d.id === selectedDateWeekdayOption.value) !== -1;
    //         return isAcceptableWeekday;
    //       }
    //     }
    //     return false;
    //   },
    // )
    location2: Yup.array()
      .of(Yup.object())
      .nullable()
      .test('required-if-client', 'Location is required', function (value) {
        if (resourceType === 'Client') {
          return Array.isArray(value) && value.length > 0;
        }
        return true;
      }),
    days: Yup.array()
      .of(Yup.object())
      .when('everyDay', {
        is: true,
        then: Yup.array().of(Yup.object()).nullable(), // no requirement when Every‑Day
        otherwise: Yup.array()
          .of(Yup.object())
          .min(1, 'Minimum of one day')
          .required('Must have at least one day'),
      }),
  };
  // let yup = Yup.array().of(Yup.object());
  // if (resourceType !== 'Activity') {
  //   yup = yup.min(1, 'Must select at least one Location').required('Location is required');
  //   yupShape.location2 = yup
  // }

  if (hasUserField) {
    yupShape.user = Yup.object().nullable().required('User is required');
  }
  return Yup.object().shape(yupShape);
};

export default availabilityValidationSchema;
