/* eslint-disable react-hooks/exhaustive-deps */
import { FieldArray } from 'formik';
import { Stack } from '@mui/material';
import PriorityForm from 'pages/CRUD/components/Forms/Priorities';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from 'components/Loader/Loader';

type PrioritiesFormGroupProps = {
  form: any;
  modal?: any;
};

const AUTOCOMPLETE_SERVER_FETCH_SIZE = 100;

const PrioritiesFormGroup = ({ form, modal }: PrioritiesFormGroupProps) => {
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
    const response = await axios.get(`/users/autocomplete/Resource`, {
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
  if (loading) return <Loader />;
  return (
    <FieldArray name='priorities'>
      {({ remove, push }) => (
        <div>
          {values.priorities.length > 0 &&
            values.priorities.map((priority: any, index: any) => (
              <div className='user-form-block' key={index}>
                <PriorityForm
                  form={form}
                  modal={modal}
                  priority={priority}
                  index={index}
                  isFormArray
                  searchUsers={searchUsers}
                />
                <Stack direction='row' justifyContent='flex-end'>
                  <button
                    className='btn remove-btn'
                    type='button'
                    onClick={() => {
                      remove(index);
                      if (priority.id) {
                        const deletedPriorities = form.values.deletedPriorities;
                        if (deletedPriorities) {
                          deletedPriorities.push(priority.id);
                          form!.setFieldValue(
                            'deletedPriorities',
                            deletedPriorities,
                          );
                        } else {
                          form!.setFieldValue('deletedPriorities', [
                            priority.id,
                          ]);
                        }
                      }
                    }}
                  >
                    Remove Priority
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
              onClick={() => push({ id: '', user1: '', user2: '', rank: '' })}
            >
              Add Priority
            </button>
          </Stack>
        </div>
      )}
    </FieldArray>
  );
};

export default PrioritiesFormGroup;
