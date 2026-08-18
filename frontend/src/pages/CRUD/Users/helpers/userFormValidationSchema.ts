/* eslint-disable @typescript-eslint/no-unused-vars */
import { user_arrays } from 'constants/user_arrays';
import {
  passwordConfirmValidationSchema,
  passwordValidationSchema,
} from 'helpers/validations/passwordValidationSchema';
import moment from 'moment';
import availabilityValidationSchema from 'pages/CRUD/components/Forms/Availabilities/helpers/availabilityValidationSchema';
import priorityValidationSchema from 'pages/CRUD/components/Forms/Priorities/helpers/priorityValidationSchema';
import isSameOrBefore from 'utils/isSameOrBefore';
import * as Yup from 'yup';
import { useAppSelector } from 'store/hooks';

const authorizationValidationSchema = () => {
  const yupShape: any = {
    antecedentTypeActivity: Yup.object()
      .nullable()
      .test('oneOfRequired', 'You need to select user', function (value: any) {
        const { antecedentTypeActivity } = this.parent;
        if (antecedentTypeActivity) return true;
        return false;
      }),
    start: Yup.string()
      .nullable()
      .test('not empty', 'Start Date is required', function (value) {
        return !!value;
      })
      .test('start_test', 'Start must be before End', function (value) {
        const { end, forever } = this.parent;
        if (forever) return true;

        const formattedEnd = moment(end).format();
        return isSameOrBefore(value, formattedEnd);
      }),
    units: Yup.object()
      .nullable()
      .test('oneOfRequired', 'Units field is required', function (value: any) {
        const { units } = this.parent;
        if (units) return true;
        return false;
      }),
  };

  return Yup.object().shape(yupShape);
};

/*=======================
validateGroupings' is assigned a value but never used
=========================*/
const validateGroupings = (groupings: any) => {
  return groupings.map((group: any) => {
    let schema = Yup.object().shape({
      label: Yup.string(),
    });

    if (group.required) {
      schema = schema.shape({
        subgroup: Yup.string().required('Required'),
      });
    }

    return schema.validate(group);
  });
};

const userFormValidationSchema = (
  resources: any,
  isEditing?: boolean,
  settingsCompany?: any,
) => {
  const yupShape: any = {
    // Dynamic fields
    availabilities: Yup.array().of(
      availabilityValidationSchema(false, resources),
    ),
    priorities: Yup.array().of(priorityValidationSchema(false)),
    timeconstraints: Yup.array().of(
      Yup.object().shape({
        //user2: Yup.object().nullable().required('Activity is required'),
        frequency: Yup.string().nullable().required('Frequency is required'),
        unit: Yup.string().nullable().required('Unit is required'),
        min: Yup.string()
          .nullable()
          .test('not empty', 'Min is required', function (value) {
            return !!value;
          })
          .test('min_test', 'Min must be less than max', function (value: any) {
            const { max } = this.parent;
            return Number(max) >= Number(value);
          }),
        max: Yup.string().nullable().required('Max is required'),
        start: Yup.string()
          .nullable()
          .test('not empty', 'Start Date is required', function (value) {
            return !!value;
          })
          .test(
            'start_date_test',
            'Start Date must be before End Date',
            function (value: any) {
              const { end } = this.parent;
              return isSameOrBefore(value, end);
            },
          ),
        end: Yup.string().nullable().required('End Date is required'),
      }),
    ),
    groupings: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        label: Yup.string(),
        subgroup: Yup.array()
          .nullable()
          .test(
            'oneOfRequired',
            `Please select at least one tag`,
            function (value: any) {
              const { required, subgroup } = this.parent;
              if (required) {
                return subgroup?.length;
              }
              return true;
            },
          ),
        required: Yup.boolean(),
      }),
    ),
    // constraints: Yup.array().of(customFormValidationSchema(true)),
    authorizations: Yup.array().of(authorizationValidationSchema()),
  };
  if (Object.keys(user_arrays[resources]).includes('firstName')) {
    let yup = Yup.string().min(2, 'Too Short!').max(50, 'Too Long!');
    if (user_arrays[resources]['firstName']) {
      yup = yup.required('First Name is required');
    }
    yupShape.firstName = yup;
  }
  // if (Object.keys(user_arrays[resources]).includes('alias')) {
  //   let yup = Yup.string().min(2, 'Too Short!').max(50, 'Too Long!');
  //   yupShape.alias = yup;
  // }
  if (Object.keys(user_arrays[resources]).includes('lastName')) {
    let yup = Yup.string().min(2, 'Too Short!').max(50, 'Too Long!');
    if (user_arrays[resources]['lastName']) {
      yup = yup.required('Last Name is required');
    }
    yupShape.lastName = yup;
  }
  if (!isEditing && Object.keys(user_arrays[resources]).includes('password')) {
    yupShape.password = passwordValidationSchema;
    yupShape.passwordConfirm = passwordConfirmValidationSchema;
  }
  if (Object.keys(user_arrays[resources]).includes('roomparent')) {
    let yup = Yup.array().of(Yup.object());
    if (user_arrays[resources]['roomparent']) {
      yup = yup
        .min(1, 'Minimum of one room parent')
        .required('Roomparent is required');
    }
    yupShape.roomparent = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('rooms')) {
    let yup = Yup.array().of(Yup.object());
    if (user_arrays[resources]['rooms']) {
      yup = yup.min(1, 'Minimum of one room').required('Rooms is required');
    }
    yupShape.rooms = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('capacity')) {
    let yup = Yup.number();
    if (user_arrays[resources]['capacity']) {
      yup = yup.required('Rooms is required');
    }
    yupShape.capacity = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('parent')) {
    let yup = Yup.object();
    if (user_arrays[resources]['parent']) {
      yup = yup.required('Parent is required');
    }
    yupShape.capacity = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('email')) {
    let yup = Yup.string().email('Invalid email');
    if (resources !== 'Location' && user_arrays[resources]['email']) {
      yup = yup.required('Email is required');
    }
    yupShape.email = yup;
  }

  if (Object.keys(user_arrays[resources]).includes('email1')) {
    let yup = Yup.string().email('Invalid email');
    yupShape.email1 = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('email2')) {
    let yup = Yup.string().email('Invalid email');
    yupShape.email2 = yup;
  }
  if (
    settingsCompany?.customLabels?.resources?.[resources.toLowerCase()]?.ID
      ?.required
  ) {
    let yup = Yup.string().required('This field is required');
    yupShape.idCustom = yup;
  }
  if (
    settingsCompany?.customLabels?.resources?.[resources.toLowerCase()]?.ID2
      ?.required
  ) {
    let yup = Yup.string().required('This field is required');
    yupShape.idCustom2 = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('phoneNumber')) {
    let yup = Yup.string();
    if (user_arrays[resources]['phoneNumber']) {
      yup = yup.required('Phone Number is required');
    }
    yupShape.phoneNumber = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('gender')) {
    let yup = Yup.string();
    if (user_arrays[resources]['gender']) {
      yup = yup.required('Gender is required');
    }
    yupShape.gender = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('otherPhones')) {
    let yup = Yup.string();
    if (user_arrays[resources]['otherPhones']) {
      yup = yup.required('Other Phones field is required');
    }
    yupShape.otherPhones = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('otherEmails')) {
    let yup = Yup.string();
    if (user_arrays[resources]['otherEmails']) {
      yup = yup.required('Other Emails field is required');
    }
    yupShape.otherEmails = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('roles')) {
    let yup = Yup.object();
    if (user_arrays[resources]['roles']) {
      yup = yup.required('Roles field is required');
    }
    yupShape.roles = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('branches')) {
    let yup = Yup.array().of(Yup.object());
    if (user_arrays[resources]['branches']) {
      // yup = yup.required('Branches field is required');
      yup = yup.min(1, 'Minimum of one branch').required('Branch is required');
    }
    yupShape.branches = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('address')) {
    let yup = Yup.object().nullable();
    if (user_arrays[resources]['address']) {
      yup = yup.required('Address is required');
    }
    yupShape.address = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('birthday')) {
    let yup = Yup.string().nullable();
    if (user_arrays[resources]['birthday']) {
      yup = yup.required('Birthday is required');
    }
    yupShape.birthday = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('tags')) {
    let yup = Yup.array().of(Yup.object());
    if (user_arrays[resources]['tags']) {
      yup = yup
        .min(1, 'You must select one tag')
        .required('Tags field is required');
    }
    yupShape.tags = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('primarylocation')) {
    let yup = Yup.array().of(Yup.object());
    if (user_arrays[resources]['primarylocation']) {
      yup = yup
        .min(1, 'You must select one primarylocation')
        .required('Primary location is required');
    }
    yupShape.primarylocation = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('userdefaultlocation')) {
    let yup = Yup.array().of(Yup.object());
    if (user_arrays[resources]['userdefaultlocation']) {
      yup = yup
        .min(1, 'You must select one user default location')
        .required('Userdefault location is required');
    }
    yupShape.userdefaultlocation = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('userdefaultactivity')) {
    let yup = Yup.array().of(Yup.object());
    if (user_arrays[resources]['userdefaultactivity']) {
      yup = yup
        .min(1, 'You must select one user default userdefaultactivity')
        .required('Userdefault activity is required');
    }
    yupShape.userdefaultactivity = yup;
  }
  if (Object.keys(user_arrays[resources]).includes('disabled')) {
    let yup = Yup.boolean();
    if (user_arrays[resources]['disabled']) {
      yup = yup.required('Disabled is required');
    }
    yupShape.disabled = yup;
  }
  return Yup.object().shape(yupShape);
};
export default userFormValidationSchema;
