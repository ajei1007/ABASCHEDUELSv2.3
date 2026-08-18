/* eslint-disable react-hooks/exhaustive-deps */
import { FieldArray, type FormikProps } from 'formik';
import { Stack } from '@mui/material';
import AvailabilityForm from 'pages/CRUD/components/Forms/Availabilities';
import { getTimezoneObjectFromValue } from 'utils/timezones';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from 'components/Loader/Loader';
import { useTypedSelector } from 'hooks/useTypedSelector';
import moment from 'moment';
import daysOfWeek from 'constants/daysOfWeek';
import {
  intervalOptions,
  frequencyOptions,
  weekNumberOptions,
} from 'constants/recurrenceOptions';

type AvailabilitiesFormGroupProps = {
  id?: string;
  form: FormikProps<{
    [rest: string]: any;
  }>;
  modal: any;
  resourceName: string;
};

const AUTOCOMPLETE_SERVER_FETCH_SIZE = 300;

const AvailabilitiesFormGroup = ({
  id,
  form,
  modal,
  resourceName,
}: AvailabilitiesFormGroupProps) => {
  const storeSettings = useTypedSelector((state: any) => state.settings);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      await fetchLocations();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    // const params = { limit: AUTOCOMPLETE_SERVER_FETCH_SIZE };
    const response = await axios.get(`/users/autocomplete/Location`, {
      // params,
    });
    setLocations(response.data);
  };

  const searchLocation = (_: any, val: string) => {
    if (locations.length) {
      return locations.filter((l: any) =>
        val ? l.label.toLowerCase().includes(val.toLowerCase()) : l,
      );
    }
    return [];
  };
  const searchDaysOfWeek = (_: any, val: string) => {
    return daysOfWeek.reduce(
      (acc, item) => {
        if (!val || item.label.toLowerCase().includes(`${val}`.toLowerCase())) {
          acc.push({
            id: item.value,
            label: item.label,
          });
        }
        return acc;
      },
      [] as { id: string; label: string }[],
    );
  };
  const { values } = form;
  const isRestricted =
    values?.availabilities?.length === 1 &&
    id === undefined &&
    (resourceName === 'Activity' ||
      resourceName === 'Funder' ||
      resourceName === 'Location');

  if (loading) return <Loader />;
  return (
    <FieldArray name='availabilities'>
      {({ remove, push }) => (
        <div>
          {values?.availabilities?.length > 0 &&
            values.availabilities.map((availability: any, index: any) => (
              <div className='user-form-block' key={index}>
                <AvailabilityForm
                  form={form}
                  modal={modal}
                  resourceName={resourceName}
                  availability={availability}
                  index={index}
                  isFormArray
                  searchLocation={searchLocation}
                  searchDaysOfWeek={searchDaysOfWeek}
                />
                {!isRestricted && (
                  <Stack direction='row' justifyContent='flex-end'>
                    <button
                      className='btn remove-btn'
                      type='button'
                      onClick={() => {
                        remove(index);
                        if (availability.id) {
                          const deletedAvailabilities =
                            form.values.deletedAvailabilities;
                          if (deletedAvailabilities) {
                            deletedAvailabilities.push(availability.id);
                            form!.setFieldValue(
                              'deletedAvailabilities',
                              deletedAvailabilities,
                            );
                          } else {
                            form!.setFieldValue('deletedAvailabilities', [
                              availability.id,
                            ]);
                          }
                        }
                      }}
                    >
                      Remove Availability
                    </button>
                  </Stack>
                )}
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
              onClick={() => {
                const startRange = new Date();
                const endRange = moment().add(5, 'years').toDate();
                push({
                  available: true,
                  days: [],
                  disabled: '',
                  endTime: null,
                  startTime: null,
                  endRange,
                  startRange,
                  interval: intervalOptions.find((e) => e.value === '1'),
                  frequency: frequencyOptions.find((e) => e.value === 'Weekly'),
                  bysetpos: weekNumberOptions.find((e) => e.value === '1'),
                  id: '',
                  location2: '',
                  user: '',
                  timezone: getTimezoneObjectFromValue(
                    storeSettings?.settingValues?.timezone,
                  ),
                  status: 'Approved',
                  forever: false,
                });
              }}
            >
              Add Availability
            </button>
          </Stack>
        </div>
      )}
    </FieldArray>
  );
};

export default AvailabilitiesFormGroup;
