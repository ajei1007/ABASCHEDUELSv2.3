/* eslint-disable react-hooks/exhaustive-deps */
import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import { FieldArray } from 'formik';
import { Grid2 as Grid, Stack } from '@mui/material';
import timeconstraintsFields from 'pages/CRUD/Timeconstraints/helpers/timeconstraintsFields';
import RadioFormItem from 'components/FormItems/items/RadioFormItem';
import DatePickerFormItem from 'components/FormItems/items/DatePickerFormItem';
import Loader from 'components/Loader/Loader';
import { useEffect, useState } from 'react';
import axios from 'axios';

type TimeConstrainsFormProps = {
  form: any;
  modal?: any;
};

const AUTOCOMPLETE_SERVER_FETCH_SIZE = 100;

const TimeConstrainsForm = ({ form, modal }: TimeConstrainsFormProps) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      await fetchActivities();
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    const params = { limit: AUTOCOMPLETE_SERVER_FETCH_SIZE };
    const response = await axios.get(`/users/autocomplete/Activity`, {
      params,
    });
    setActivities(response.data);
  };
  const searchActivities = (_: any, val: string) => {
    if (activities.length) {
      return activities.filter((obj: any) =>
        obj.label.toLowerCase().includes(val.toLowerCase()),
      );
    }
    return [];
  };

  const { values } = form;
  if (loading) return <Loader />;
  return (
    <FieldArray name='timeconstraints'>
      {({ remove, push }) => (
        <div>
          {values.timeconstraints.length > 0 &&
            values.timeconstraints.map((timeconstraint: any, index: any) => (
              <div className='user-form-block' key={index}>
                <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6
                    }}>
                    <UsersSelectItem
                      name={`timeconstraints.${index}.user2`}
                      schema={timeconstraintsFields}
                      showCreate={!modal}
                      form={form}
                      fieldOption={timeconstraint}
                      fieldName='user2'
                      fieldLabel='Activity'
                      autoCompleteName='Activity'
                      extraFetchFunction={searchActivities}
                      fieldOptionData={'user2'}
                    />
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6
                    }}>
                    <InputNumberFormItem
                      name={`timeconstraints.${index}.offset`}
                      schema={timeconstraintsFields}
                      showCreate={!modal}
                      form={form}
                      fieldOption={timeconstraint}
                      fieldName='offset'
                    />
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6
                    }}>
                    <InputNumberFormItem
                      name={`timeconstraints.${index}.min`}
                      schema={timeconstraintsFields}
                      showCreate={!modal}
                      form={form}
                      fieldOption={timeconstraint}
                      fieldName='min'
                      required
                    />
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6
                    }}>
                    <InputNumberFormItem
                      name={`timeconstraints.${index}.max`}
                      schema={timeconstraintsFields}
                      showCreate={!modal}
                      form={form}
                      fieldOption={timeconstraint}
                      fieldName='max'
                      required
                    />
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6
                    }}>
                    <RadioFormItem
                      name={`timeconstraints.${index}.unit`}
                      schema={timeconstraintsFields}
                      fieldOption={timeconstraint}
                      fieldName='unit'
                      form={form}
                      required
                    />
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6
                    }}>
                    <RadioFormItem
                      name={`timeconstraints.${index}.frequency`}
                      schema={timeconstraintsFields}
                      fieldOption={timeconstraint}
                      fieldName='frequency'
                      form={form}
                      required
                    />
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6
                    }}>
                    <DatePickerFormItem
                      name={`timeconstraints.${index}.start`}
                      schema={timeconstraintsFields}
                      fieldOption={timeconstraint}
                      fieldName='start'
                      required
                    />
                  </Grid>
                  <Grid
                    size={{
                      sm: 12,
                      md: 6
                    }}>
                    <DatePickerFormItem
                      name={`timeconstraints.${index}.end`}
                      schema={timeconstraintsFields}
                      fieldOption={timeconstraint}
                      fieldName='end'
                      required
                    />
                  </Grid>
                </Grid>
                <Stack direction='row' justifyContent='flex-end'>
                  <button
                    className='btn remove-btn'
                    type='button'
                    onClick={() => {
                      remove(index);
                      if (timeconstraint.id) {
                        const deletedTimeConstrains =
                          form.values.deletedTimeConstrains;
                        if (deletedTimeConstrains) {
                          deletedTimeConstrains.push(timeconstraint.id);
                          form!.setFieldValue(
                            'deletedTimeConstrains',
                            deletedTimeConstrains,
                          );
                        } else {
                          form!.setFieldValue('deletedTimeConstrains', [
                            timeconstraint.id,
                          ]);
                        }
                      }
                    }}
                  >
                    Remove Time Constraint
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
                push({
                  id: '',
                  user2: '',
                  min: '',
                  max: '',
                  unit: '',
                  frequency: '',
                  start: null,
                  end: null,
                })
              }
            >
              Add Time Constraint
            </button>
          </Stack>
        </div>
      )}
    </FieldArray>
  );
};

export default TimeConstrainsForm;
