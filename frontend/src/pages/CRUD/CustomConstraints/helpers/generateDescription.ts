/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AntecedentAndConsequenceTypeTypes,
  ConstraintTypesValueTypes,
  DaySelectionTypes,
  EachOrAllTypes,
} from './customTypes';

const stringifyArray = (array: Array<any>): string => {
  return array
    .filter((innerArr: Array<any>) => innerArr.length > 0)
    .map((innerArr: Array<any>) => {
      const usersList = innerArr
        .map((val) => `<strong>${val.label}</strong>`)
        .join(' or ');
      return usersList;
    })
    .join(' and ');
};

/*=========== specificUserText' is assigned a value but never used */
const specificUserText = (
  arr: Array<any>,
  prefix: string = '',
  postfix: string = '',
): string => {
  let text: string = '';
  if (arr.length && arr[0]?.length) {
    const stringifiedUsers = stringifyArray(arr);
    text += ` ${prefix} ${stringifiedUsers} ${postfix}`;
  } else {
    text += ' ____ ';
  }
  return text;
};

/*========= 'labelOrBlank' is assigned a value but never used ==========*/
const labelOrBlank = (obj: any) => {
  if (obj?.label) {
    return obj?.label;
  } else {
    return ' ____ ';
  }
};

const arrayOrBlank = (arr: any, prefix: string = '', postfix: string = '') => {
  if (arr && arr.length) {
    const text = arr
      .map((val: any) => `<strong>${val.label}</strong>`)
      .join(' and ');
    return `${prefix} ${text} ${postfix}`;
  } else {
    return ' ____ ';
  }
};

const rolesAndSubgroupsText = (
  role: any,
  subgroup: any,
  prefix: string = '',
  postfix: string = '',
): string => {
  let text: string = '';
  if (role || subgroup) {
    const stringifiedRole = role?.label;
    // const vowels = ['e','E','a','A','o','O','i','I','U','U']
    // if(vowels.includes(stringifiedRole.value[8])){
    //   prefix += 'n'
    // }
    text += ` ${prefix} <strong>${stringifiedRole}</strong> `;
    if (subgroup) {
      const stringifiedSubgroup = subgroup?.label;
      text += ` tagged <strong>${stringifiedSubgroup}</strong> ${postfix}`;
    }
  } else {
    text += ' ____ ';
  }
  return text;
};

const generateDescription = (formValues: any): string => {
  const {
    constraintType,
    grouping,
    // antecedent
    antecedentType,
    antecedentTypeUser,
    antecedentTypeLocation,
    antecedentTypeActivity,
    antecedentTypeRole,
    antecedentTypeSubgroup,
    // consequence
    consequenceType,
    consequenceTypeUser,
    consequenceTypeLocation,
    consequenceTypeActivity,
    consequenceTypeRole,
    consequenceTypeSubgroup,
    consequenceTypeEachOrAll,
    units,
    //
    all,
    min,
    max,
    start,
    end,
    frequency,
    noLimit,
    forever,
  } = formValues as any;

  let start_str = `${start.getMonth() + 1}/${start.getDate()}/${start.getFullYear()}`;
  let end_str = `${end.getMonth() + 1}/${end.getDate()}/${end.getFullYear()}`;
  let full_date = `${start_str}-${end_str}`;

  let aUsers: any = [];
  let location_and_activity_antecedent = '';
  if (antecedentTypeUser) {
    aUsers = [...aUsers, antecedentTypeUser];
  }

  if (antecedentTypeLocation) {
    location_and_activity_antecedent += `for Appointments that are at the location <strong>${antecedentTypeLocation.label}</strong>`;
    //aUsers = [...aUsers, antecedentTypeLocation]
  }
  if (antecedentTypeActivity) {
    //aUsers = [...aUsers, antecedentTypeActivity]
    if (location_and_activity_antecedent.length > 0) {
      location_and_activity_antecedent += ` and have the Activity <strong>${antecedentTypeActivity.label}</strong>`;
    }
    if (ConstraintTypesValueTypes.AUTHORIZATION) {
      location_and_activity_antecedent += ` for the Activity <strong>${antecedentTypeActivity.label}</strong>`;
    } else {
      location_and_activity_antecedent += `for Appointments that have the Activity <strong>${antecedentTypeActivity.label}</strong>`;
    }
  }

  let cUsers: any = [];
  if (consequenceTypeUser) {
    cUsers = [...cUsers, consequenceTypeUser];
  }
  if (consequenceTypeLocation) {
    cUsers = [...cUsers, consequenceTypeLocation];
  }
  if (consequenceTypeActivity) {
    cUsers = [...cUsers, consequenceTypeActivity];
  }

  let description: string = '';
  let minMax = `<strong>${min}</strong> and <strong>${max}</strong>`;
  let min_description = `<strong>${min}</strong>`;
  let max_description = `<strong>${max}</strong>`;

  if (ConstraintTypesValueTypes.GAPS == constraintType?.value) {
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(aUsers);
    } else {
      description += rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        '',
      );
    }
    description += 'can have ';
    description +=
      noLimit && max != 0
        ? `a max ${max_description} ${units?.value} of gaps `
        : ' no gaps';
    description += ' in their schedule with sessions that have ';
    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(cUsers);
    } else {
      description += rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        '',
      );
    }
  }

  if (ConstraintTypesValueTypes.BACKTOBACK == constraintType?.value) {
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(aUsers);
    } else {
      description += rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        '',
      );
    }
    description += 'cannot have a ';
    //description += noLimit ? `between ${minMax} minutes of gaps ` : ' no gaps';
    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(cUsers);
    } else {
      description += rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        '',
      );
    }
    description += ' back to back ';
  }

  if (ConstraintTypesValueTypes.PRIORITY == constraintType?.value) {
    description += 'If';
    let person_a = '';
    let person_c = '';

    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      person_c = arrayOrBlank(cUsers);
    } else {
      person_c = rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        '',
      );
    }
    description += `${person_c} is available for `;
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      person_a = arrayOrBlank(aUsers);
    } else {
      person_a = rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        '',
      );
    }
    //description += noLimit ? `between ${minMax} minutes of gaps ` : ' no gaps';

    description += `${person_a} then ${person_c} is ranked priority ${max_description}`;
  }

  if (ConstraintTypesValueTypes.BREAKQUANTITY == constraintType?.value) {
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(aUsers);
    } else {
      description += rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        '',
      );
    }
    description += 'must have ';
    description += `${min_description} appointment that has`;
    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(cUsers);
    } else {
      description += rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        '',
      );
    }
    description += ` after ${max_description} ${units?.value} of working `;
  }

  if (ConstraintTypesValueTypes.DRIVE == constraintType?.value) {
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(aUsers);
    } else {
      description += rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        '',
      );
    }
    description += 'cannot drive more than ';
    description += `${max_description} minutes from one appointment to another that have`;
    description += ' in their schedule with sessions that have ';
    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(cUsers);
    } else {
      description += rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        '',
      );
    }
  }

  if (ConstraintTypesValueTypes.DISTANCE == constraintType?.value) {
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(aUsers);
    } else {
      description += rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        '',
      );
    }
    description += 'cannot drive more than ';
    description += `${max_description} miles from one appointment to another that have`;
    description += ' in their schedule with sessions that have ';
    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(cUsers);
    } else {
      description += rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        '',
      );
    }
  }

  if (ConstraintTypesValueTypes.AUTHORIZATION == constraintType?.value) {
    let c_user = '';
    let a_user = '';
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      a_user = arrayOrBlank(aUsers);
    } else {
      a_user = rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        '',
      );
    }

    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      c_user = arrayOrBlank(cUsers);
    } else {
      c_user = rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        '',
      );
    }
    description += `${a_user} has the following authorization ${location_and_activity_antecedent} : ${min_description} ${units?.value} a week with a total of ${max_description} ${units?.value}`;

    description += ` from ${full_date}`;
  }

  if (ConstraintTypesValueTypes.GROUPING == constraintType?.value) {
    description =
      constraintType?.value === ConstraintTypesValueTypes.GROUPING
        ? 'If'
        : //'If an appointment contains';
          '';
    //'If the appointment is with';

    // Antecedent Type - Specific User
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      // description += specificUserText(antecedentTypeUsers);
      description += arrayOrBlank(aUsers);
    }
    // Antecedent Type - Roles / Subgroups
    if (
      antecedentType.value ===
      AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS
    ) {
      description += rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        'a',
      );
      description += ' and ';
      description += rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        'a',
      );
      description += 'are in the same appointment ';
    }

    // Matching or Unmatching
    const requirement = [
      ConstraintTypesValueTypes.MATCHING,
      ConstraintTypesValueTypes.GROUPING,
    ].includes(constraintType?.value)
      ? '<strong>must</strong>'
      : '<strong>cannot</strong>';

    // Groupings for only Antecedent Type Specific Users
    let amount = grouping?.label || '_____';
    let have = 'have a ';
    //${noLimit ? `between ${minMax}` : ''}
    if (all) {
      description += `then that ${rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        '',
      )} ${requirement} have all ${rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        '',
      )} <strong>${amount}</strong>`;
    } else {
      description += `then ${rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        '',
      )} and ${rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        '',
      )} ${requirement} have a <strong>${amount}</strong> in common`;
    }
  }

  // Matching or Unmatching or Grouping
  if (
    [
      ConstraintTypesValueTypes.MATCHING,
      ConstraintTypesValueTypes.UNMATCHING,
    ].includes(constraintType?.value)
  ) {
    description = '';
    // Antecedent Type - Specific User
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      // description += specificUserText(antecedentTypeUsers);
      description += arrayOrBlank(aUsers);
    }
    // Antecedent Type - Roles / Subgroups
    if (
      antecedentType.value ===
      AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS
    ) {
      description += rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        'A',
      );
    }

    // Matching or Unmatching
    const requirement = [ConstraintTypesValueTypes.MATCHING].includes(
      constraintType?.value,
    )
      ? '<strong>must</strong>'
      : '<strong>cannot</strong>';

    //description += ` then it ${requirement} have `;
    description += `  ${requirement} have `;
    description += noLimit ? `between ${minMax} users that are ` : '';
    // Consequence Type - Specific User
    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      description += arrayOrBlank(cUsers);
    }
    // Consequence Type - Roles / Subgroups
    if (
      consequenceType.value ===
      AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS
    ) {
      description += rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        'a',
      );
    }
  }
  // Time or User to user
  if (
    [
      ConstraintTypesValueTypes.TIME,
      ConstraintTypesValueTypes.USER_TO_USER,
      ConstraintTypesValueTypes.USER_TO_SESSION,
    ].includes(constraintType?.value)
  ) {
    // Antecedent Type - Specific User
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      // description += specificUserText(antecedentTypeUsers);
      description += arrayOrBlank(aUsers);
    }
    // Antecedent Type - Roles / Subgroups
    if (
      antecedentType.value ===
      AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS
    ) {
      description += rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        'A',
        '',
      );
    }

    let amount = 'times';
    if (constraintType?.value === ConstraintTypesValueTypes.TIME) {
      amount = units?.value === 'percentage' ? '%' : units?.value;
    }
    if (constraintType?.value === ConstraintTypesValueTypes.USER_TO_SESSION) {
      amount = 'sessions';
    }

    // Consequence Type - Specific User
    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      let prefix = 'can work with ';
      let postfix = noLimit
        ? `between ${minMax} <strong>${amount} ${frequency?.label}</strong>`
        : '';
      description += arrayOrBlank(cUsers, prefix, postfix);
    }

    // Consequence Type - Roles / Subgroups
    if (
      consequenceType.value ===
      AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS
    ) {
      // For user to user constraint
      if (ConstraintTypesValueTypes.USER_TO_USER == constraintType?.value) {
        description += ' can work with';
        description += noLimit ? ` between ${minMax}` : '';
        let postfix = `<strong>${frequency?.label} </strong>`;
        description += rolesAndSubgroupsText(
          consequenceTypeRole,
          consequenceTypeSubgroup,
          'users that are ',
          // consequenceTypeEachOrAll?.value === EachOrAllTypes.EACH ? 'each':'all',
          '',
        );

        // if ([
        //     ConstraintTypesValueTypes.USER_TO_SESSION,
        //     ConstraintTypesValueTypes.TIME,
        //   ].includes(constraintType?.value)) {
        //   if (consequenceTypeEachOrAll?.value === EachOrAllTypes.EACH) {
        //     description += ` <strong>${amount}</strong> `;
        //     //description += `with each user that is `;
        //   } else {
        //     description += ` <strong>${amount}</strong> `;
        //     //description +=  `with all users that are `
        //   }
        // } else {
        //  // description += ` that are `;
        //  //description += ` times `;
        // }
        description += postfix;
      } else {
        description += ' can work with';
        if (constraintType?.value === ConstraintTypesValueTypes.USER_TO_USER) {
          //description += `with `;
        }
        let postfix = `<strong>${frequency?.label} </strong>`;
        description += rolesAndSubgroupsText(
          consequenceTypeRole,
          consequenceTypeSubgroup,
          consequenceTypeEachOrAll?.value === EachOrAllTypes.EACH
            ? 'each'
            : 'all',
          '',
        );
        description += noLimit ? `between ${minMax}` : '';
        if (
          [
            ConstraintTypesValueTypes.USER_TO_SESSION,
            ConstraintTypesValueTypes.TIME,
          ].includes(constraintType?.value)
        ) {
          if (consequenceTypeEachOrAll?.value === EachOrAllTypes.EACH) {
            description += ` <strong>${amount}</strong> `;
            //description += `with each user that is `;
          } else {
            description += ` <strong>${amount}</strong> `;
            //description +=  `with all users that are `
          }
        } else {
          // description += ` that are `;
          description += ` times `;
        }
        description += postfix;
      }
    }
  }
  if (
    [ConstraintTypesValueTypes.SESSION_LENGTH].includes(constraintType?.value)
  ) {
    // Antecedent Type - Specific User
    if (
      antecedentType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      // description += specificUserText(antecedentTypeUsers);
      description += arrayOrBlank(aUsers);
    }
    // Antecedent Type - Roles / Subgroups
    if (
      antecedentType.value ===
      AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS
    ) {
      description += rolesAndSubgroupsText(
        antecedentTypeRole,
        antecedentTypeSubgroup,
        'A',
        '',
      );
    }

    let amount = 'times';
    amount = units?.value;
    // Consequence Type - Specific User
    if (
      consequenceType.value === AntecedentAndConsequenceTypeTypes.SPECIFIC_USER
    ) {
      let prefix = 'can work with ';
      let postfix = noLimit
        ? `between ${minMax} <strong>${amount} per session</strong>`
        : '';
      description += arrayOrBlank(cUsers, prefix, postfix);
    }

    // Consequence Type - Roles / Subgroups
    if (
      consequenceType.value ===
      AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS
    ) {
      description += ' can work with';
      if (constraintType?.value === ConstraintTypesValueTypes.USER_TO_USER) {
        //description += `with `;
      }
      let postfix = `<strong>per session </strong>`;
      description += rolesAndSubgroupsText(
        consequenceTypeRole,
        consequenceTypeSubgroup,
        consequenceTypeEachOrAll?.value === EachOrAllTypes.EACH
          ? 'each'
          : 'all',
        '',
      );
      description += noLimit ? `between ${minMax}` : '';
      if (consequenceTypeEachOrAll?.value === EachOrAllTypes.EACH) {
        description += ` <strong>${amount}</strong> `;
        //description += `with each user that is `;
      } else {
        description += ` <strong>${amount}</strong> `;
        //description +=  `with all users that are `
      }

      description += postfix;
    }
  }
  if (ConstraintTypesValueTypes.AUTHORIZATION !== constraintType?.value) {
    description += location_and_activity_antecedent;
    description += forever ? `. Valid forever` : `. Valid from ${full_date}`;
  }
  return description;
};

export default generateDescription;
