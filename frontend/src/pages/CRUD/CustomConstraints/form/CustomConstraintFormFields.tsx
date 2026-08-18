import React, { useMemo } from 'react';
import type { FormikErrors, FormikProps } from 'formik';
import {
  Box,
  Grid2 as Grid,
  Stack,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Typography,
  StepButton,
} from '@mui/material';
// React Select
// @ts-ignore
import Select from 'react-select';
// @ts-ignore
import AsyncSelect from 'react-select/async';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import FormErrors from 'components/FormItems/formErrors';
import {
  AntecedentAndConsequenceTypeTypes,
  ANTECEDENT_AND_CONSEQUENCE_TYPES,
  ConstraintTypesValueTypes,
  CONSTRAINT_TYPES,
  DaySelectionTypes,
  DAY_SELECTION_OPTIONS,
  EACH_OR_ALL_OPTIONS,
  FREQUENCY_OPTIONS,
} from '../helpers/customTypes';
import generateDescription from '../helpers/generateDescription';
import initializeCustomConstraintValues from '../helpers/initializeCustomConstraintValues';
import asyncSearchUsers from 'utils/asyncSearchUsers';
import unitsByConstraintType from '../helpers/unitsByConstraintType';
import ErrorIcon from '@mui/icons-material/Error';
import YesNoRadio from '../helpers/YesNoRadio';
interface LabelTooltipProps {
  title: string;
  icon: React.ReactNode;
}

const LabelTooltip: React.FC<LabelTooltipProps> = ({ title, icon }) => {
  return (
    <Tooltip title={title} placement='top-start' arrow>
      <IconButton style={{ padding: 0, marginLeft: '4px' }}>{icon}</IconButton>
    </Tooltip>
  );
};

const BinaryField = ({
  show,
  label,
  name,
  clearedField,
  clearedFieldValue,
  isNested,
  formIndex,
  formValues,
  values,
  setValues,
  setFieldValue,
  max = false,
}: any) => {
  if (!show) return null;

  return (
    <Grid
      columnSpacing={2}
      alignItems='flex-start'
      size={{
        sm: 12,
        md: max ? 12 : 8,
      }}
    >
      <Stack flexDirection='row' alignItems='center' flexWrap='nowrap' gap={2}>
        <Typography
          variant='subtitle2'
          sx={{
            display: 'inline-block',
            wordBreak: 'break-word',
            flexShrink: 1,
          }}
        >
          {label}
        </Typography>
        <Box sx={{ flexShrink: 0 }}>
          <YesNoRadio
            name={name}
            clearedField={clearedField}
            clearedFieldValue={clearedFieldValue}
            label={label}
            isNested={isNested}
            formIndex={formIndex}
            formValues={formValues}
            values={values}
            setValues={setValues}
            setFieldValue={setFieldValue}
          />
        </Box>
      </Stack>
    </Grid>
  );
};

const isForceLimitTrue = (val: any) => {
  return [
    ConstraintTypesValueTypes.USER_TO_USER,
    ConstraintTypesValueTypes.USER_TO_SESSION,
    ConstraintTypesValueTypes.TIME,
    ConstraintTypesValueTypes.DRIVE,
    ConstraintTypesValueTypes.DISTANCE,
    ConstraintTypesValueTypes.AUTHORIZATION,
    ConstraintTypesValueTypes.BREAKQUANTITY,
    ConstraintTypesValueTypes.SESSION_LENGTH,
    ConstraintTypesValueTypes.SUPERVISION,
  ].includes(val);
};
const isForceForeverTrue = (val: any) => {
  return [
    ConstraintTypesValueTypes.MATCHING,
    ConstraintTypesValueTypes.UNMATCHING,
  ].includes(val);
};
const isDisabledArr: string[] = [];

const isHiddenConsequence: any[] = [
  ConstraintTypesValueTypes.SUPERVISION,
  ConstraintTypesValueTypes.AUTHORIZATION,
];
const isDaysArr: string[] = ['matching', 'unmatching'];
const isSoftArr: string[] = ['sessionlength'];

type CustomConstraintFormFieldsProps = {
  form: FormikProps<any>;
  users: Array<any>;
  locations: Array<any>;
  activities: Array<any>;
  roles: Array<any>;
  subgroups: Array<any>;
  branches: Array<any>;
  weekdays: Array<any>;
  groupings: Array<any>;
  isNested?: boolean;
  constraint?: any;
  formIndex?: number;
  id?: string;
  activeStep?: any;
  setActiveStep?: any;
};

const CustomConstraintStepperForm: React.FC<
  CustomConstraintFormFieldsProps
> = ({
  form,
  users,
  locations,
  activities,
  roles,
  subgroups,
  branches,
  weekdays,
  groupings,
  isNested = false,
  constraint = null,
  formIndex = 0,
  id = null,
  activeStep,
  setActiveStep,
}) => {
  const { values, setFieldValue, setValues } = form;
  const formValues = isNested ? constraint : values;

  const description = generateDescription({
    ...formValues,
  });

  const updatedFrequencyOptions = useMemo(() => {
    const parsed_frequency_options = JSON.parse(
      JSON.stringify(FREQUENCY_OPTIONS),
    );
    if (
      ConstraintTypesValueTypes.USER_TO_SESSION ===
        formValues.constraintType?.value ||
      ConstraintTypesValueTypes.USER_TO_USER ===
        formValues.constraintType?.value
    ) {
      parsed_frequency_options.splice(-1);
    }
    return parsed_frequency_options;
  }, [formValues]);

  const updatedUnitsOptions = useMemo(() => {
    return unitsByConstraintType(formValues.constraintType?.value);
  }, [formValues]);

  const isAntecedentActivitySelectedInUsersField = useMemo(() => {
    const antecedentTypeUser = formValues.antecedentTypeUser;
    if (antecedentTypeUser) {
      const findIndex = activities.findIndex(
        (item: any) => item.value === antecedentTypeUser.value,
      );
      return findIndex !== -1;
    }
    return false;
  }, [activities, formValues.antecedentTypeUser]);

  const isAntecedentLocationSelectedInUsersField = useMemo(() => {
    const antecedentTypeUser = formValues.antecedentTypeUser;
    if (antecedentTypeUser) {
      const findIndex = locations.findIndex(
        (item: any) => item.value === antecedentTypeUser.value,
      );
      return findIndex !== -1;
    }
    return false;
  }, [locations, formValues.antecedentTypeUser]);

  const updatedAntecedentTypes = useMemo(() => {
    const cType = formValues.constraintType?.value;
    let updatedData: Array<any> = JSON.parse(
      JSON.stringify(ANTECEDENT_AND_CONSEQUENCE_TYPES),
    );
    if (cType === ConstraintTypesValueTypes.AUTHORIZATION) {
      updatedData.pop();
    }
    if (cType === ConstraintTypesValueTypes.GROUPING) {
      updatedData.shift();
    }
    return updatedData;
  }, [formValues.constraintType]);

  const updatedConsequenceTypes = useMemo(() => {
    const cType = formValues.constraintType?.value;
    let updatedData: Array<any> = JSON.parse(
      JSON.stringify(ANTECEDENT_AND_CONSEQUENCE_TYPES),
    );
    if (cType === ConstraintTypesValueTypes.AUTHORIZATION) {
      updatedData.pop();
    }
    if (
      cType === ConstraintTypesValueTypes.GROUPING ||
      cType === ConstraintTypesValueTypes.USER_TO_USER
    ) {
      updatedData.shift();
    }
    return updatedData;
  }, [formValues.constraintType]);

  const isActivityRequired =
    formValues?.constraintType?.value === ConstraintTypesValueTypes.SUPERVISION;

  const skipConsequence =
    formValues.constraintType?.value ===
      ConstraintTypesValueTypes.AUTHORIZATION ||
    formValues.constraintType?.value === ConstraintTypesValueTypes.SUPERVISION;

  const steps = skipConsequence
    ? ['Constraint Type', 'Antecedent', 'Min/Max/Frequency']
    : ['Constraint Type', 'Antecedent', 'Consequence', 'Min/Max/Frequency'];

  const stepFieldMap: Record<number, string[]> = {
    0: ['constraintType'],
    1: ['antecedentTypeUser', 'antecedentTypeRole', 'antecedentTypeActivity'],
    2: [
      'consequenceTypeUser',
      'consequenceTypeRole',
      'consequenceTypeActivity',
    ],
    3: ['min', 'max', 'units', 'offset'],
  };

  function stepHasErrors(stepIndex: number, errors: FormikErrors<any>) {
    const fieldsForThisStep = stepFieldMap[stepIndex] || [];
    return fieldsForThisStep.some((fieldName) => !!errors[fieldName]);
  }

  return (
    <Stack rowGap='1rem'>
      {/* Stepper with clickable steps */}
      <Stepper nonLinear activeStep={activeStep}>
        {steps.map((label: string, index: number) => {
          const hasError = stepHasErrors(index, form.errors);
          return (
            <Step key={label}>
              <StepButton
                onClick={() => setActiveStep && setActiveStep(index)}
                sx={{
                  '& .MuiStepLabel-label': {
                    color: hasError
                      ? 'error.main'
                      : activeStep === index
                        ? 'green'
                        : 'inherit',
                  },
                }}
              >
                <StepLabel
                  sx={{
                    ...(hasError && { color: 'error.main' }),
                  }}
                >
                  {hasError ? (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <ErrorIcon color='error' style={{ marginRight: 4 }} />
                      {label}
                    </span>
                  ) : (
                    <>{label}</>
                  )}
                  {label === 'Constraint Type' &&
                    form?.values?.constraintType?.label}
                </StepLabel>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
      {/** Render description if available */}
      {formValues.constraintType?.value && (
        <Stack>
          <label>Description</label>
          <Box
            sx={{
              bgcolor: '#F7F8FB',
              padding: '1rem',
              borderRadius: '0.5rem',
              '& strong': { fontWeight: '500', color: '#4d53e0' },
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </Box>
        </Stack>
      )}
      {/* Render all step sections */}
      <Grid container spacing={2}>
        {/** Constraint selection */}
        <Grid
          size={{
            sm: 12,
            md: 12,
          }}
        >
          <Stack
            spacing={2}
            tabIndex={0}
            onMouseOver={() => setActiveStep && setActiveStep(0)}
            sx={{
              p: 2,
              border:
                activeStep === 0
                  ? '2px solid #4d53e0'
                  : '2px solid transparent',
              borderRadius: '0.5rem',
              mb: 2,
            }}
          >
            <Stack
              rowGap='0.85rem'
              sx={{
                padding: '1rem',
                borderRadius: '0.5rem',
              }}
            >
              <Grid container columns={{ sm: 12, md: 12 }} spacing={2}>
                <Grid
                  size={{
                    sm: 12,
                    md: 6,
                  }}
                >
                  <Typography variant='subtitle2'>
                    What constraint should be applied?
                  </Typography>
                </Grid>
                <Grid
                  size={{
                    sm: 12,
                    md: 6,
                  }}
                >
                  <Select
                    name='constraintType'
                    className='w-100'
                    classNamePrefix='select'
                    placeholder=''
                    styles={selectInputControlStyles(
                      !!FormErrors.displayableError(
                        form!,
                        isNested
                          ? `constraints.${formIndex}.constraintType`
                          : 'constraintType',
                      ),
                    )}
                    options={CONSTRAINT_TYPES}
                    value={formValues.constraintType}
                    onChange={(val: any) => {
                      if (val.value !== formValues.constraintType?.value) {
                        const forceLimitTrue = isForceLimitTrue(val.value);
                        const forceForeverTrue = isForceForeverTrue(val.value);
                        const newUnitOptions = unitsByConstraintType(val.value);
                        const defaultUnitValue = newUnitOptions[0];

                        const defaultAntecedentTypeIndex =
                          val.value === ConstraintTypesValueTypes.GROUPING
                            ? 1
                            : 0;
                        const defaultConsequenceTypeIndex =
                          val.value === ConstraintTypesValueTypes.GROUPING ||
                          val.value === ConstraintTypesValueTypes.USER_TO_USER
                            ? 1
                            : 0;

                        const isActivity1 =
                          val.value === ConstraintTypesValueTypes.SUPERVISION;

                        let defaultSelectedBranch = null;
                        for (const structure of branches) {
                          if (structure?.options?.[0]) {
                            defaultSelectedBranch = structure?.options?.[0];
                            break;
                          }
                        }

                        if (isNested) {
                          const updatedForms: any = values;
                          const updatedObj = {
                            ...initializeCustomConstraintValues(null, {
                              groupings,
                              users,
                              branches,
                              weekdays,
                              locations,
                              activities,
                              subgroups,
                              roles,
                            }),
                            id,
                            constraintType: val,
                            noLimit: forceLimitTrue,
                            forever: forceForeverTrue,
                            antecedentType:
                              ANTECEDENT_AND_CONSEQUENCE_TYPES[
                                defaultAntecedentTypeIndex
                              ],
                            consequenceType:
                              ANTECEDENT_AND_CONSEQUENCE_TYPES[
                                defaultConsequenceTypeIndex
                              ],
                            units: defaultUnitValue,
                            activity1: isActivity1,
                            branches: [defaultSelectedBranch],
                          };
                          updatedForms.constraints[formIndex] = updatedObj;
                          setValues(updatedForms);
                        } else {
                          setValues(
                            {
                              ...initializeCustomConstraintValues(null, {
                                groupings,
                                users,
                                branches,
                                weekdays,
                                locations,
                                activities,
                                subgroups,
                                roles,
                              }),
                              id,
                              constraintType: val,
                              noLimit: forceLimitTrue,
                              forever: forceForeverTrue,
                              antecedentType:
                                ANTECEDENT_AND_CONSEQUENCE_TYPES[
                                  defaultAntecedentTypeIndex
                                ],
                              consequenceType:
                                ANTECEDENT_AND_CONSEQUENCE_TYPES[
                                  defaultConsequenceTypeIndex
                                ],
                              units: defaultUnitValue,
                              activity1: isActivity1,
                              branches: [defaultSelectedBranch],
                            },
                            false,
                          );
                        }
                      }
                    }}
                  />
                  <CustomErrorMessage
                    name={
                      isNested
                        ? `constraints.${formIndex}.constraintType`
                        : 'constraintType'
                    }
                    form={form}
                  />
                </Grid>
              </Grid>

              {/* If grouping is needed */}
              {formValues.constraintType?.value ===
                ConstraintTypesValueTypes.GROUPING && (
                <Grid container columns={{ sm: 12, md: 12 }} spacing={2}>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6,
                    }}
                  >
                    <Typography variant='subtitle2'>Grouping</Typography>
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6,
                    }}
                  >
                    <Select
                      name='grouping'
                      className='w-100'
                      classNamePrefix='select'
                      placeholder=''
                      styles={selectInputControlStyles(false, false, false)}
                      options={groupings}
                      value={formValues.grouping}
                      onChange={(val: any) =>
                        setFieldValue(
                          isNested
                            ? `constraints.${formIndex}.grouping`
                            : 'grouping',
                          val,
                        )
                      }
                    />
                  </Grid>
                </Grid>
              )}
            </Stack>
          </Stack>
        </Grid>
        {/** Antecedent */}
        <Grid
          size={{
            sm: !skipConsequence ? 6 : 12,
            md: !skipConsequence ? 6 : 12,
          }}
        >
          <Stack
            spacing={2}
            tabIndex={0}
            onMouseOver={() => setActiveStep && setActiveStep(1)}
            sx={{
              p: 2,
              border:
                activeStep === 1
                  ? '2px solid #4d53e0'
                  : '2px solid transparent',
              borderRadius: '0.5rem',
              mb: 2,
            }}
          >
            <Grid container columns={{ sm: 12, md: 12 }}>
              <Grid
                size={{
                  sm: 12,
                  md: 12,
                }}
              >
                <Stack
                  rowGap='0.85rem'
                  sx={{
                    bgcolor: '#F7F8FB',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                  }}
                >
                  {updatedAntecedentTypes.length > 1 && !isNested && (
                    <Grid container spacing={2} size={{ xs: 12 }}>
                      <Grid
                        size={{
                          sm: 12,
                          md: 8,
                        }}
                      >
                        <Typography variant='subtitle2'>
                          Is this applying to a specific user or role?
                        </Typography>
                      </Grid>
                      <Grid
                        size={{
                          sm: 12,
                          md: 4,
                        }}
                      >
                        <Select
                          name='antecedentType'
                          id='antecedent-type'
                          className='w-100'
                          classNamePrefix='select'
                          placeholder=''
                          styles={selectInputControlStyles(false, false, false)}
                          options={updatedAntecedentTypes}
                          value={formValues.antecedentType}
                          onChange={(val: any) => {
                            if (
                              val.value !== formValues.antecedentType?.value
                            ) {
                              const updatedObj = {
                                ...formValues,
                                antecedentType: val,
                                antecedentTypeUser: null,
                                antecedentTypeLocation: null,
                                antecedentTypeActivity: null,
                                antecedentTypeRole: null,
                                antecedentTypeSubgroup: null,
                                tag1: false,
                                location1: false,
                                activity1: isActivityRequired,
                                isBranchesActive: false,
                                antecedentTypeDaySelection:
                                  DAY_SELECTION_OPTIONS[0],
                                antecedentTypeWeekDays: [],
                              };
                              if (isNested) {
                                const updatedForms: any = values;
                                updatedForms.constraints[formIndex] =
                                  updatedObj;
                                setValues(updatedForms);
                              } else {
                                setValues(updatedObj);
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {/* If roles or subgroups */}
                  {!isNested &&
                    formValues?.antecedentType?.value ===
                      AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS && (
                      <Grid container spacing={2} size={{ xs: 12 }}>
                        {roles.length > 0 && (
                          <>
                            <Grid
                              size={{
                                sm: 12,
                                md: 8,
                              }}
                            >
                              <Typography variant='subtitle2'>
                                Which role do these user have?
                              </Typography>
                            </Grid>
                            <Grid
                              size={{
                                sm: 12,
                                md: 4,
                              }}
                            >
                              <Select
                                name='antecedentTypeRole'
                                className='w-100'
                                classNamePrefix='select'
                                placeholder=''
                                styles={selectInputControlStyles(
                                  !!FormErrors.displayableError(
                                    form!,
                                    'antecedentTypeRole',
                                  ),
                                )}
                                options={roles}
                                value={formValues.antecedentTypeRole}
                                onChange={(val: any) =>
                                  setFieldValue(
                                    isNested
                                      ? `constraints.${formIndex}.antecedentTypeRole`
                                      : 'antecedentTypeRole',
                                    val,
                                  )
                                }
                              />
                              <CustomErrorMessage
                                name={
                                  isNested
                                    ? `constraints.${formIndex}.antecedentTypeRole`
                                    : 'antecedentTypeRole'
                                }
                                form={form}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    )}

                  {/* If SPECIFIC_USER and not nested */}
                  {formValues?.antecedentType?.value ===
                    AntecedentAndConsequenceTypeTypes.SPECIFIC_USER &&
                    !isNested &&
                    users.length > 0 && (
                      <Grid container spacing={2} size={{ xs: 12 }}>
                        <Grid
                          size={{
                            sm: 12,
                            md: 8,
                          }}
                        >
                          <Typography variant='subtitle2'>User</Typography>
                        </Grid>
                        <Grid
                          size={{
                            sm: 12,
                            md: 4,
                          }}
                        >
                          <AsyncSelect
                            name='antecedentTypeUser'
                            className='w-100'
                            classNamePrefix='select'
                            placeholder=''
                            styles={selectInputControlStyles(
                              !!FormErrors.displayableError(
                                form!,
                                'antecedentTypeUser',
                              ),
                            )}
                            defaultOptions={true}
                            loadOptions={asyncSearchUsers}
                            value={formValues.antecedentTypeUser}
                            onChange={(val: any) => {
                              const updatedObj = {
                                ...formValues,
                                antecedentTypeUser: val,
                                antecedentTypeLocation: null,
                                location1: false,
                                activity1: isActivityRequired,
                              };
                              if (!isActivityRequired) {
                                updatedObj.antecedentTypeActivity = null;
                              }
                              if (isNested) {
                                const updatedForms: any = values;
                                updatedForms.constraints[formIndex] =
                                  updatedObj;
                                setValues(updatedForms);
                              } else {
                                setValues(updatedObj);
                              }
                            }}
                          />
                          <CustomErrorMessage
                            name={
                              isNested
                                ? `constraints.${formIndex}.antecedentTypeUser`
                                : 'antecedentTypeUser'
                            }
                            form={form}
                          />
                        </Grid>
                      </Grid>
                    )}

                  {(formValues.antecedentTypeUser ||
                    formValues.antecedentTypeRole ||
                    isActivityRequired) && (
                    <Grid container spacing={2} size={{ xs: 12 }}>
                      <BinaryField
                        show={
                          formValues?.constraintType?.value !==
                            ConstraintTypesValueTypes.DRIVE &&
                          !isAntecedentLocationSelectedInUsersField
                        }
                        label='Does this constraint apply to a specific location?'
                        name='location1'
                        clearedField='antecedentTypeLocation'
                        {...{
                          isNested,
                          formIndex,
                          formValues,
                          values,
                          setValues,
                          setFieldValue,
                        }}
                      />
                      <Grid
                        alignSelf='flex-end'
                        size={{
                          sm: 12,
                          md: 4,
                        }}
                      >
                        {formValues.location1 && locations.length > 0 && (
                          <>
                            <Select
                              name='antecedentTypeLocation'
                              className='w-100'
                              classNamePrefix='select'
                              placeholder=''
                              styles={selectInputControlStyles(
                                !!FormErrors.displayableError(
                                  form!,
                                  'antecedentTypeLocation',
                                ),
                              )}
                              options={locations}
                              value={formValues.antecedentTypeLocation}
                              onChange={(val: any) =>
                                setFieldValue(
                                  isNested
                                    ? `constraints.${formIndex}.antecedentTypeLocation`
                                    : 'antecedentTypeLocation',
                                  val,
                                )
                              }
                            />
                            <CustomErrorMessage
                              name={
                                isNested
                                  ? `constraints.${formIndex}.antecedentTypeLocation`
                                  : 'antecedentTypeLocation'
                              }
                              form={form}
                            />
                          </>
                        )}
                      </Grid>

                      {(formValues?.constraintType?.value !==
                        ConstraintTypesValueTypes.DRIVE &&
                        !isAntecedentActivitySelectedInUsersField) ||
                      isActivityRequired ? (
                        <Grid container spacing={2} size={{ xs: 12 }}>
                          <BinaryField
                            show
                            label='Does this constraint apply to a specific activity?'
                            name='activity1'
                            clearedField='antecedentTypeActivity'
                            isNested={isNested}
                            formIndex={formIndex}
                            formValues={formValues}
                            values={values}
                            setValues={setValues}
                            setFieldValue={setFieldValue}
                          />
                          <Grid alignSelf='flex-end' size={{ xs: 12, md: 4 }}>
                            {formValues.activity1 && activities.length > 0 && (
                              <>
                                <Select
                                  name='antecedentTypeActivity'
                                  className='w-100'
                                  classNamePrefix='select'
                                  placeholder=''
                                  styles={selectInputControlStyles(
                                    !!FormErrors.displayableError(
                                      form!,
                                      'antecedentTypeActivity',
                                    ),
                                  )}
                                  options={activities}
                                  value={formValues.antecedentTypeActivity}
                                  onChange={(val: any) =>
                                    setFieldValue(
                                      isNested
                                        ? `constraints.${formIndex}.antecedentTypeActivity`
                                        : 'antecedentTypeActivity',
                                      val,
                                    )
                                  }
                                />
                                <CustomErrorMessage
                                  name={
                                    isNested
                                      ? `constraints.${formIndex}.antecedentTypeActivity`
                                      : 'antecedentTypeActivity'
                                  }
                                  form={form}
                                />
                              </>
                            )}
                          </Grid>
                        </Grid>
                      ) : null}
                      {/* If roles/subgroups */}
                      {!isNested &&
                        formValues?.antecedentType?.value ===
                          AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS && (
                          <Grid container spacing={2} size={{ xs: 12 }}>
                            <BinaryField
                              show
                              label='Does this role have a tag?'
                              name='tag1'
                              clearedField='antecedentTypeSubgroup'
                              isNested={isNested}
                              formIndex={formIndex}
                              formValues={formValues}
                              values={values}
                              setValues={setValues}
                              setFieldValue={setFieldValue}
                            />
                            <Grid
                              size={{
                                sm: 12,
                                md: 4,
                              }}
                            >
                              {!isNested &&
                                formValues?.tag1 &&
                                subgroups.length > 0 && (
                                  <>
                                    <Select
                                      name='antecedentTypeSubgroup'
                                      className='w-100'
                                      classNamePrefix='select'
                                      placeholder=''
                                      styles={selectInputControlStyles(
                                        !!FormErrors.displayableError(
                                          form!,
                                          'antecedentTypeSubgroup',
                                        ),
                                      )}
                                      options={subgroups}
                                      value={formValues.antecedentTypeSubgroup}
                                      onChange={(val: any) =>
                                        setFieldValue(
                                          isNested
                                            ? `constraints.${formIndex}.antecedentTypeSubgroup`
                                            : 'antecedentTypeSubgroup',
                                          val,
                                        )
                                      }
                                    />
                                    <CustomErrorMessage
                                      name={
                                        isNested
                                          ? `constraints.${formIndex}.antecedentTypeSubgroup`
                                          : 'antecedentTypeSubgroup'
                                      }
                                      form={form}
                                    />
                                  </>
                                )}
                            </Grid>
                          </Grid>
                        )}
                      {formValues?.antecedentType?.value ===
                        AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS && (
                        <Grid container spacing={2} size={{ xs: 12 }}>
                          <BinaryField
                            show
                            label='Does this apply to a specific branch?'
                            name='isBranchesActive'
                            clearedField='branches'
                            clearedFieldValue={[]}
                            isNested={isNested}
                            formIndex={formIndex}
                            formValues={formValues}
                            values={values}
                            setValues={setValues}
                            setFieldValue={setFieldValue}
                          />
                          <Grid
                            size={{
                              sm: 12,
                              md: 4,
                            }}
                          >
                            {formValues.isBranchesActive && (
                              <>
                                <Select
                                  name='branches'
                                  className='w-100'
                                  classNamePrefix='select'
                                  placeholder=''
                                  styles={selectInputControlStyles(
                                    !!FormErrors.displayableError(
                                      form!,
                                      isNested
                                        ? `constraints.${formIndex}.branches`
                                        : 'branches',
                                    ),
                                  )}
                                  options={branches}
                                  value={formValues.branches}
                                  isMulti
                                  onChange={(val: any) => {
                                    const updatedObj = {
                                      ...formValues,
                                      branches: val,
                                    };
                                    if (isNested) {
                                      const updatedForms: any = values;
                                      updatedForms.constraints[formIndex] =
                                        updatedObj;
                                      setValues(updatedForms);
                                    } else {
                                      setValues(updatedObj);
                                    }
                                  }}
                                />
                                <CustomErrorMessage
                                  name={
                                    isNested
                                      ? `constraints.${formIndex}.branches`
                                      : 'branches'
                                  }
                                  form={form}
                                />
                              </>
                            )}
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  )}

                  {/* Day selection if it's MATCHING or UNMATCHING (and not in isDaysArr) */}
                  {!isNested &&
                    [
                      ConstraintTypesValueTypes.MATCHING,
                      ConstraintTypesValueTypes.UNMATCHING,
                    ].includes(formValues.constraintType?.value) &&
                    !isDaysArr.includes(formValues.constraintType?.value) && (
                      <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
                        <Grid
                          size={{
                            sm: 12,
                            md: 6,
                          }}
                        >
                          <label htmlFor='antecedentTypeDaySelection'>
                            Day Selection
                          </label>
                          <Select
                            name='antecedentTypeDaySelection'
                            className='w-100'
                            classNamePrefix='select'
                            placeholder=''
                            styles={selectInputControlStyles(
                              false,
                              false,
                              false,
                            )}
                            options={DAY_SELECTION_OPTIONS}
                            value={formValues.antecedentTypeDaySelection}
                            onChange={(val: any) => {
                              const updatedObj = {
                                ...formValues,
                                antecedentTypeDaySelection: val,
                                antecedentTypeWeekDays: [],
                              };
                              if (isNested) {
                                const updatedForms: any = values;
                                updatedForms.constraints[formIndex] =
                                  updatedObj;
                                setValues(updatedForms);
                              } else {
                                setValues(updatedObj);
                              }
                            }}
                          />
                        </Grid>
                        {formValues?.antecedentTypeDaySelection.value ===
                          DaySelectionTypes.CERTAIN_DAYS && (
                          <Grid
                            size={{
                              sm: 12,
                              md: 6,
                            }}
                          >
                            <label htmlFor='antecedentTypeWeekDays'>
                              Week days
                            </label>
                            <Select
                              isMulti
                              name='antecedentTypeWeekDays'
                              className='w-100'
                              classNamePrefix='select'
                              placeholder=''
                              styles={selectInputControlStyles(
                                !!FormErrors.displayableError(
                                  form!,
                                  'antecedentTypeWeekDays',
                                ),
                              )}
                              options={weekdays}
                              value={formValues.antecedentTypeWeekDays}
                              onChange={(vals: any) =>
                                setFieldValue(
                                  isNested
                                    ? `constraints.${formIndex}.antecedentTypeWeekDays`
                                    : 'antecedentTypeWeekDays',
                                  vals,
                                )
                              }
                            />
                            <CustomErrorMessage
                              name={
                                isNested
                                  ? `constraints.${formIndex}.antecedentTypeWeekDays`
                                  : 'antecedentTypeWeekDays'
                              }
                              form={form}
                            />
                          </Grid>
                        )}
                      </Grid>
                    )}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
        {/** Consequence */}
        <Grid
          size={{
            sm: 6,
            md: 6,
          }}
        >
          {!skipConsequence && (
            <Stack
              tabIndex={0}
              onMouseOver={() => {
                setActiveStep && setActiveStep(2);
              }}
              sx={{
                p: 2,
                border:
                  activeStep === 2
                    ? '2px solid #4d53e0'
                    : '2px solid transparent',
                borderRadius: '0.5rem',
                mb: 2,
              }}
            >
              {!isHiddenConsequence.includes(
                formValues.constraintType?.value,
              ) && (
                <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
                  <Grid
                    size={{
                      sm: 12,
                      md: 12,
                    }}
                  >
                    <Stack
                      rowGap='0.85rem'
                      sx={{
                        bgcolor: '#F7F8FB',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                      }}
                    >
                      {updatedConsequenceTypes.length > 1 && (
                        <Grid container spacing={2} size={{ xs: 12 }}>
                          <Grid
                            size={{
                              sm: 12,
                              md: 8,
                            }}
                          >
                            <Typography variant='subtitle2'>
                              Is this applying to a specific user or role?
                            </Typography>
                          </Grid>
                          <Grid
                            size={{
                              sm: 12,
                              md: 4,
                            }}
                          >
                            <Select
                              name='consequenceType'
                              id='consequence-type'
                              className='w-100'
                              classNamePrefix='select'
                              placeholder=''
                              styles={selectInputControlStyles(
                                false,
                                false,
                                false,
                              )}
                              options={updatedConsequenceTypes}
                              value={formValues.consequenceType}
                              onChange={(val: any) => {
                                if (
                                  val.value !==
                                  formValues.consequenceType?.value
                                ) {
                                  const updatedObj = {
                                    ...formValues,
                                    consequenceType: val,
                                    consequenceTypeUser: null,
                                    consequenceTypeLocation: null,
                                    consequenceTypeActivity: null,
                                    consequenceTypeRole: null,
                                    consequenceTypeSubgroup: null,
                                    tag2: false,
                                    location2: false,
                                    activity2: false,
                                    consequenceTypeDaySelection:
                                      DAY_SELECTION_OPTIONS[0],
                                    consequenceTypeWeekDays: [],
                                  };
                                  if (isNested) {
                                    const updatedForms: any = values;
                                    updatedForms.constraints[formIndex] =
                                      updatedObj;
                                    setValues(updatedForms);
                                  } else {
                                    setValues(updatedObj);
                                  }
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      )}

                      {(formValues.consequenceTypeUser ||
                        formValues.consequenceTypeRole) && (
                        <Grid container></Grid>
                      )}

                      {/* Roles/subgroups */}
                      {!isNested &&
                        formValues?.consequenceType?.value ===
                          AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS && (
                          <Grid container spacing={2} size={{ xs: 12 }}>
                            {roles.length > 0 && (
                              <>
                                <Grid
                                  size={{
                                    sm: 12,
                                    md: 8,
                                  }}
                                >
                                  <Typography variant='subtitle2'>
                                    What role does the user have?
                                  </Typography>
                                </Grid>
                                <Grid
                                  size={{
                                    sm: 12,
                                    md: 4,
                                  }}
                                >
                                  <Select
                                    name='consequenceTypeRole'
                                    className='w-100'
                                    classNamePrefix='select'
                                    placeholder=''
                                    styles={selectInputControlStyles(
                                      !!FormErrors.displayableError(
                                        form!,
                                        'consequenceTypeRole',
                                      ),
                                    )}
                                    options={roles}
                                    value={formValues.consequenceTypeRole}
                                    onChange={(val: any) =>
                                      setFieldValue(
                                        isNested
                                          ? `constraints.${formIndex}.consequenceTypeRole`
                                          : 'consequenceTypeRole',
                                        val,
                                      )
                                    }
                                  />
                                  <CustomErrorMessage
                                    name={
                                      isNested
                                        ? `constraints.${formIndex}.consequenceTypeRole`
                                        : 'consequenceTypeRole'
                                    }
                                    form={form}
                                  />
                                </Grid>
                              </>
                            )}
                            {/* Tag2 switch if roles/subgroups */}
                            {!isNested &&
                              formValues?.consequenceType?.value ===
                                AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS && (
                                <BinaryField
                                  show
                                  label='Does this client have a tag?'
                                  name='tag2'
                                  clearedField='tag2'
                                  isNested={isNested}
                                  formIndex={formIndex}
                                  formValues={formValues}
                                  values={values}
                                  setValues={setValues}
                                  setFieldValue={setFieldValue}
                                />
                              )}

                            {!isNested &&
                              formValues?.tag2 &&
                              subgroups.length > 0 && (
                                <Grid
                                  size={{
                                    sm: 12,
                                    md: 4,
                                  }}
                                >
                                  <Select
                                    name='consequenceTypeSubgroup'
                                    className='w-100'
                                    classNamePrefix='select'
                                    placeholder=''
                                    styles={selectInputControlStyles(
                                      !!FormErrors.displayableError(
                                        form!,
                                        'consequenceTypeSubgroup',
                                      ),
                                    )}
                                    options={subgroups}
                                    value={formValues.consequenceTypeSubgroup}
                                    onChange={(val: any) =>
                                      setFieldValue(
                                        isNested
                                          ? `constraints.${formIndex}.consequenceTypeSubgroup`
                                          : 'consequenceTypeSubgroup',
                                        val,
                                      )
                                    }
                                  />
                                  <CustomErrorMessage
                                    name={
                                      isNested
                                        ? `constraints.${formIndex}.consequenceTypeSubgroup`
                                        : 'consequenceTypeSubgroup'
                                    }
                                    form={form}
                                  />
                                </Grid>
                              )}
                          </Grid>
                        )}

                      {/* If SPECIFIC_USER */}
                      {formValues?.consequenceType?.value ===
                        AntecedentAndConsequenceTypeTypes.SPECIFIC_USER && (
                        <Grid container spacing={2} size={{ xs: 12 }}>
                          <Grid
                            size={{
                              sm: 12,
                              md: 8,
                            }}
                          >
                            <Typography variant='subtitle2'>User</Typography>
                          </Grid>
                          <Grid
                            size={{
                              sm: 12,
                              md: 4,
                            }}
                          >
                            <AsyncSelect
                              name='consequenceTypeUser'
                              className='w-100'
                              classNamePrefix='select'
                              placeholder=''
                              styles={selectInputControlStyles(
                                !!FormErrors.displayableError(
                                  form!,
                                  'consequenceTypeUser',
                                ),
                              )}
                              defaultOptions={true}
                              loadOptions={asyncSearchUsers}
                              value={formValues.consequenceTypeUser}
                              onChange={(val: any) => {
                                const updatedObj = {
                                  ...formValues,
                                  consequenceTypeUser: val,
                                  consequenceTypeLocation: null,
                                  consequenceTypeActivity: null,
                                  location2: false,
                                  activity2: false,
                                };
                                if (isNested) {
                                  const updatedForms: any = values;
                                  updatedForms.constraints[formIndex] =
                                    updatedObj;
                                  setValues(updatedForms);
                                } else {
                                  setValues(updatedObj);
                                }
                              }}
                            />
                            <CustomErrorMessage
                              name={
                                isNested
                                  ? `constraints.${formIndex}.consequenceTypeUser`
                                  : 'consequenceTypeUser'
                              }
                              form={form}
                            />
                          </Grid>
                        </Grid>
                      )}

                      {/* Day selection for MATCHING / UNMATCHING */}
                      {[
                        ConstraintTypesValueTypes.MATCHING,
                        ConstraintTypesValueTypes.UNMATCHING,
                      ].includes(formValues.constraintType?.value) &&
                        !isDaysArr.includes(
                          formValues.constraintType?.value,
                        ) && (
                          <Grid container spacing={2} size={{ xs: 12 }}>
                            <Grid
                              size={{
                                sm: 12,
                                md: 6,
                              }}
                            >
                              <label htmlFor='consequenceTypeDaySelection'>
                                Day Selection
                              </label>
                              <Select
                                name='consequenceTypeDaySelection'
                                className='w-100'
                                classNamePrefix='select'
                                placeholder=''
                                styles={selectInputControlStyles(
                                  false,
                                  false,
                                  false,
                                )}
                                options={DAY_SELECTION_OPTIONS}
                                value={formValues.consequenceTypeDaySelection}
                                onChange={(val: any) => {
                                  const updatedObj = {
                                    ...formValues,
                                    consequenceTypeDaySelection: val,
                                    consequenceTypeWeekDays: [],
                                  };
                                  if (isNested) {
                                    const updatedForms: any = values;
                                    updatedForms.constraints[formIndex] =
                                      updatedObj;
                                    setValues(updatedForms);
                                  } else {
                                    setValues(updatedObj);
                                  }
                                }}
                              />
                            </Grid>
                            {formValues?.consequenceTypeDaySelection.value ===
                              DaySelectionTypes.CERTAIN_DAYS && (
                              <Grid
                                size={{
                                  sm: 12,
                                  md: 6,
                                }}
                              >
                                <label htmlFor='consequenceTypeWeekDays'>
                                  Week days
                                </label>
                                <Select
                                  isMulti
                                  name='consequenceTypeWeekDays'
                                  className='w-100'
                                  classNamePrefix='select'
                                  placeholder=''
                                  styles={selectInputControlStyles(
                                    !!FormErrors.displayableError(
                                      form!,
                                      'consequenceTypeWeekDays',
                                    ),
                                  )}
                                  options={weekdays}
                                  value={formValues.consequenceTypeWeekDays}
                                  onChange={(vals: any) =>
                                    setFieldValue(
                                      isNested
                                        ? `constraints.${formIndex}.consequenceTypeWeekDays`
                                        : 'consequenceTypeWeekDays',
                                      vals,
                                    )
                                  }
                                />
                                <CustomErrorMessage
                                  name={
                                    isNested
                                      ? `constraints.${formIndex}.consequenceTypeWeekDays`
                                      : 'consequenceTypeWeekDays'
                                  }
                                  form={form}
                                />
                              </Grid>
                            )}
                          </Grid>
                        )}
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </Stack>
          )}
        </Grid>
        {/** Min-Max selection */}
        <Grid
          size={{
            sm: 12,
            md: 12,
          }}
        >
          <Stack
            rowGap={4}
            onMouseOver={() =>
              setActiveStep && setActiveStep(skipConsequence ? 2 : 3)
            }
            sx={{
              p: 2,
              border:
                activeStep === (skipConsequence ? 2 : 3)
                  ? '2px solid #4d53e0'
                  : '2px solid transparent',
              borderRadius: '0.5rem',
              mb: 2,
            }}
          >
            <Stack
              rowGap='0.85rem'
              sx={{
                padding: '1rem',
                borderRadius: '0.5rem',
              }}
            >
              {[
                ConstraintTypesValueTypes.TIME,
                ConstraintTypesValueTypes.USER_TO_SESSION,
              ].includes(formValues.constraintType?.value) && (
                <Grid
                  container
                  size={{
                    sm: 12,
                    md: 12,
                  }}
                >
                  <Grid
                    size={{
                      sm: 12,
                      md: 6,
                    }}
                  >
                    <Typography variant='subtitle2'>To Whom</Typography>
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 4,
                    }}
                  >
                    <Select
                      name='consequenceTypeEachOrAll'
                      className='w-100'
                      classNamePrefix='select'
                      placeholder=''
                      styles={selectInputControlStyles(false, false, false)}
                      options={EACH_OR_ALL_OPTIONS}
                      value={formValues.consequenceTypeEachOrAll}
                      onChange={(val: any) =>
                        setFieldValue(
                          isNested
                            ? `constraints.${formIndex}.consequenceTypeEachOrAll`
                            : 'consequenceTypeEachOrAll',
                          val,
                        )
                      }
                    />
                  </Grid>
                </Grid>
              )}
              {[
                ConstraintTypesValueTypes.USER_TO_USER,
                ConstraintTypesValueTypes.USER_TO_SESSION,
                ConstraintTypesValueTypes.TIME,
              ].includes(formValues.constraintType?.value) && (
                <Grid
                  container
                  size={{
                    sm: 12,
                    md: 12,
                  }}
                >
                  <Grid
                    size={{
                      sm: 12,
                      md: 6,
                    }}
                  >
                    <Typography variant='subtitle2'>
                      How frequently should this constraint be applied?
                    </Typography>
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 4,
                    }}
                  >
                    <Select
                      name='frequency'
                      className='w-100'
                      classNamePrefix='select'
                      placeholder=''
                      styles={selectInputControlStyles(false, false, false)}
                      options={updatedFrequencyOptions}
                      value={formValues.frequency}
                      onChange={(val: any) =>
                        setFieldValue(
                          isNested
                            ? `constraints.${formIndex}.frequency`
                            : 'frequency',
                          val,
                        )
                      }
                    />
                  </Grid>
                </Grid>
              )}

              {![
                ConstraintTypesValueTypes.AUTHORIZATION,
                ConstraintTypesValueTypes.SUPERVISION,
              ].includes(formValues.constraintType?.value) && (
                <Grid container>
                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <BinaryField
                      show
                      label='Does this constraint apply forever?'
                      name='forever'
                      clearedField='forever'
                      isNested={isNested}
                      formIndex={formIndex}
                      formValues={formValues}
                      values={values}
                      setValues={setValues}
                      setFieldValue={setFieldValue}
                      max
                    />
                  </Grid>
                  {!formValues.forever && (
                    <>
                      <Grid
                        size={{
                          sm: 6,
                          md: 3,
                        }}
                      >
                        <Typography variant='subtitle2'>
                          When is the start date?
                        </Typography>
                        <label htmlFor='start'>Start</label>
                        <DatePicker
                          id='start'
                          className='form-control'
                          name='start'
                          selected={formValues.start}
                          onChange={(val: any) => {
                            setFieldValue(
                              isNested
                                ? `constraints.${formIndex}.start`
                                : 'start',
                              val,
                            );
                          }}
                          dateFormat='MM-dd-yyyy'
                        />
                        <CustomErrorMessage
                          name={
                            isNested
                              ? `constraints.${formIndex}.start`
                              : 'start'
                          }
                          form={form}
                        />
                      </Grid>
                      <Grid
                        size={{
                          sm: 6,
                          md: 3,
                        }}
                      >
                        <Typography variant='subtitle2'>
                          When is the end date?
                        </Typography>
                        <label htmlFor='end'>End</label>
                        <DatePicker
                          id='end'
                          className='form-control'
                          name='end'
                          selected={formValues.end}
                          onChange={(val: any) => {
                            setFieldValue(
                              isNested ? `constraints.${formIndex}.end` : 'end',
                              val,
                            );
                          }}
                          dateFormat='MM-dd-yyyy'
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              )}

              <BinaryField
                show={!isDisabledArr.includes(formValues.constraintType?.value)}
                label='Do you want to deactivate this constraint?'
                name='disabled'
                clearedField='disabled'
                isNested={isNested}
                formIndex={formIndex}
                formValues={formValues}
                values={values}
                setValues={setValues}
                setFieldValue={setFieldValue}
                max
              />

              <BinaryField
                show={!isSoftArr.includes(formValues.constraintType?.value)}
                label='Is this a soft constraint?'
                name='soft'
                clearedField='soft'
                isNested={isNested}
                formIndex={formIndex}
                formValues={formValues}
                values={values}
                setValues={setValues}
                setFieldValue={setFieldValue}
                max
              />

              <BinaryField
                show={
                  formValues.constraintType?.value ===
                  ConstraintTypesValueTypes.GROUPING
                }
                label={
                  <span
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <span>All</span>
                    <LabelTooltip
                      title='Must have all in Common, see English description above.'
                      icon={<HelpOutlineIcon fontSize='small' />}
                    />
                  </span>
                }
                name='all'
                clearedField='all'
                isNested={isNested}
                formIndex={formIndex}
                formValues={formValues}
                values={values}
                setValues={setValues}
                setFieldValue={setFieldValue}
              />

              <Grid container spacing={2} size={{ xs: 12 }}>
                {!isForceLimitTrue(formValues.constraintType?.value) && (
                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <BinaryField
                      show={!isForceLimitTrue(formValues.constraintType?.value)}
                      label='Do you want to set a limit for this constraint?'
                      name='noLimit'
                      clearedField='noLimit'
                      isNested={isNested}
                      formIndex={formIndex}
                      formValues={formValues}
                      values={values}
                      setValues={setValues}
                      setFieldValue={setFieldValue}
                    />
                  </Grid>
                )}
                {formValues.noLimit && (
                  <>
                    {![
                      ConstraintTypesValueTypes.GAPS,
                      ConstraintTypesValueTypes.DRIVE,
                    ].includes(formValues.constraintType?.value) && (
                      <Grid
                        size={{
                          md: 2,
                        }}
                      >
                        <label htmlFor='min'>
                          Min{' '}
                          {isActivityRequired
                            ? ''
                            : (formValues?.units?.type !== 'distance'
                                ? formValues.units.type
                                : '') || ''}
                        </label>
                        <input
                          type='number'
                          name='min'
                          onChange={(event: any) => {
                            const val = event.target.value;
                            if (/^\d+$/.test(val) || val === '') {
                              setFieldValue(
                                isNested
                                  ? `constraints.${formIndex}.min`
                                  : 'min',
                                val,
                              );
                            }
                          }}
                          value={formValues.min}
                          className={`form-control ${FormErrors.validateStatus(
                            form!,
                            isNested ? `constraints.${formIndex}.min` : 'min',
                            null,
                          )}`}
                        />
                        <CustomErrorMessage
                          name={
                            isNested ? `constraints.${formIndex}.min` : 'min'
                          }
                          form={form}
                        />
                      </Grid>
                    )}
                    <Grid
                      size={{
                        md: 2,
                      }}
                    >
                      <label htmlFor='max'>
                        Max{' '}
                        {isActivityRequired
                          ? ''
                          : (formValues?.units?.type !== 'distance'
                              ? formValues.units.type
                              : '') || ''}
                      </label>
                      <input
                        type='number'
                        name='max'
                        min='0'
                        step='1'
                        onChange={(event: any) => {
                          const val = event.target.value;
                          if (/^\d+$/.test(val) || val === '') {
                            setFieldValue(
                              isNested ? `constraints.${formIndex}.max` : 'max',
                              val,
                            );
                          }
                        }}
                        value={formValues.max}
                        className={`form-control ${FormErrors.validateStatus(
                          form!,
                          isNested ? `constraints.${formIndex}.max` : 'max',
                          null,
                        )}`}
                      />
                      <CustomErrorMessage
                        name={isNested ? `constraints.${formIndex}.max` : 'max'}
                        form={form}
                      />
                    </Grid>
                    {[ConstraintTypesValueTypes.AUTHORIZATION].includes(
                      formValues.constraintType?.value,
                    ) && (
                      <Grid
                        size={{
                          md: 2,
                        }}
                      >
                        <label htmlFor='offset'>
                          Offset{' '}
                          {(formValues?.units?.type !== 'distance'
                            ? formValues.units.type
                            : '') || ''}
                        </label>
                        <input
                          type='number'
                          name='offset'
                          min='0'
                          step='1'
                          onChange={(event: any) => {
                            const val = event.target.value;
                            if (/^\d+$/.test(val) || val === '') {
                              setFieldValue(
                                isNested
                                  ? `constraints.${formIndex}.offset`
                                  : 'offset',
                                val,
                              );
                            }
                          }}
                          value={formValues.offset}
                          className={`form-control ${FormErrors.validateStatus(
                            form!,
                            isNested
                              ? `constraints.${formIndex}.offset`
                              : 'offset',
                            null,
                          )}`}
                        />
                        <CustomErrorMessage
                          name={
                            isNested
                              ? `constraints.${formIndex}.offset`
                              : 'offset'
                          }
                          form={form}
                        />
                      </Grid>
                    )}
                    {[
                      ConstraintTypesValueTypes.DRIVE,
                      ConstraintTypesValueTypes.TIME,
                      ConstraintTypesValueTypes.AUTHORIZATION,
                      ConstraintTypesValueTypes.DISTANCE,
                      ConstraintTypesValueTypes.GAPS,
                      ConstraintTypesValueTypes.BREAKQUANTITY,
                      ConstraintTypesValueTypes.SESSION_LENGTH,
                    ].includes(formValues.constraintType?.value) && (
                      <Grid
                        size={{
                          md: 2,
                        }}
                      >
                        <label htmlFor='units'>Units</label>
                        <Select
                          name='units'
                          className='w-100'
                          classNamePrefix='select'
                          placeholder=''
                          styles={selectInputControlStyles(
                            !!FormErrors.displayableError(
                              form!,
                              isNested
                                ? `constraints.${formIndex}.units`
                                : 'units',
                            ),
                          )}
                          options={updatedUnitsOptions}
                          value={formValues.units}
                          onChange={(val: any) =>
                            setFieldValue(
                              isNested
                                ? `constraints.${formIndex}.units`
                                : 'units',
                              val,
                            )
                          }
                        />
                        <CustomErrorMessage
                          name={
                            isNested
                              ? `constraints.${formIndex}.units`
                              : 'units'
                          }
                          form={form}
                        />
                      </Grid>
                    )}
                  </>
                )}
              </Grid>

              <BinaryField
                show={[ConstraintTypesValueTypes.AUTHORIZATION].includes(
                  formValues.constraintType?.value,
                )}
                label='Roll over'
                name='rollover'
                clearedField='rollover'
                isNested={isNested}
                formIndex={formIndex}
                formValues={formValues}
                values={values}
                setValues={setValues}
                setFieldValue={setFieldValue}
              />
              <BinaryField
                show={[
                  ConstraintTypesValueTypes.DRIVE,
                  ConstraintTypesValueTypes.DISTANCE,
                ].includes(formValues.constraintType?.value)}
                label='From Home'
                name='fromHome'
                clearedField='fromHome'
                isNested={isNested}
                formIndex={formIndex}
                formValues={formValues}
                values={values}
                setValues={setValues}
                setFieldValue={setFieldValue}
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CustomConstraintStepperForm;
