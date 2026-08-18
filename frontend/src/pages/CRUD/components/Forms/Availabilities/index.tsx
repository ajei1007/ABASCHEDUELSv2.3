import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import type { FormikProps } from 'formik';
import moment from 'moment';
import DatePickerFormItem from 'components/FormItems/items/DatePickerFormItem';
import DatePickerFormItemWithBlur from 'components/FormItems/items/DatePickerFormItemWithBlur';
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
import RadioFormItem from 'components/FormItems/items/RadioFormItem';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import availabilitiesFields from 'pages/CRUD/Availabilities/helpers/availabilitiesFields';
import DaysofweekSelectItem from 'components/DaysofweekSelectItem/DaysofweekSelectItem';
import { Grid2 as Grid } from '@mui/material';
import { availability_array } from 'constants/user_arrays';
import { getTimeZones } from 'utils/timezones';
import type { TimezoneType } from 'constants/timezonesArr';
import BranchesSelectItem from 'pages/CRUD/Branches/helpers/BranchesSelectItem';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import {
  getDaysOfWeekBetweenDates,
  getGivenDateOfMonth,
  getWeekNumberOfMonth,
  getWeekDayOfDate,
} from 'utils/weekdayGetters';
import { isDateRangeRecurring } from 'utils/isDateRangeRecurring';
import {
  recurranceOptions,
  frequencyOptions,
  repeatingOptions,
  weekNumberOptions,
  weekdayOptions,
  intervalOptions,
} from 'constants/recurrenceOptions';
import { REACT_SELECT_OPTION_DISABLED } from 'constants/symbols';
import { useLatestCallback } from 'hooks/useLatestCallback';

const formName = 'Availability';

interface AvailabilityFormProps {
  form: FormikProps<{
    [rest: string]: any;
  }>;
  modal: any;
  resourceName: string;
  availability?: any;
  index?: any;
  isFormArray?: boolean;
  hasUserField?: boolean;
  searchLocation?: (_: any, val: string) => Array<any>;
  searchDaysOfWeek?: (_: any, val: string) => Array<any>;
}

const initialRecurranceOption = (sDate: any, eDate: any) => {
  if (!isDateRangeRecurring(sDate, eDate)) {
    return recurranceOptions[0];
  }
  return recurranceOptions[4];
};

const timezoneSearch = (_: any, val: any = '') => {
  return getTimeZones().filter((tz: TimezoneType) =>
    tz.label.toLowerCase().includes(val.toLowerCase()),
  );
};

const allWeekdays = weekdayOptions.map((w) => ({
  id: w.value,
  name: w.name,
}));

const AvailabilityForm: FC<AvailabilityFormProps> = ({
  form,
  modal,
  resourceName,
  availability = null,
  index = null,
  isFormArray = false,
  hasUserField = false,
  searchLocation,
}) => {
  const getFormValues = () => {
    return isFormArray
      ? form.values?.availabilities?.[index] || {}
      : form.values || {};
  };

  const setFormValues = (values: any) => {
    for (const [key, value] of Object.entries(values)) {
      if (isFormArray) {
        form.setFieldValue(`availabilities.${index}.${key}`, value);
      } else {
        form.setFieldValue(key, value);
      }
    }
  };

  const {
    startTime,
    startRange,
    endRange,
    frequency,
    interval,
    bysetpos,
    days,
    oncall: isOncall,
    forever: isForever,
    allDay: isAllDay,
    everyDay: isEveryDay,
  } = getFormValues();

  const localStartRange = !isForever ? startRange : '2000-01-01';
  const localEndRange = !isForever ? endRange : '2100-01-01';
  const [selectedRecurranceOption, setSelectedRecurranceOption] = useState(
    initialRecurranceOption(localStartRange, localEndRange),
  );

  const [selectedRepeatingOption, setSelectedRepeatingOption] = useState(
    repeatingOptions[0],
  );

  const isRepeatingOptionsAvailable =
    selectedRecurranceOption.value === 1 ||
    selectedRecurranceOption.value === 2 ||
    selectedRecurranceOption.value === 3;

  const isMonthlySelected = frequency?.value === 'Monthly';
  const updatedRecurranceOptions = useMemo(() => {
    return recurranceOptions
      .filter((r) => {
        if (isForever && r.value !== 4) {
          return false;
        }
        const isWeekendDays =
          getWeekDayOfDate(startTime || startRange).pos === 0 ||
          getWeekDayOfDate(startTime || startRange).pos === 6;
        if (r.value === 3 && isWeekendDays) {
          return false;
        }
        return true;
      })
      .map((r) => {
        if (r.value === 1) {
          const selectedDateWeekday = getWeekDayOfDate(startTime || startRange);
          return {
            ...r,
            label: `Weekly on ${selectedDateWeekday.name}`,
          };
        }
        if (r.value === 2) {
          const selectedDateWeekday = getWeekDayOfDate(startTime || startRange);
          let monthWeekNumber: string | number = getWeekNumberOfMonth(
            startTime || startRange,
          );
          const lastWeekNumberOfTheMonth = getWeekNumberOfMonth(
            moment(startTime || startRange)
              .endOf('month')
              .format('YYYY-MM-DD'),
          );
          if (monthWeekNumber === lastWeekNumberOfTheMonth) {
            monthWeekNumber = 'last';
          }
          if (monthWeekNumber === 1) monthWeekNumber = 'first';
          if (monthWeekNumber === 2) monthWeekNumber = 'second';
          if (monthWeekNumber === 3) monthWeekNumber = 'third';
          if (monthWeekNumber === 4) monthWeekNumber = 'fourth';
          return {
            ...r,
            label: `Monthly on the ${monthWeekNumber} ${selectedDateWeekday.name}`,
          };
        }
        return r;
      });
  }, [startTime, startRange, isForever]);

  const updatedFrequencyOptions = useMemo(() => {
    const weeklyFrequencyPossible =
      moment(localEndRange).diff(localStartRange, 'weeks') > 0;
    const monthlyFrequencyPossible =
      moment(localEndRange).diff(localStartRange, 'months') > 0;
    return frequencyOptions
      .filter((fr) => {
        if (fr.value === 'Weekly') return weeklyFrequencyPossible;
        if (fr.value === 'Monthly') return monthlyFrequencyPossible;
        return true;
      })
      .map((fr) => {
        const intInterval = Number(interval?.value || 1);
        if (intInterval > 1) {
          return {
            ...fr,
            label: `${fr.name}s`,
          };
        }
        return fr;
      });
  }, [localEndRange, localStartRange, interval]);

  const updatedRepeatingOptions = useMemo(() => {
    return repeatingOptions.map((r) => {
      if (selectedRecurranceOption.value === 2) {
        return {
          ...r,
          type: 'months',
        };
      }
      return {
        ...r,
        type: 'weeks',
      };
    });
  }, [selectedRecurranceOption]);

  const updateRecurrenceOptions = useLatestCallback(
    ({ startTime, recurrenceOption }) => {
      const startTimeToDate = moment(startTime || startRange).toDate();
      skipUpdateWeekdays.current = true;
      // * Does not repeat - Update Recurrance to selected date (1 day)
      if (recurrenceOption === 0) {
        const selectedDateWeekday = getWeekDayOfDate(startTimeToDate);

        setFormValues({
          days: [
            {
              id: selectedDateWeekday.value,
              name: selectedDateWeekday.name,
            },
          ],
          bysetpos: weekNumberOptions[0],
          frequency: frequencyOptions.find((f) => f.value === 'Weekly'),
          startRange: startTimeToDate,
          endRange: startTimeToDate,
        });
      }
      // * Weekly
      if (recurrenceOption === 1) {
        const selectedDateWeekday = getWeekDayOfDate(startTimeToDate);
        const repeatingNumberAdded = moment(startTimeToDate)
          .add(selectedRepeatingOption.value, 'weeks')
          .toDate();

        // Update Weekday to selected day week
        // Update Frequency to Weekly
        // Update Recurrance from now to next 1 year
        setFormValues({
          days: [
            {
              id: selectedDateWeekday.value,
              name: selectedDateWeekday.name,
            },
          ],
          bysetpos: weekNumberOptions[0],
          frequency: frequencyOptions.find((f) => f.value === 'Weekly'),
          startRange: startTimeToDate,
          endRange: repeatingNumberAdded,
        });
      }
      // * Monthly
      if (recurrenceOption === 2) {
        let monthWeekNumber = getWeekNumberOfMonth(startTimeToDate);
        let stringMonthWeekNumber = '';
        const lastWeekNumberOfTheMonth = getWeekNumberOfMonth(
          moment(startTimeToDate).endOf('month').format('YYYY-MM-DD'),
        );
        if (monthWeekNumber === lastWeekNumberOfTheMonth) {
          stringMonthWeekNumber = '-1';
        } else {
          stringMonthWeekNumber = String(monthWeekNumber);
        }

        const selectedDateWeekday = getWeekDayOfDate(startTimeToDate);
        const nextMonth = moment(startTimeToDate)
          .add(selectedRepeatingOption.value, 'months')
          .startOf('month')
          .format('YYYY-MM-DD');
        const repeatingNumberAdded = getGivenDateOfMonth(
          nextMonth,
          selectedDateWeekday.pos,
          monthWeekNumber,
        );

        // Update Weekday to selected day week
        // Update Frequency to Monthly
        // Update Recurrance from now to next 1 year
        setFormValues({
          days: [
            {
              id: selectedDateWeekday.value,
              name: selectedDateWeekday.name,
            },
          ],
          bysetpos:
            weekNumberOptions.find((w) => w.value === stringMonthWeekNumber) ||
            weekNumberOptions[0],
          frequency: frequencyOptions.find((f) => f.value === 'Monthly'),
          startRange: startTimeToDate,
          endRange: repeatingNumberAdded,
        });
      }
      // * Every weekday (Monday to Friday)
      if (recurrenceOption === 3) {
        const mondayToFridayWeekdays = weekdayOptions
          .filter((w) => w.pos !== 0 && w.pos !== 6)
          .map((item) => ({
            id: item.value,
            name: item.name,
          }));
        const repeatingNumberAdded = moment(startTimeToDate)
          .add(selectedRepeatingOption.value, 'weeks')
          .toDate();

        // Update Weekday to selected day week
        // Update Frequency to Weekly
        // Update Recurrance from now to next 1 year
        setFormValues({
          days: mondayToFridayWeekdays,
          bysetpos: weekNumberOptions[0],
          frequency: frequencyOptions.find((f) => f.value === 'Weekly'),
          startRange: startTimeToDate,
          endRange: repeatingNumberAdded,
        });
      }
    },
  );

  const updateWeekdays = useLatestCallback(({ startRange, endRange }) => {
    const selectedDateWeekday = getWeekDayOfDate(startRange);
    const activeWeekDays = getDaysOfWeekBetweenDates(startRange, endRange);
    const filteredDays = (days || []).filter((item: any) =>
      activeWeekDays.includes(
        weekdayOptions.find((w) => w.value === item.id)?.pos ?? -1,
      ),
    );

    setFormValues({
      days:
        filteredDays.length > 0
          ? filteredDays
          : [
              {
                id: selectedDateWeekday.value,
                name: selectedDateWeekday.name,
              },
            ],
    });

    if (!isForever) {
      const newSelectedRecurranceOption = initialRecurranceOption(
        startRange,
        endRange,
      );

      if (
        newSelectedRecurranceOption.value !== selectedRecurranceOption.value
      ) {
        skipUpdateRecurrenceOptions.current = true;
        setSelectedRecurranceOption(newSelectedRecurranceOption);
      }
    }
  });

  const updateSelectedRecurranceOption = useLatestCallback(
    ({ isForever }: { isForever: boolean }) => {
      if (isForever) {
        if (selectedRecurranceOption.value !== 4) {
          setSelectedRecurranceOption(recurranceOptions[4]);
        }
      } else {
        updateWeekdays({
          startRange: localStartRange,
          endRange: localEndRange,
        });
      }
    },
  );

  const skipUpdateWeekdays = useRef(true);
  useEffect(() => {
    if (skipUpdateWeekdays.current) {
      skipUpdateWeekdays.current = false;
      return;
    }
    updateWeekdays({
      startRange: localStartRange,
      endRange: localEndRange,
    });
  }, [localStartRange, localEndRange, updateWeekdays]);

  const skipUpdateRecurrenceOptions = useRef(true);
  useEffect(() => {
    if (skipUpdateRecurrenceOptions.current) {
      skipUpdateRecurrenceOptions.current = false;
      return;
    }
    updateRecurrenceOptions({
      startTime,
      recurrenceOption: selectedRecurranceOption.value,
    });
  }, [startTime, selectedRecurranceOption.value, updateRecurrenceOptions]);

  const skipUpdateSelectedRecurranceOption = useRef(true);
  useEffect(() => {
    if (skipUpdateSelectedRecurranceOption.current) {
      skipUpdateSelectedRecurranceOption.current = false;
      return;
    }
    updateSelectedRecurranceOption({ isForever });
  }, [isForever, updateSelectedRecurranceOption]);

  const handleChangeRepeatingOption = (data: any) => {
    skipUpdateWeekdays.current = true;
    const _startTime = startTime || startRange;
    let repeatingNumberAdded = moment(_startTime)
      .add(data.value, data.type)
      .toDate();

    if (data.type === 'months') {
      let monthWeekNumber = getWeekNumberOfMonth(_startTime);
      const selectedDateWeekday = getWeekDayOfDate(_startTime);
      const nextMonth = moment(startRange)
        .add(data.value, data.type)
        .startOf('month')
        .format('YYYY-MM-DD');
      repeatingNumberAdded = getGivenDateOfMonth(
        nextMonth,
        selectedDateWeekday.pos,
        monthWeekNumber,
      );
    }

    setFormValues({
      startRange: _startTime,
      endRange: repeatingNumberAdded,
    });
    setSelectedRepeatingOption(data);
  };

  const searchDaysOfWeek = (_: any, value: string) => {
    const activeWeekDays = getDaysOfWeekBetweenDates(
      localStartRange,
      localEndRange,
    );
    return weekdayOptions.reduce((acc, item) => {
      if (
        !value ||
        item.label.toLowerCase().includes(`${value}`.toLowerCase())
      ) {
        const isActive = activeWeekDays.includes(item.pos);
        acc.push({
          id: item.value,
          label: item.name,
          ...(!isActive
            ? {
                [REACT_SELECT_OPTION_DISABLED]: true,
              }
            : {}),
        });
      }
      return acc;
    }, [] as any[]);
  };

  const daysOfWeekSelectKey = `${moment(localStartRange).format(
    'YYYY-MM-DD',
  )}-${moment(localEndRange).format('YYYY-MM-DD')}`;

  const daysPath = isFormArray ? `availabilities.${index}.days` : 'days';
  const prevEveryDay = useRef<boolean>(isEveryDay);

  const setFieldValue = form.setFieldValue;

  useEffect(() => {
    const wasEveryDay = prevEveryDay.current;
    if (!wasEveryDay && isEveryDay) {
      setFieldValue(daysPath, allWeekdays, false);
    }

    if (wasEveryDay && !isEveryDay) {
      setFieldValue(daysPath, [], false);
    }

    prevEveryDay.current = isEveryDay;
  }, [isEveryDay, daysPath, setFieldValue]);

  return (
    <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
      {hasUserField && (
        <Grid
          size={{
            sm: 12,
            md: 12
          }}>
          <UsersSelectItem
            name={'user'}
            schema={{ ...availabilitiesFields, type_type: resourceName }}
            showCreate={!modal}
            form={form}
            fieldLabel='User'
            required={availability_array[formName]['user']}
          />
        </Grid>
      )}
      {!isAllDay && (
        <>
          <Grid
            size={{
              sm: 12,
              md: 6
            }}>
            <DatePickerFormItem
              name={
                isFormArray ? `availabilities.${index}.startTime` : 'startTime'
              }
              schema={availabilitiesFields}
              showTimeInput
              required={availability_array[formName]['startTime']}
              fieldOption={availability}
              fieldName='startTime'
              showTimeSelectOnly={true}
            />
          </Grid>
          <Grid
            size={{
              sm: 12,
              md: 6
            }}>
            <DatePickerFormItem
              name={isFormArray ? `availabilities.${index}.endTime` : 'endTime'}
              schema={availabilitiesFields}
              showTimeInput
              required={availability_array[formName]['endTime']}
              fieldOption={availability}
              fieldName='endTime'
              showTimeSelectOnly={true}
            />
          </Grid>
        </>
      )}
      {!isEveryDay && (
        <>
          <Grid
            size={{
              sm: 12,
              md: 6
            }}>
            <DaysofweekSelectItem
              key={daysOfWeekSelectKey}
              mode='multiple'
              name={isFormArray ? `availabilities.${index}.days` : 'days'}
              schema={availabilitiesFields}
              showCreate={!modal}
              form={form}
              required={availability_array[formName]['days']}
              fieldOption={availability}
              fieldName='days'
              extraFetchFunction={searchDaysOfWeek}
              fieldOptionData={'days'}
            />
          </Grid>
        </>
      )}
      <Grid
        size={{
          sm: 12,
          md: 6
        }}>
        <UsersSelectItem
          name={isFormArray ? `availabilities.${index}.timezone` : 'timezone'}
          schema={availabilitiesFields}
          showCreate={!modal}
          form={form}
          fieldName='timezone'
          fieldLabel='Timezone'
          required={false}
          extraFetchFunction={timezoneSearch}
          fieldOption={availability}
          fieldOptionData={'timezone'}
        />
      </Grid>
      {resourceName === 'Client' && (
        <Grid
          size={{
            sm: 12,
            md: 12
          }}>
          <UsersSelectItem
            mode='multiple'
            name={
              isFormArray ? `availabilities.${index}.location2` : 'location2'
            }
            schema={{
              ...availabilitiesFields,
              type_type: 'Location',
            }}
            showCreate={!modal}
            form={form}
            fieldOption={availability}
            fieldName='location2'
            extraFetchFunction={searchLocation}
            fieldOptionData={'location2'}
            required={availability_array[formName]['location2']}
          />
        </Grid>
      )}
      {!isForever && (
        <>
          <Grid
            size={{
              sm: 12,
              md: 6
            }}>
            <DatePickerFormItemWithBlur
              name={
                isFormArray
                  ? `availabilities.${index}.startRange`
                  : 'startRange'
              }
              schema={availabilitiesFields}
              required={availability_array[formName]['startRange']}
              fieldOption={availability}
              fieldName='startRange'
            />
          </Grid>
          <Grid
            size={{
              sm: 12,
              md: 6
            }}>
            <DatePickerFormItemWithBlur
              name={
                isFormArray ? `availabilities.${index}.endRange` : 'endRange'
              }
              schema={availabilitiesFields}
              required={availability_array[formName]['endRange']}
              fieldOption={availability}
              fieldName='endRange'
            />
          </Grid>
        </>
      )}
      <Grid
        size={{
          sm: 12,
          md: 6
        }}>
        <div className='form-group'>
          <label>Recurrence option</label>
          <br />
          <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
            <Grid
              size={{
                sm: isRepeatingOptionsAvailable ? 7 : 12
              }}>
              <CustomSelect
                id='recurrance'
                menuPlacement='bottom'
                options={updatedRecurranceOptions}
                value={selectedRecurranceOption}
                onChange={setSelectedRecurranceOption}
              />
            </Grid>
            {isRepeatingOptionsAvailable && (
              <Grid
                size={{
                  sm: 5,
                  md: 5
                }}>
                <CustomSelect
                  id='repeating'
                  menuPlacement='top'
                  options={updatedRepeatingOptions}
                  value={selectedRepeatingOption}
                  onChange={handleChangeRepeatingOption}
                />
              </Grid>
            )}
          </Grid>
        </div>
      </Grid>
      <Grid
        size={{
          sm: 12,
          md: 6
        }}>
        {isDateRangeRecurring(localStartRange, localEndRange) &&
          selectedRecurranceOption.value === 4 &&
          updatedFrequencyOptions.length > 0 && (
            <div className='form-group'>
              <label>Repeat Every</label>
              <br />
              <Grid container spacing={2}>
                <Grid
                  size={{
                    sm: 4,
                    md: 4,
                    lg: 4,
                    xl: 3
                  }}>
                  <CustomSelect
                    id='interval'
                    menuPlacement='top'
                    options={intervalOptions}
                    value={interval ?? null}
                    onChange={(data: any) => {
                      const fr = frequency;
                      let updatedFrequency = fr;
                      if (Number(data.value) > 1) {
                        updatedFrequency.label = `${fr.name}s`;
                      } else {
                        updatedFrequency.label = `${fr.name}`;
                      }
                      setFormValues({
                        frequency: updatedFrequency,
                        interval: data,
                      });
                    }}
                  />
                </Grid>
                <Grid
                  size={{
                    sm: 4,
                    md: 4,
                    lg: 4,
                    xl: 3
                  }}>
                  <CustomSelect
                    id='frequency'
                    menuPlacement='top'
                    options={updatedFrequencyOptions}
                    value={frequency ?? null}
                    onChange={(data: any) => {
                      setFormValues({
                        frequency: data,
                        bysetpos:
                          data.value === 'Weekly'
                            ? weekNumberOptions[0]
                            : bysetpos,
                      });
                    }}
                  />
                </Grid>
                <Grid
                  size={{
                    sm: 4,
                    md: 4,
                    lg: 4,
                    xl: 3
                  }}>
                  {isMonthlySelected && (
                    <CustomSelect
                      id='bysetpos'
                      menuPlacement='top'
                      options={weekNumberOptions}
                      value={bysetpos ?? null}
                      onChange={(data: any) => {
                        setFormValues({
                          bysetpos: data,
                        });
                      }}
                    />
                  )}
                </Grid>
              </Grid>
            </div>
          )}
      </Grid>
      <Grid
        size={{
          sm: 12,
          md: 12
        }}>
        <RadioFormItem
          name={isFormArray ? `availabilities.${index}.status` : 'status'}
          schema={availabilitiesFields}
          required={availability_array[formName]['status']}
          fieldOption={availability}
          fieldName='status'
        />
      </Grid>
      {hasUserField && (
        <Grid
          size={{
            sm: 12,
            md: 2
          }}>
          <SwitchFormItem
            name={
              isFormArray ? `availabilities.${index}.available` : 'available'
            }
            schema={availabilitiesFields}
            required={availability_array[formName]['available']}
            fieldOption={availability}
            fieldName='available'
          />
        </Grid>
      )}
      {/* Commented Disabled Checkbox */}
      {/* <Grid item sm={12} md={3}>
        <SwitchFormItem
          name={isFormArray ? `availabilities.${index}.disabled` : 'disabled'}
          schema={availabilitiesFields}
          required={availability_array[formName]['disabled']}
          fieldOption={availability}
          fieldName='disabled'
        />
      </Grid> */}
      <Grid
        size={{
          sm: 12,
          md: 2
        }}>
        <SwitchFormItem
          name={isFormArray ? `availabilities.${index}.oncall` : 'oncall'}
          schema={availabilitiesFields}
          required={availability_array[formName]['oncall']}
          fieldOption={availability}
          fieldName='oncall'
        />
      </Grid>
      <Grid
        size={{
          sm: 12,
          md: 2
        }}>
        <SwitchFormItem
          name={isFormArray ? `availabilities.${index}.forever` : 'forever'}
          schema={availabilitiesFields}
          showCreate={!modal}
          form={form}
          fieldOption={availability}
          fieldName='forever'
          fieldOptionData={'forever'}
        />
      </Grid>
      <Grid
        size={{
          sm: 12,
          md: 2
        }}>
        <SwitchFormItem
          name={isFormArray ? `availabilities.${index}.allDay` : 'allDay'}
          schema={availabilitiesFields}
          showCreate={!modal}
          form={form}
          fieldOption={availability}
          fieldName='allDay'
          fieldOptionData={'allDay'}
        />
      </Grid>
      <Grid
        size={{
          sm: 12,
          md: 2
        }}>
        <SwitchFormItem
          name={isFormArray ? `availabilities.${index}.everyDay` : 'everyDay'}
          schema={availabilitiesFields}
          showCreate={!modal}
          form={form}
          fieldOption={availability}
          fieldName='everyDay'
          fieldOptionData={'everyDay'}
        />
      </Grid>
      {isOncall && (
        <Grid
          size={{
            sm: 12,
            md: 6
          }}>
          <BranchesSelectItem
            name={isFormArray ? `availabilities.${index}.branch` : 'branch'}
            schema={availabilitiesFields}
            showCreate={!modal}
            form={form}
            required={availability_array[formName]['branch']}
            // mode='multiple'
            fieldOption={availability}
            fieldName='branch'
            fieldOptionData={'branch'}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default AvailabilityForm;
