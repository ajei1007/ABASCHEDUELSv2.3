import { Formik } from 'formik';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import usersFields from 'pages/CRUD/Users/helpers/usersFields';
import IniValues from 'components/FormItems/iniValues';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { useAppSelector } from 'store/hooks';
import availabilitiesFields from 'pages/CRUD/Availabilities/helpers/availabilitiesFields';
import prioritiesFields from 'pages/CRUD/Priorities/helpers/prioritiesFields';
import { userUnmatchingFields } from '../helpers/userUnmatchingFields';
import UserInformationForm from './FormGroups/UserInformationForm';
import GroupsForm from './FormGroups/GroupsForm';
import AvailabilitiesFormGroup from './FormGroups/AvailabilitiesFormGroup';
import userGroupingsFields from '../helpers/userGroupingsFields';
import PreparedValues from 'components/FormItems/preparedValues';
import { ScrollToFieldError } from './ScrollToFieldError';
import userFormValidationSchema from '../helpers/userFormValidationSchema';
import _ from 'lodash';
import role_hierarchy from 'helpers/role_hierarchy';
import { useGeolocation } from 'hooks/useGeolocation';
import formatAvailabilities from 'pages/CRUD/Availabilities/helpers/formatAvailabilities';
import { getTimezoneObjectFromValue } from 'utils/timezones';
import FormActions from 'pages/CRUD/components/FormActions';
import { type FormEvent, useMemo, useState } from 'react';
import { backgroundColorArray, borderColorArray } from 'constants/color';
import initializeCustomConstraintValues, {
  customConstraintInitialValues,
} from '../../CustomConstraints/helpers/initializeCustomConstraintValues';
import generateDescription from 'pages/CRUD/CustomConstraints/helpers/generateDescription';
import customFields from 'pages/CRUD/CustomConstraints/helpers/customFields';
import moment from 'moment';
import MatchingUnmatchingPriority from './FormGroups/MatchingUnmatchingPriority';
import PriorityConstraint from './FormGroups/PriorityConstraint';
import AuthorizationConstraint from './FormGroups/AuthorizationConstraint';
import {
  CONSTRAINT_TYPES,
  ConstraintTypesValueTypes,
} from 'pages/CRUD/CustomConstraints/helpers/customTypes';
import convertTZ from 'utils/convertTZ';
import daysOfWeek from 'constants/daysOfWeek';
import {
  intervalOptions,
  frequencyOptions,
  weekNumberOptions,
} from 'constants/recurrenceOptions';
import { v4 as uuidv4 } from 'uuid';
// import CustomConstraintsList from './FormGroups/CustomConstraintsList';

type UsersFormProps = {
  id?: string;
  isEditing: boolean;
  saveLoading: boolean;
  resource_type: any;
  record: {
    [rest: string]: any;
  };
  onSubmit: Function;
  onCancel: Function;
  modal?: any;
  currentUser?: any;
  users?: any;
  roles?: any;
  locations?: any;
  activities?: any;
  subgroups?: any;
  branches?: any;
  weekdays?: any;
  groupings?: any;
  branchParentHierarchyMap: Record<string, Set<string>>;
  immutable?: boolean;
};

const makeConstraintObj = (constraint: any, data: any) => {
  // @ts-ignore
  const { id: constraintId, ...constraintData } = PreparedValues(
    customFields,
    constraint || {},
  );
  const description = generateDescription({
    ...constraint,
    antecedentTypeUser: {
      // @ts-ignore
      label: `${data.firstName} ${data.lastName || ''}`,
    },
  });

  if (constraint.forever) {
    // @ts-ignore
    constraintData.start = '1970-01-01';
    // @ts-ignore
    constraintData.end = '2200-01-01';
  } else {
    // @ts-ignore
    constraintData.start = moment(constraint.start).format('YYYY-MM-DD');
    // @ts-ignore
    constraintData.end = moment(constraint.end).format('YYYY-MM-DD');
  }

  const constrObj = {
    ...constraintData,
    id: constraintId,
    description,
  };
  return constrObj;
};

// Matching
const convertMatchingUnmatchingIntoConstraint = (data: any) => {
  let matchingUnmatchingConstraints: any = [];
  const { matchingUnmatching } = data;

  // Matching
  // const matchingUsers = matchingUnmatching.matching;
  // for (const user of matchingUsers) {
  //   const constraint = {
  //     ...customConstraintInitialValues,
  //     constraintType: CONSTRAINT_TYPES.find(
  //       (ct) => ct.value === ConstraintTypesValueTypes.MATCHING,
  //     ),
  //     consequenceTypeUser: {
  //       ...user,
  //       id: user.value,
  //     },
  //     soft: user.soft ?? false,
  //     id: user.id ?? null,
  //     forever: true,
  //   };
  //   const constraintObj = makeConstraintObj(constraint, data);
  //   matchingUnmatchingConstraints = [...matchingUnmatchingConstraints, constraintObj];
  // }

  // Unmatching
  const unmatchingUsers = matchingUnmatching.unmatching;
  for (const user of unmatchingUsers) {
    const constraint = {
      ...customConstraintInitialValues,
      constraintType: CONSTRAINT_TYPES.find(
        (ct) => ct.value === ConstraintTypesValueTypes.UNMATCHING,
      ),
      consequenceTypeUser: {
        ...user,
        id: user.value,
      },
      soft: user.soft ?? false,
      id: user.id ?? null,
      forever: true,
    };
    const constraintObj = makeConstraintObj(constraint, data);
    matchingUnmatchingConstraints = [
      ...matchingUnmatchingConstraints,
      constraintObj,
    ];
  }

  return matchingUnmatchingConstraints;
};
const convertConstraintIntoMatchingUnmatching = (constraints: any) => {
  let matching: any = [];
  let unmatching: any = [];
  constraints.forEach((c: any) => {
    // const user = users.find((usr: any) => usr.value === c.consequenceUser.id);
    if (
      (c.constraintType === ConstraintTypesValueTypes.MATCHING ||
        c.constraintType === ConstraintTypesValueTypes.UNMATCHING) &&
      c.consequenceUser
    ) {
      const user = {
        value: c.consequenceUser.id,
        label: `${c.consequenceUser.firstName} ${
          c.consequenceUser.lastName ?? ''
        }`,
      };
      if (c.constraintType === ConstraintTypesValueTypes.MATCHING) {
        matching = [...matching, { ...user, id: c.id, soft: c.soft ?? false }];
      }
      if (c.constraintType === ConstraintTypesValueTypes.UNMATCHING) {
        unmatching = [
          ...unmatching,
          { ...user, id: c.id, soft: c.soft ?? false },
        ];
      }
    }
  });
  return {
    matching,
    unmatching,
  };
};
// Priority
const convertPriorityIntoConstraint = (data: any) => {
  let priorityConstraints: any = [];
  const { priorityUsers } = data;

  let ranking = 0;
  for (const user of priorityUsers) {
    ranking++;
    const constraint = {
      ...customConstraintInitialValues,
      constraintType: CONSTRAINT_TYPES.find(
        (ct) => ct.value === ConstraintTypesValueTypes.PRIORITY,
      ),
      consequenceTypeUser: {
        ...user,
        id: user.value,
      },
      id: user.id ?? null,
      max: ranking,
      forever: true,
    };
    const constraintObj = makeConstraintObj(constraint, data);
    priorityConstraints = [...priorityConstraints, constraintObj];
  }

  return priorityConstraints;
};
const convertConstraintIntoPriority = (constraints: any) => {
  let priorities: any = [];
  constraints.forEach((c: any) => {
    // const user = users.find((usr: any) => usr.value === c.consequenceUser.id);
    if (
      c.constraintType === ConstraintTypesValueTypes.PRIORITY &&
      c.consequenceUser
    ) {
      const user = {
        value: c.consequenceUser.id,
        label: `${c.consequenceUser.firstName} ${
          c.consequenceUser.lastName ?? ''
        }`,
      };
      priorities = [...priorities, { ...user, id: c.id, max: c.max }];
    }
  });
  priorities.sort((a: any, b: any) => a.max - b.max);
  return priorities;
};
// Authorization
const convertAuthorizationIntoConstraint = (data: any) => {
  const { authorizations }: any = data;

  let authorizationConstraints: any = [];
  if (authorizations && authorizations.length) {
    for (const authorization of authorizations) {
      const constraint = {
        ...authorization,
        constraintType: CONSTRAINT_TYPES.find(
          (ct) => ct.value === ConstraintTypesValueTypes.AUTHORIZATION,
        ),
      };
      authorizationConstraints = [
        ...authorizationConstraints,
        makeConstraintObj(constraint, data),
      ];
    }
  }
  return authorizationConstraints;
};

const UsersForm = (props: UsersFormProps) => {
  const store = useTypedSelector((state: any) => state.calendar);
  const settingsCompany = useAppSelector(
    (state) => state.settings.settingsCompany,
  );
  const storeSettings = useTypedSelector((state: any) => state.settings);
  const {
    id,
    isEditing,
    saveLoading,
    record,
    onSubmit,
    onCancel,
    modal,
    resource_type,
    users,
    locations,
    activities,
    roles,
    subgroups,
    branches,
    weekdays,
    groupings,
    currentUser,
    branchParentHierarchyMap,
    immutable,
  } = props;

  const { getLatLonFromAddress } = useGeolocation();

  const handleSubmit = async (values: { [rest: string]: any }) => {
    const updatedValues = {
      ...values,
      color: values?.color?.value || null,
      borderColor: values?.borderColor?.value || null,
    };
    // @ts-ignore
    const preparedValues = PreparedValues(
      { ...usersFields },
      updatedValues || {},
    );
    const { id, ...data }: any = preparedValues;
    if (values.groupings) {
      // Prepare subgroups
      data.subgroups = values.groupings
        .filter((group: any) => group.subgroup && group.subgroup.length > 0)
        .map((group: any) => group.subgroup.map((s: any) => s.id))
        .flat();
    }

    // Prepare availabilities
    data.availabilities =
      values.availabilities && values.availabilities.length > 0
        ? values.availabilities.map((av: any) => formatAvailabilities(av))
        : [];
    data.deletedAvailabilities = values.deletedAvailabilities || [];

    // Resource
    data.resourceName = resource_type || '';
    // Get Latitude and Lon

    const addressText = data.address?.label ?? null;
    if (addressText) {
      data.address = addressText;
      const geoLocation = await getLatLonFromAddress(addressText);
      if (geoLocation) {
        const { lat, lng } = geoLocation;
        data.longitude = lng;
        data.latitude = lat;
      }
    }

    const isLocation = resource_type === 'Location';

    if (isLocation) {
      let emailCandidate = '';
      if (data.email) {
        if (typeof data.email === 'object' && data.email.label) {
          emailCandidate = data.email.label;
        } else if (typeof data.email === 'string') {
          emailCandidate = data.email;
        }
      }

      const emailFromData = String(emailCandidate).trim();
      if (!record.id) {
        data.email =
          emailFromData !== ''
            ? emailFromData
            : `location_${uuidv4()}@mail.com`;
      } else {
        data.email = emailFromData !== '' ? emailFromData : record.email;
      }
    }

    // // @ts-ignore
    // data.unmatching =
    //   values.unmatching && values.unmatching.length > 0
    //     ? values.unmatching.map((un: any) =>
    //         PreparedValues(userUnmatchingFields, un || {}),
    //       )
    //     : [];
    // //@ts-ignore
    // data.deleteUnmatching = values.deleteUnmatching || [];

    // // Prepare priorities
    // // @ts-ignore
    // data.priorities =
    //   values.priorities && values.priorities.length > 0
    //     ? values.priorities.map((pr: any) =>
    //         PreparedValues(prioritiesFields, pr || {}),
    //       )
    //     : [];
    // // @ts-ignore
    // data.deletedPriorities = values.deletedPriorities || [];

    // // Prepare priorities
    // // @ts-ignore
    // data.timeconstraints =
    //   values.timeconstraints && values.timeconstraints.length > 0
    //     ? values.timeconstraints.map((tr: any) =>
    //         PreparedValues(timeconstraintsFields, tr || {}),
    //       )
    //     : [];
    // // @ts-ignore
    // data.deletedTimeConstrains = values.deletedTimeConstrains || [];

    // let updatedConstraints: any = [];
    // // @ts-ignore
    // const constraints: any = updatedValues.constraints;
    // if (constraints?.length) {
    //   for (const constraint of constraints) {
    //     updatedConstraints = [...updatedConstraints, makeConstraintObj(constraint, data)];
    //   }
    //   // @ts-ignore
    //   data.constraints = updatedConstraints;
    // }
    // // @ts-ignore
    // if (updatedValues.deletedConstraints) {
    //   // @ts-ignore
    //   data.deletedConstraints = updatedValues.deletedConstraints;
    // }

    if (resource_type === 'Employee' || resource_type === 'Client') {
      //** Prepare constraints */
      data.constraints = convertMatchingUnmatchingIntoConstraint(values);
      data.constraints = [
        ...data.constraints,
        ...convertPriorityIntoConstraint(values),
      ];
      data.constraints = [
        ...data.constraints,
        ...convertAuthorizationIntoConstraint(values),
      ];

      // Deleted constraints
      if (data.constraints && record.constraints?.length) {
        const existingConstraintIds = record.constraints.map((c: any) => c.id);
        const updatedConstraintIds = data.constraints
          .filter((c: any) => c.id)
          .map((c: any) => c.id);
        const deletedConstraints = existingConstraintIds.filter(
          (id: any) => !updatedConstraintIds.includes(id),
        );
        data.deletedConstraints = deletedConstraints;
      }
    }

    if (values?.matchingUnmatching?.matching) {
      // Collect all matching
      data.matchingUsers = values.matchingUnmatching.matching.map(
        (u: any) => u.value,
      );
    }
    data.matchingSoft = values.matchingSoft;
    onSubmit(id, data, false);
  };

  const iniValues = useMemo(() => {
    const filteredGroupings = groupings.filter((group: any) => {
      if (
        group.label === 'Gender' ||
        group.label === 'Funders' ||
        group.label === 'Funder' ||
        group.label === 'Matching'
      )
        return false;
      let isValidGroup = false;
      if (group.roles && group.roles.length) {
        const findCurrentResourceRoleIndex = group.roles.findIndex(
          (role: any) =>
            role_hierarchy(
              store['frontend_roles_hierarchy'],
              resource_type,
              role.name,
            ),
        );
        if (findCurrentResourceRoleIndex !== -1) isValidGroup = true;
      }
      return isValidGroup;
    });

    const colorHex = record?.color;
    const borderColorHex = record?.borderColor;

    const color = colorHex
      ? backgroundColorArray.find(
          (c) => c.value === colorHex || c.name === colorHex,
        ) || null
      : null;

    const borderColor = borderColorHex
      ? borderColorArray.find(
          (c) => c.name === borderColorHex || c.value === borderColorHex,
        ) || null
      : null;

    const constraints =
      record?.constraints?.length > 0
        ? record.constraints.map((constraint: any) =>
            initializeCustomConstraintValues(constraint, {
              groupings,
              users,
              branches,
              weekdays,
              locations,
              subgroups,
              roles,
              activities,
            }),
          )
        : [];

    const matchingUnmatching = record?.constraints
      ? convertConstraintIntoMatchingUnmatching(record.constraints)
      : {
          matching: [],
          unmatching: [],
        };

    const matchingSoft = record?.matchingGroup?.soft || false;

    const matching =
      record?.matchingGroup?.users?.map((user: any) => ({
        value: user.id,
        label: `${user?.firstName} ${user?.lastName}`,
        soft: matchingSoft,
      })) || [];

    matchingUnmatching.matching = matching;

    const priorityUsers = record?.constraints
      ? convertConstraintIntoPriority(record.constraints)
      : [];

    const authorizations =
      record?.constraints?.length > 0
        ? record.constraints
            .filter(
              (c: any) =>
                c.constraintType === ConstraintTypesValueTypes.AUTHORIZATION,
            )
            .map((authorization: any) =>
              initializeCustomConstraintValues(authorization, {
                groupings,
                users,
                branches,
                weekdays,
                locations,
                subgroups,
                roles,
                activities,
              }),
            )
        : [];

    const sAddress = record?.address;
    const address = sAddress ? { label: sAddress, value: sAddress } : null;

    const initAvailabilities =
      resource_type === 'Activity' ||
      resource_type === 'Funder' ||
      resource_type === 'Location'
        ? [
            IniValues(availabilitiesFields, {
              timezone: getTimezoneObjectFromValue(
                storeSettings?.settingValues?.timezone,
              ),
              startTime: moment('05:00', 'HH:mm').format(),
              endTime: moment('20:00', 'HH:mm').format(),
              days: daysOfWeek,
              startRange: moment('01-01-2000', 'MM-DD-YYYY').format(),
              endRange: moment('01-01-2300', 'MM-DD-YYYY').format(),
              interval: intervalOptions.find((e) => e.value === '1'),
              frequency: frequencyOptions.find((e) => e.value === 'Weekly'),
              bysetpos: weekNumberOptions.find((e) => e.value === '1'),
              forever: record?.startRange === '2000-01-01',
              allDay: false,
              everyDay: false,
            }),
          ]
        : [];

    let selectedBranches = record?.branches;
    if (resource_type === 'Activity' && !record?.branches) {
      selectedBranches = branches?.[0] ? [branches?.[0]] : null;
    }

    return {
      ...IniValues(
        { ...usersFields },
        {
          ...record,
          branches: selectedBranches,
          roles: record?.roles?.[0],
          address,
        },
      ),
      ...(filteredGroupings.length && {
        groupings: filteredGroupings.map((group: any) => {
          const subgroupsOfGroupings = record.subgroups?.filter(
            (sb: any) => sb.groupId === group.id,
          );
          const subgroup =
            subgroupsOfGroupings?.length > 0
              ? subgroupsOfGroupings.map((sb: any) => ({
                  id: sb.id,
                  label: sb.name,
                }))
              : '';
          return IniValues(userGroupingsFields, { ...group, subgroup });
        }),
      }),
      constraints,
      authorizations,
      matchingUnmatching,
      matchingSoft,
      priorityUsers,
      availabilities:
        record.availabilities?.length > 0
          ? record.availabilities.map((av: any) => {
              const updatedLocation2 = av.location2.map((location: any) => ({
                id: location.id,
                label: location.firstName,
              }));

              const timezone = getTimezoneObjectFromValue(
                av?.timezone ?? storeSettings?.settingValues?.timezone,
              );
              const forever = av?.startRange === '2000-01-01' ? true : false;
              const startRange = av?.endRange
                ? forever
                  ? moment().format('YYYY-MM-DD')
                  : av?.startRange
                : moment().format('YYYY-MM-DD');
              const endRange = av?.endRange
                ? forever
                  ? moment().format('YYYY-MM-DD')
                  : moment(av.endRange).subtract(1, 'day').format('YYYY-MM-DD')
                : moment().add('5', 'years').format('YYYY-MM-DD');

              const fmt = (d: any) =>
                moment.tz(d, timezone?.value).format('HH:mm');

              const allDay =
                av?.allDay ??
                (av.startTime &&
                  av.endTime &&
                  fmt(av.startTime) === '05:00' &&
                  fmt(av.endTime) === '22:00');

              const everyDay =
                av?.everyDay ??
                (Array.isArray(av?.days) && av.days.length === 7);

              return IniValues(availabilitiesFields, {
                ...av,
                startTime: convertTZ(av.startTime, timezone?.value),
                endTime: convertTZ(av.endTime, timezone?.value),
                location2: updatedLocation2,
                startRange,
                endRange,
                interval: av?.interval
                  ? intervalOptions.find((e) => e.value === String(av.interval))
                  : intervalOptions.find((e) => e.value === '1'),
                frequency: av?.frequency
                  ? frequencyOptions.find((e) => e.value === av.frequency)
                  : frequencyOptions.find((e) => e.value === 'Weekly'),
                bysetpos: av?.bysetpos
                  ? weekNumberOptions.find((e) => e.value === av.bysetpos)
                  : weekNumberOptions.find((e) => e.value === '1'),
                timezone,
                forever,
                allDay,
                everyDay,
              });
            })
          : initAvailabilities,
      priorities:
        record.priorities?.length > 0
          ? record.priorities.map((pr: any) => {
              const updatedUser2 = {
                id: pr.user2.id,
                label: pr.user2.firstName,
              };
              return IniValues(prioritiesFields, {
                ...pr,
                user2: updatedUser2,
              });
            })
          : [],
      unmatching:
        record?.unmatching?.length > 0
          ? record.unmatching.map((un: any) => {
              const unmatching = {
                id: un.id,
                label: un.label,
              };
              return IniValues(userUnmatchingFields, [...un, unmatching]);
            })
          : [],
      color,
      borderColor,
      siblingGroupId: record?.siblingGroupId,
    };
  }, [
    groupings,
    record,
    resource_type,
    storeSettings?.settingValues?.timezone,
    store,
    users,
    branches,
    weekdays,
    locations,
    subgroups,
    roles,
    activities,
  ]);

  const [expandedPanels, setExpandedPanels] = useState({
    userInfo: true, // initially open if desired
    availabilities: false,
    authorizations: false,
  });

  const openAccordionForField = (fieldName: string[]) => {
    if (fieldName.includes('availabilities')) {
      setExpandedPanels((prev) => ({ ...prev, availabilities: true }));
    }
    if (fieldName.includes('authorizations')) {
      setExpandedPanels((prev) => ({ ...prev, authorizations: true }));
    }
    if (fieldName.length) {
      setExpandedPanels((prev) => ({ ...prev, userInfo: true }));
    }
  };
  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={iniValues}
      enableReinitialize
      validationSchema={userFormValidationSchema(
        resource_type,
        isEditing,
        settingsCompany,
      )}
    >
      {(form) => {
        return (
          <form>
            <ScrollToFieldError openAccordionForField={openAccordionForField} />
            {/* User Informations */}
            <Accordion
              className='accordion-item'
              expanded={expandedPanels.userInfo}
              onChange={() =>
                setExpandedPanels((prev) => ({
                  ...prev,
                  userInfo: !prev.userInfo,
                }))
              }
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel1a-content'
                id='panel1a-header'
              >
                <Typography
                  component='span'
                  style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: '#474747',
                  }}
                >
                  {resource_type} Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails className='accordion-item-details'>
                <UserInformationForm
                  form={form}
                  resources={resource_type}
                  modal={modal}
                  isEditing={isEditing}
                  currentUser={currentUser}
                />
              </AccordionDetails>
            </Accordion>
            {/* Groups */}
            {form.values.groupings && form.values.groupings.length > 0 && (
              <Accordion className='accordion-item'>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls='panel2a-content'
                  id='panel2a-header'
                >
                  <Typography
                    component='span'
                    style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      color: '#474747',
                    }}
                  >
                    Tags
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className='accordion-item-details'>
                  <GroupsForm
                    form={form}
                    modal={modal}
                    groupings={groupings}
                    branchParentHierarchyMap={branchParentHierarchyMap}
                  />
                </AccordionDetails>
              </Accordion>
            )}
            {/* Availability */}
            <Accordion
              className='accordion-item'
              expanded={expandedPanels.availabilities}
              onChange={() =>
                setExpandedPanels((prev) => ({
                  ...prev,
                  availabilities: !prev.availabilities,
                }))
              }
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel2a-content'
                id='panel2a-header'
              >
                <Typography
                  component='span'
                  style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: '#474747',
                  }}
                >
                  Availability
                </Typography>
              </AccordionSummary>
              <AccordionDetails className='accordion-item-details'>
                <AvailabilitiesFormGroup
                  id={id}
                  form={form}
                  modal={modal}
                  resourceName={resource_type}
                />
              </AccordionDetails>
            </Accordion>
            {/* //Priorities
            <Accordion className='accordion-item'>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel2a-content'
                id='panel2a-header'
              >
                <Typography
                  component='span'
                  style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: '#474747',
                  }}
                >
                  Priorities
                </Typography>
              </AccordionSummary>
              <AccordionDetails className='accordion-item-details'>
                <PrioritiesFormGroup form={form} modal={modal} />
              </AccordionDetails>
            </Accordion>*/}
            {/*Unmatching */}
            {/* <Accordion className='accordion-item'>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel2a-content'
                    id='panel2a-header'
                  >
                    <Typography
                      component='span'
                      style={{
                        fontWeight: '600',
                        fontSize: '1rem',
                        color: '#474747',
                      }}
                    >
                      Unmatching
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className='accordion-item-details'>
                    <UnmatchingForm modal={modal} form={form} resources={resource_type}/>
                  </AccordionDetails>
                </Accordion> */}

            {/* Time Constrains */}
            {/* <Accordion className='accordion-item'>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel2a-content'
                id='panel2a-header'
              >
                <Typography
                  component='span'
                  style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: '#474747',
                  }}
                >
                  Time Constraints
                </Typography>
              </AccordionSummary>
              <AccordionDetails className='accordion-item-details'>
                <TimeConstrainsForm form={form} modal={modal} />
              </AccordionDetails>
            </Accordion> */}

            {(resource_type === 'Employee' || resource_type === 'Client') && (
              <>
                {/* Matching / Unmatching */}
                <Accordion className='accordion-item'>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel2a-content'
                    id='panel2a-header'
                  >
                    <Typography
                      component='span'
                      style={{
                        fontWeight: '600',
                        fontSize: '1rem',
                        color: '#474747',
                      }}
                    >
                      Matching / Unmatching
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className='accordion-item-details'>
                    <MatchingUnmatchingPriority form={form} />
                  </AccordionDetails>
                </Accordion>

                {/* Priority */}
                <Accordion className='accordion-item'>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel2a-content'
                    id='panel2a-header'
                  >
                    <Typography
                      component='span'
                      style={{
                        fontWeight: '600',
                        fontSize: '1rem',
                        color: '#474747',
                      }}
                    >
                      Priority
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className='accordion-item-details'>
                    <PriorityConstraint form={form} />
                  </AccordionDetails>
                </Accordion>

                {/* Authorization */}
                {resource_type === 'Client' && (
                  <Accordion
                    className='accordion-item'
                    expanded={expandedPanels.authorizations}
                    onChange={() =>
                      setExpandedPanels((prev) => ({
                        ...prev,
                        authorizations: !prev.authorizations,
                      }))
                    }
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls='panel2a-content'
                      id='panel2a-header'
                    >
                      <Typography
                        component='span'
                        style={{
                          fontWeight: '600',
                          fontSize: '1rem',
                          color: '#474747',
                        }}
                      >
                        Authorization
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails className='accordion-item-details'>
                      <AuthorizationConstraint
                        form={form}
                        activities={activities}
                      />
                    </AccordionDetails>
                  </Accordion>
                )}
              </>
            )}

            {/* <Accordion className='accordion-item'>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel2a-content'
                id='panel2a-header'
              >
                <Typography
                  component='span'
                  style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: '#474747',
                  }}
                >
                  Your Custom Constraints
                </Typography>
              </AccordionSummary>
              <AccordionDetails className='accordion-item-details'>
                <CustomConstraintsGroup
                  form={form}
                  modal={modal}
                  resourceName={resource_type}
                  users={users}
                  locations={locations}
                  activities={activities}
                  roles={roles}
                  subgroups={subgroups}
                  branches={branches}
                  weekdays={weekdays}
                  groupings={groupings}
                />
              </AccordionDetails>
            </Accordion> */}

            {/* CustomConstraints */}
            {/* {id && (
              <Accordion className='accordion-item'>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls='panel2a-content'
                  id='panel2a-header'
                >
                  <Typography
                    component='span'
                    style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      color: '#474747',
                    }}
                  >
                    Existing Custom Constraints
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className='accordion-item-details'>
                  <CustomConstraintsList
                    id={id}
                    modal={modal}
                    form={form}
                    resources={resource_type}
                  />
                </AccordionDetails>
              </Accordion>
            )} */}
            {!_.isEmpty(form.errors) && (
              <Alert severity='error' className='alert-block'>
                This is an error in the form, please check all fields!
              </Alert>
            )}
            <FormActions
              onSubmit={(e: FormEvent<HTMLFormElement>) => form.handleSubmit(e)}
              onReset={form.handleReset}
              onCancel={() => onCancel()}
              saveLoading={saveLoading}
              hideSaveAndReset={resource_type === 'Activity' && immutable}
            />
          </form>
        );
      }}
    </Formik>
  );
};

export default UsersForm;
