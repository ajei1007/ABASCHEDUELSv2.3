/* eslint-disable react-hooks/exhaustive-deps */
import UsersSelectItem from '../../helpers/UsersSelectItem';
import { Grid2 as Grid } from '@mui/material';
import { userUnmatchingFields } from '../../helpers/userUnmatchingFields';
import { user_arrays } from 'constants/user_arrays';
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
import { Stack } from '@mui/system';
import { FieldArray } from 'formik';
import { useEffect, useState } from 'react';
import axios from 'axios';

type UnmatchingFormProps = {
  form: any;
  modal?: any;
  resources: string;
};

const AUTOCOMPLETE_SERVER_FETCH_SIZE = 100;

const UnmatchingForm = ({ form, modal, resources }: UnmatchingFormProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      await fetchUsers();
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const params = { limit: AUTOCOMPLETE_SERVER_FETCH_SIZE };
    const response = await axios.get(`/users/autocomplete`, {
      params,
    });
    setUsers(response.data);
  };
  const searchUsers = (_: any, val: string) => {
    if (users.length) {
      return users.filter((obj: any) =>
        obj.label.toLowerCase().includes(val.toLowerCase()),
      );
    }
    return [];
  };

  const { values } = form;
  return (
    <FieldArray name='unmatching'>
      {({ remove, push }) => (
        <div>
          {values.unmatching.length > 0 &&
            values.unmatching.map((unmatching: any, index: any) => (
              <div className='user-form-block' key={index}>
                <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
                  {Object.keys(user_arrays[resources]).includes('user') && (
                    <Grid
                      size={{
                        sm: 12,
                        md: 6
                      }}>
                      <UsersSelectItem
                        name={`unmatching.${index}.user`}
                        schema={userUnmatchingFields}
                        showCreate={!modal}
                        form={form}
                        fieldLabel='User'
                        autoCompleteName='User'
                        fieldName='user'
                        fieldOption={unmatching}
                        extraFetchFunction={searchUsers}
                        fieldOptionData={'user'}
                      />
                    </Grid>
                  )}
                  {Object.keys(user_arrays[resources]).includes('soft') && (
                    <Grid
                      size={{
                        sm: 12,
                        md: 6
                      }}>
                      <SwitchFormItem
                        name={`unmatching.${index}.soft`}
                        schema={userUnmatchingFields}
                        fieldName='soft'
                        fieldOption={unmatching}
                      />
                    </Grid>
                  )}
                </Grid>
                <Stack direction='row' justifyContent='flex-end'>
                  <button
                    className='btn remove-btn'
                    type='button'
                    onClick={() => {
                      remove(index);
                      if (form.values.unmatching.id) {
                        const deletedUnmatching = form.values.deletedUnmatching;
                        if (deletedUnmatching) {
                          deletedUnmatching.push(form.values.unmatching.id);
                          form!.setFieldValue(
                            'deletedUnmatching',
                            deletedUnmatching,
                          );
                        } else {
                          form!.setFieldValue('deletedUnmatching', [
                            form.values.unmatching.id,
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
                  user: '',
                  soft: false,
                })
              }
            >
              Add Unmatching
            </button>
          </Stack>
        </div>
      )}
    </FieldArray>
  );
};

export default UnmatchingForm;
