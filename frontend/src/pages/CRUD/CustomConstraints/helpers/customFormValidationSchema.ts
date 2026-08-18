import * as Yup from 'yup';
import {
  AntecedentAndConsequenceTypeTypes,
  ConstraintTypesValueTypes,
  DaySelectionTypes,
} from './customTypes';
import isSameOrBefore from 'utils/isSameOrBefore';
import moment from 'moment';

function testValidation(this: any) {
  const {
    antecedentType,
    antecedentTypeRole,
    antecedentTypeSubgroup,
  } = this.parent;
  if (
    antecedentType.value ===
    AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS
  ) {
    const hasLength = antecedentTypeRole || antecedentTypeSubgroup;
    return hasLength;
  }
  return true;
}
function testValidationConsequence(this: any) {
  const {
    consequenceType,
    consequenceTypeRole,
    consequenceTypeSubgroup,
  } = this.parent;
  if (
    consequenceType.value ===
    AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS
  ) {
    const hasLength =
      consequenceTypeRole ||
      consequenceTypeSubgroup;
    return hasLength;
  }
  return true;
}

const customFormValidationSchema = (isNested: boolean = false) => {
  const yupShape: any = {
    constraintType: Yup.object()
      .test(
        'oneOfRequired',
        'Constraint Type field is required',
        function (value: any) {
          const { constraintType } = this.parent;
          return constraintType.value !== '' && constraintType.value;
        },
      ),
    antecedentTypeUser: Yup.object()
      .nullable()
      .test(
        'oneOfRequired',
        'You need to select user',
        function (value: any) {
          if (isNested) return true;
          const { antecedentType } = this.parent;
          if (
            antecedentType.value ===
            AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
          ) {
            const hasUser = value;
            return hasUser;
          }
          return true;
        },
    ),
        antecedentTypeActivity: Yup.object()
      .nullable()
      .test('activityRequiredIfYes', 'You need to select an activity', function (value) {
        const { activity1, constraintType } = this.parent;

        if (
          activity1 === true &&
          ![ConstraintTypesValueTypes.SUPERVISION, ConstraintTypesValueTypes.AUTHORIZATION]
            .includes(constraintType?.value)
        ) {
          return !!value;
        }

        return true;
      }),
      antecedentTypeLocation: Yup.object()
      .nullable()
      .test('locationRequiredIfYes', 'You need to select a location', function (value) {
        const { location1 } = this.parent;
    
        if (location1 === true) {
          return !!value;
        }
    
        return true;
      }),
    antecedentTypeRole: Yup.object()
      .nullable()
      .test(
        'oneOfRequired',
        'You need to select role, tag',
        function () {
          if (isNested) return true;
          return testValidation.call(this);
        },
      ),
    antecedentTypeSubgroup: Yup.object()
    .nullable()
    .test(
      'oneOfRequired',
      'You need to select one of role or tag',
      function (value) {
        const { tag1 } = this.parent;
        if(tag1 ) return !!value;
        return testValidation.call(this);
      },
    ),

    consequenceTypeUser: Yup.object()
      .nullable()
      .test(
        'oneOfRequired',
        'You need to select user',
        function (value: any) {
          const { consequenceType, constraintType } = this.parent;
          if (
            consequenceType.value ===
            AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
          ) {
            if([ConstraintTypesValueTypes.SUPERVISION, ConstraintTypesValueTypes.AUTHORIZATION].includes(constraintType?.value)) {
              return true;
            }
            const hasUser = value;
            return hasUser;
          }
          return true;
        },
      ),
    consequenceTypeRole: Yup.object()
      .nullable()
      .test(
        'oneOfRequired',
        'You need to select one of role or tag',
        function () {
          return testValidationConsequence.call(this);
        },
      ),
    consequenceTypeSubgroup: Yup.object()
      .nullable()
      .test(
        'oneOfRequired',
        'You need to select one of role or tag',
        function (value) {
          const { tag2 } = this.parent;
          if(tag2 ) return !!value;
          return testValidationConsequence.call(this);
        },
      ),

    min: Yup.number()
      .nullable()
      .test('not_empty', 'Min is required', function (value: any) {
        const { noLimit } = this.parent;
        if (noLimit) return (typeof value === 'number' ? value >= 0 : false);
        return true;
      })
      .test('min_test', 'Min must be less than max', function (value: any) {
        const { max, noLimit } = this.parent;
        if (noLimit) {
          return Number(max) >= Number(value);
        }
        return true;
      }),
    max: Yup.number()
      .nullable()
      .test('max_test', 'Max is required', function (value: any) {
        const { noLimit } = this.parent;
        if (noLimit) return (typeof value === 'number' ? value >= 0 : false);
        return true;
      }),
    offset: Yup.number()
      .nullable()
      .test('offset_test', 'Offset is required', function (value: any) {
        const { constraintType } = this.parent;
        if (
          [ConstraintTypesValueTypes.AUTHORIZATION].includes(
            constraintType?.value,
          )
        ) {
          return typeof value === 'number' ? value >= 0 : false;
        }
        return true;
      }),
    weight: Yup.string().required('Weight is required'),
    branches: Yup
      .array()
      .test('branches_test', 'Branches field is required', function (value: any) {
        const { isBranchesActive } = this.parent;
        if (isBranchesActive) return value.length !== 0;
        return true;
      }),
    start: Yup.string()
      .nullable()
      .test('not empty', 'Start Date is required', function (value) {
        return !!value;
      })
      .test(
        'start_test',
        'Start must be before End',
        function (value) {
          const { end, forever } = this.parent;
          if (forever) return true;

          const formattedEnd = moment(end).format();
          return isSameOrBefore(value, formattedEnd);
        },
    ),
    units: Yup.object()
      .nullable()
      .test(
        'oneOfRequired',
        'Units field is required',
        function (value: any) {
          const { units } = this.parent;
          const { constraintType } = this.parent;
          if([
            ConstraintTypesValueTypes.DRIVE,
            ConstraintTypesValueTypes.TIME,
            ConstraintTypesValueTypes.AUTHORIZATION,
            ConstraintTypesValueTypes.DISTANCE,
            ConstraintTypesValueTypes.GAPS,
            ConstraintTypesValueTypes.SESSION_LENGTH,
          ].includes(constraintType?.value)) {
            if (units) return true;
            return false
          }
          return true;
        },
      ),
  };

  return Yup.object().shape(yupShape);
};
export default customFormValidationSchema;
