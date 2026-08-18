import {
  ROLES_TAGS_BRANCHES,
  ANTECEDENT_AND_CONSEQUENCE_TYPES,
  CONSTRAINT_TYPES,
  DAY_SELECTION_OPTIONS,
  EACH_OR_ALL_OPTIONS,
  FREQUENCY_OPTIONS,
  UNITS_OPTIONS,
} from '../helpers/customTypes';
import {
  getArray,
  getObject,
  getSelectedBranches,
} from '../helpers/formatDifferentData';
import IniValues from 'components/FormItems/iniValues';
import customFields from '../helpers/customFields';
import moment from 'moment';

export const customConstraintInitialValues = {
  constraintType: { label: '', value: '' },
  description: '',
  grouping: null,
  branches: [],
  // antecedent
  antecedentType: ANTECEDENT_AND_CONSEQUENCE_TYPES[0],
  antecedentType2: [ROLES_TAGS_BRANCHES[0]],
  antecedentTypeUser: null,
  antecedentTypeLocation: null,
  antecedentTypeActivity: null,
  antecedentTypeRole: null,
  antecedentTypeSubgroup: null,
  antecedentTypeDaySelection: DAY_SELECTION_OPTIONS[0],
  // consequence
  consequenceType: ANTECEDENT_AND_CONSEQUENCE_TYPES[0],
  consequenceType2: [ROLES_TAGS_BRANCHES[0]],
  consequenceTypeUser: null,
  consequenceTypeLocation: null,
  consequenceTypeActivity: null,
  consequenceTypeRole: null,
  consequenceTypeSubgroup: null,
  consequenceTypeDaySelection: DAY_SELECTION_OPTIONS[0],
  consequenceTypeEachOrAll: EACH_OR_ALL_OPTIONS[0],
  //
  min: 0,
  max: 1,
  weight: 1,
  offset: 0,
  frequency: FREQUENCY_OPTIONS[0],
  start: moment().toDate(),
  end: moment().add(1, 'day').toDate(),
  disabled: false,
  all: false,
  soft: false,
  noLimit: false,
  tag1: false,
  tag2: false,
  location1: false,
  location2: false,
  activity1: false,
  activity2: false,
  forever: false,
  isBranchesActive: false,
  units: UNITS_OPTIONS[4],
  rollover: false,
  fromHome: false,
};

const initializeCustomConstraintValues = (
  record: any,
  selectOptionsObj: any,
) => {
  const {
    groupings,
    // users,
    branches,
    weekdays,
    locations,
    activities,
    subgroups,
    roles,
  } = selectOptionsObj;
  if (record && Object.keys(record).length > 0) {
    let location1 = record?.antecedentLocation ? true : false;
    let location2 = record?.consequenceLocation ? true : false;
    let tag1 = record?.antecedentSubgroup ? true : false;
    let tag2 = record?.consequenceSubgroup ? true : false;
    let activity1 = record?.antecedentTypeActivityId ? true : false;
    let activity2 = record?.consequenceTypeActivityId ? true : false;
    let isBranchesActive =
      Array.isArray(record?.branches) && record.branches.length > 0
        ? true
        : false;

    const forever = record?.start === '1970-01-01';
    const antecedentTypeUser = record.antecedentUser
      ? {
          value: record.antecedentUser?.id,
          label: `${record.antecedentUser.firstName} ${record.antecedentUser?.lastName ?? ''}`,
        }
      : null;
    const consequenceTypeUser = record.consequenceUser
      ? {
          value: record.consequenceUser?.id,
          label: `${record.consequenceUser.firstName} ${record.consequenceUser?.lastName ?? ''}`,
        }
      : null;
    return {
      ...IniValues(customFields, record),
      // Objects
      constraintType: getObject(CONSTRAINT_TYPES, record?.constraintType),
      grouping: getObject(groupings, record?.grouping?.id),
      antecedentType: getObject(
        ANTECEDENT_AND_CONSEQUENCE_TYPES,
        record?.antecedentType,
      ),
      antecedentType2: [
        getObject(ROLES_TAGS_BRANCHES, record?.antecedentType2),
      ],
      antecedentTypeDaySelection: getObject(
        DAY_SELECTION_OPTIONS,
        record?.antecedentTypeDaySelection,
      ),
      consequenceType: getObject(
        ANTECEDENT_AND_CONSEQUENCE_TYPES,
        record?.consequenceType,
      ),
      consequenceType2: [
        getObject(ROLES_TAGS_BRANCHES, record?.consequenceType2),
      ],
      consequenceTypeDaySelection: getObject(
        DAY_SELECTION_OPTIONS,
        record?.consequenceTypeDaySelection,
      ),
      consequenceTypeEachOrAll: getObject(
        EACH_OR_ALL_OPTIONS,
        record?.consequenceTypeEachOrAll,
      ),
      branches: getSelectedBranches(branches, record?.branches),
      frequency: getObject(FREQUENCY_OPTIONS, record?.frequency),
      // Arrays
      antecedentTypeUser,
      antecedentTypeLocation: getObject(
        locations,
        record?.antecedentLocation?.id,
      ),
      antecedentTypeActivity: getObject(
        activities,
        record?.antecedentTypeActivityId,
      ),
      antecedentTypeRole: getObject(roles, record?.antecedentRole?.id),
      antecedentTypeSubgroup: getObject(
        subgroups,
        record?.antecedentSubgroup?.id,
      ),

      consequenceTypeUser,
      consequenceTypeLocation: getObject(
        locations,
        record?.consequenceLocation?.id,
      ),
      consequenceTypeActivity: getObject(
        activities,
        record?.consequenceTypeActivityId,
      ),
      consequenceTypeRole: getObject(roles, record?.consequenceRole?.id),
      consequenceTypeSubgroup: getObject(
        subgroups,
        record?.consequenceSubgroup?.id,
      ),
      location1,
      location2,
      tag1,
      tag2,
      forever,
      activity1,
      activity2,
      isBranchesActive,
      units: getObject(UNITS_OPTIONS, record?.units),
    };
  }
  return customConstraintInitialValues;
};

export default initializeCustomConstraintValues;
