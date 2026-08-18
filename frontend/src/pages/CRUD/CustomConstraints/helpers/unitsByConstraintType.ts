import { ConstraintTypesValueTypes, UNITS_OPTIONS } from './customTypes';

const unitsByConstraintType = (constraintType: string) => {
  let parsed_units_options = JSON.parse(JSON.stringify(UNITS_OPTIONS));

  if (ConstraintTypesValueTypes.DRIVE === constraintType) {
    parsed_units_options = parsed_units_options.filter((t: { value: string }) =>
      ['hours', 'minutes'].includes(t.value),
    );
  } else if (ConstraintTypesValueTypes.DISTANCE === constraintType) {
    parsed_units_options = parsed_units_options.filter((t: { value: string }) =>
      ['miles', 'kilometers'].includes(t.value),
    );
  } else if (ConstraintTypesValueTypes.TIME === constraintType) {
    parsed_units_options = parsed_units_options.filter((t: { value: string }) =>
      ['hours', 'minutes', 'unit', 'percentage'].includes(t.value),
    );
  } else if (ConstraintTypesValueTypes.AUTHORIZATION === constraintType) {
    parsed_units_options = parsed_units_options.filter((t: { value: string }) =>
      ['hours', 'minutes', 'unit'].includes(t.value),
    );
  } else if (ConstraintTypesValueTypes.GAPS === constraintType) {
    parsed_units_options = parsed_units_options.filter((t: { value: string }) =>
      ['hours', 'minutes'].includes(t.value),
    );
  } else if (ConstraintTypesValueTypes.SESSION_LENGTH === constraintType) {
    parsed_units_options = parsed_units_options.filter((t: { value: string }) =>
      ['hours', 'minutes'].includes(t.value),
    );
  } else if (ConstraintTypesValueTypes.BREAKQUANTITY === constraintType) {
    parsed_units_options = parsed_units_options.filter((t: { value: string }) =>
      ['hours', 'minutes'].includes(t.value),
    );
  }
  return parsed_units_options;
};

export default unitsByConstraintType;
