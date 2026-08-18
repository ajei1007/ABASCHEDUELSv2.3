/* eslint-disable react-hooks/exhaustive-deps */
import { FieldArray, type FormikProps } from 'formik';
import { Grid2 as Grid, Stack } from '@mui/material';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';
// @ts-ignore
import Select from 'react-select';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import initializeCustomConstraintValues from 'pages/CRUD/CustomConstraints/helpers/initializeCustomConstraintValues';
import FormErrors from 'components/FormItems/formErrors';
import { UnitOptionsTypes } from 'pages/CRUD/CustomConstraints/helpers/customTypes';
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
import { LabelTooltip } from './UserInformationForm';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

type AuthorizationConstraintProps = {
  form: FormikProps<{
    [rest: string]: any;
  }>;
  activities: any;
};

const AUTHORIZATION_UNITS = [
  { label: 'Minutes', value: 'minutes', type: UnitOptionsTypes.TIME },
  { label: 'Hours', value: 'hours', type: UnitOptionsTypes.TIME },
  { label: 'Unit', value: 'unit', type: UnitOptionsTypes.UNIT },
];

const AuthorizationConstraint = ({
  form,
  activities,
}: AuthorizationConstraintProps) => {
  const { values, setFieldValue } = form;

  const isRollover = values?.authorizations
    .map((auth: any) => {
      return auth.rollover;
    })
    .includes(true);

  const tooltipText = isRollover
    ? 'This authorization will be flagged for whole duration'
    : 'This authorization will be flagged weekly';

  return (
    <FieldArray name='authorizations'>
      {({ remove, push }) => (
        <div>
          {values?.authorizations?.length > 0 &&
            values.authorizations.map((authorization: any, index: any) => (
              <div className='user-form-block' key={index}>
                <Stack rowGap={2}>
                  <Stack>
                    <label htmlFor='antecedentTypeActivity'>Activity</label>
                    <Select
                      name='antecedentTypeActivity'
                      className='w-100'
                      classNamePrefix='select'
                      placeholder=''
                      styles={selectInputControlStyles(
                        !!FormErrors.displayableError(
                          form!,
                          `authorizations.${index}.antecedentTypeActivity`,
                        ),
                      )}
                      options={activities}
                      value={authorization.antecedentTypeActivity}
                      onChange={(val: any) =>
                        setFieldValue(
                          `authorizations.${index}.antecedentTypeActivity`,
                          val,
                        )
                      }
                    />
                    <CustomErrorMessage
                      name={`authorizations.${index}.antecedentTypeActivity`}
                      form={form}
                    />
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        sm: 12,
                        md: 6
                      }}>
                      <label htmlFor='start'>Start</label>
                      <DatePicker
                        id='start'
                        className='form-control'
                        name='start'
                        selected={authorization.start}
                        onChange={(val: any) =>
                          setFieldValue(`authorizations.${index}.start`, val)
                        }
                        dateFormat='MM-dd-yyyy'
                      />
                      <CustomErrorMessage
                        name={`authorizations.${index}.start`}
                        form={form}
                      />
                    </Grid>
                    <Grid
                      size={{
                        sm: 12,
                        md: 6
                      }}>
                      <label htmlFor='end'>End</label>
                      <DatePicker
                        id='end'
                        className='form-control'
                        name='end'
                        selected={authorization.end}
                        onChange={(val: any) =>
                          setFieldValue(`authorizations.${index}.end`, val)
                        }
                        dateFormat='MM-dd-yyyy'
                      />
                      <CustomErrorMessage
                        name={`authorizations.${index}.end`}
                        form={form}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        md: 2
                      }}>
                      <label htmlFor='min'>Weekly</label>
                      <input
                        type='number'
                        name='min'
                        onChange={(event: any) => {
                          const val = event.target.value;
                          if (/^\d+$/.test(val) || val === '') {
                            setFieldValue(`authorizations.${index}.min`, val);
                          }
                        }}
                        value={authorization.min}
                        className={`form-control ${FormErrors.validateStatus(
                          form!,
                          `authorizations.${index}.min`,
                          null,
                        )}`}
                      />
                      <CustomErrorMessage
                        name={`authorizations.${index}.min`}
                        form={form}
                      />
                    </Grid>
                    <Grid
                      size={{
                        md: 2
                      }}>
                      <label htmlFor='max'>Total</label>
                      <input
                        type='number'
                        name='max'
                        onChange={(event: any) => {
                          const val = event.target.value;
                          if (/^\d+$/.test(val) || val === '') {
                            setFieldValue(`authorizations.${index}.max`, val);
                          }
                        }}
                        value={authorization.max}
                        className={`form-control ${FormErrors.validateStatus(
                          form!,
                          `authorizations.${index}.max`,
                          null,
                        )}`}
                      />
                      <CustomErrorMessage
                        name={`authorizations.${index}.max`}
                        form={form}
                      />
                    </Grid>
                    <Grid
                      size={{
                        md: 2
                      }}>
                      <label htmlFor='offset'>Offset</label>
                      <input
                        type='number'
                        name='offset'
                        onChange={(event: any) => {
                          const val = event.target.value;
                          if (/^\d+$/.test(val) || val === '') {
                            setFieldValue(
                              `authorizations.${index}.offset`,
                              val,
                            );
                          }
                        }}
                        value={authorization.offset}
                        className={`form-control ${FormErrors.validateStatus(
                          form!,
                          `authorizations.${index}.offset`,
                          null,
                        )}`}
                      />
                      <CustomErrorMessage
                        name={`authorizations.${index}.offset`}
                        form={form}
                      />
                    </Grid>
                    <Grid
                      size={{
                        md: 2
                      }}>
                      <label htmlFor='units'>Units</label>
                      <Select
                        name='units'
                        className='w-100'
                        classNamePrefix='select'
                        placeholder=''
                        styles={selectInputControlStyles(
                          !!FormErrors.displayableError(
                            form!,
                            `authorizations.${index}.units`,
                          ),
                        )}
                        options={AUTHORIZATION_UNITS}
                        value={authorization.units}
                        onChange={(val: any) =>
                          setFieldValue(`authorizations.${index}.units`, val)
                        }
                      />
                      <CustomErrorMessage
                        name={`authorizations.${index}.units`}
                        form={form}
                      />
                    </Grid>
                    <Grid
                      size={{
                        sm: 12,
                        md: 3
                      }}>
                      <SwitchFormItem
                        name='rollover'
                        schema={{
                          rollover: {
                            type: 'boolean',
                            label: 'Roll over',
                          },
                        }}
                        onChange={(event: any) => {
                          const isChecked = event.target.checked;
                          setFieldValue(
                            `authorizations.${index}.rollover`,
                            isChecked,
                          );
                        }}
                        fieldOption={authorization}
                        fieldName='rollover'
                        children={
                          <LabelTooltip
                            title={tooltipText}
                            icon={<HelpOutlineIcon fontSize='small' />}
                          />
                        }
                      />
                    </Grid>
                    {/* <Grid item sm={12} md={3}>
                      <SwitchFormItem
                        name='pending'
                        schema={{
                          rollover: {
                            type: 'boolean',
                            label: 'Pending',
                          },
                        }}
                        onChange={(event: any) => {
                          const isChecked = event.target.checked;
                          setFieldValue(
                            `authorizations.${index}.pending`,
                            isChecked,
                          );
                        }}
                        fieldOption={authorization}
                        fieldName='pending'
                      />
                    </Grid> */}
                  </Grid>
                </Stack>

                <Stack direction='row' justifyContent='flex-end' mt={2}>
                  <button
                    className='btn remove-btn'
                    type='button'
                    onClick={() => {
                      remove(index);
                      if (authorization.id) {
                        const deletedAuthorizations =
                          form.values.deletedAvailabilities;
                        if (deletedAuthorizations) {
                          deletedAuthorizations.push(authorization.id);
                          form!.setFieldValue(
                            'deletedAuthorizations',
                            deletedAuthorizations,
                          );
                        } else {
                          form!.setFieldValue('deletedAuthorizations', [
                            authorization.id,
                          ]);
                        }
                      }
                    }}
                  >
                    Remove Authorization
                  </button>
                </Stack>
              </div>
            ))}
          <Stack
            direction='row'
            justifyContent='center'
            className='add-user-form-block'
          >
            <button
              className='btn add-btn'
              type='button'
              onClick={() =>
                push(
                  initializeCustomConstraintValues(null, {
                    groupings: [],
                    users: [],
                    branches: [],
                    weekdays: [],
                    locations: [],
                    activities,
                    subgroups: [],
                    roles: [],
                  }),
                )
              }
            >
              Add Authorization
            </button>
          </Stack>
        </div>
      )}
    </FieldArray>
  );
};

export default AuthorizationConstraint;
