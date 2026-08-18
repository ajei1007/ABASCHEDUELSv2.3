import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';
import { toast } from 'react-toastify';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import { useAppSelector } from 'store/hooks';
import {
  frequencyOptions,
  intervalOptions,
  recurranceOptions,
  repeatingOptions,
  weekdayOptions,
  weekNumberOptions,
} from 'constants/recurrenceOptions';
import style from '../Calendar.module.scss';
import {
  Grid2 as Grid,
  IconButton,
  Stack,
  Tooltip,
  Skeleton,
  Typography,
} from '@mui/material';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';
import CustomDateRangePicker from 'components/CustomDateRangePicker/CustomDateRangePicker';
import moment from 'moment';
import ToggleButton from '@mui/material/ToggleButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomAsyncSelect from 'components/CustomAsyncSelect/CustomAsyncSelect';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import AddressAutcompleteInput from '../../CRUD/Users/form/FormGroups/AddressAutcompleteInput';
import { getTimeZones } from 'utils/timezones';
import {
  getDaysOfWeekBetweenDates,
  getGivenDateOfMonth,
  getWeekDayOfDate,
  getWeekNumberOfMonth,
} from 'utils/weekdayGetters';
import { isDateRangeRecurring } from 'utils/isDateRangeRecurring';
import { getAddressCoordinates } from 'utils/getAddressCoordinates';
import CustomTimePicker from 'components/CustomTimePicker/CustomTimePicker';
import { useLoadResourceOptions } from '../hooks/useLoadResourceOptions';
import { useLoadActivityOptions } from '../hooks/useLoadActivityOptions';
import { useLoadLocationOptions } from '../hooks/useLoadLocationOptions';
import { useLoadBlockOptions } from '../hooks/useLoadBlockOptions';
import { formatResourceToSelectOption } from '../utils/formatResourceToSelectOption';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { LabelTooltip } from 'components/LabelTooltip/LabelTooltip';

const initialRecurranceOption = (sDate, eDate) => {
  if (!isDateRangeRecurring(sDate, eDate)) {
    return recurranceOptions[0];
  }
  return recurranceOptions[4];
};

// TODO move to add-event
const PopulateButton = ({ children, ...props }) => {
  const { onIconClick } = props.selectProps;
  const style = { cursor: 'pointer' };

  return (
    <components.Control {...props}>
      <Tooltip title='Populate Based on Client' arrow placement='top'>
        <span onMouseDown={onIconClick} style={style}>
          <AutoFixHighOutlinedIcon />
        </span>
      </Tooltip>

      {children}
    </components.Control>
  );
};

const EmployeesComponent = ({ data, ...props }) => {
  return (
    <components.Option {...props}>
      <div className='d-flex flex-wrap align-items-center'>
        {data.avatar && (
          <img className='avatar mr-2' src={data.avatar} alt='user' />
        )}
        <div>{data.label}</div>
      </div>
    </components.Option>
  );
};
const RecurranceDateDescription = ({ startDate, endDate, timezone }) => {
  const _startDate = moment(startDate).tz(timezone);
  const _edEndDate = moment(endDate).tz(timezone);
  return (
    <div className={style.infoText}>
      {_edEndDate.diff(_startDate, 'days') === 0 &&
      _startDate.isSame(new Date(), 'day') ? (
        <span className={style.primaryText}>Today</span>
      ) : (
        <>
          {_edEndDate.diff(_startDate, 'days') === 0 ? (
            <span className={style.primaryText}>
              {_startDate.format('Do MMMM')}
            </span>
          ) : (
            <>
              Event starts on{' '}
              <span className={style.primaryText}>
                {_startDate.format('MMM Do')}
              </span>
              , ends on{' '}
              <span className={style.primaryText}>
                {_edEndDate.format('MMM Do')}
              </span>
            </>
          )}
        </>
      )}
    </div>
  );
};
const ToggleButtonsMultiple = ({
  value,
  handleSelect,
  startDate,
  endDate,
  dataQa,
}) => {
  const activeWeekDays = getDaysOfWeekBetweenDates(startDate, endDate);
  const selectedDays = value.map((v) => v.value);

  const handleFormat = (_, selected) => {
    let _selectedDays = [];
    if (selectedDays.includes(selected)) {
      _selectedDays = selectedDays.filter((s) => s !== selected);
    } else {
      _selectedDays = [...selectedDays, selected];
    }
    const formattedSelectedDays = weekdayOptions.filter((w) =>
      _selectedDays.includes(w.value),
    );
    handleSelect(formattedSelectedDays);
  };
  return (
    <Stack direction='row' spacing='0.5rem'>
      {weekdayOptions.map((w, index) => {
        const isActive = activeWeekDays.includes(w.pos);
        return (
          <Tooltip
            key={index}
            title={
              isActive
                ? w.name
                : `${w.name} (You need to expand start/end dates to include disabled days !)`
            }
            placement='top'
            arrow
            disableFocusListener
          >
            <span>
              <ToggleButton
                disabled={!isActive}
                value={w.value}
                aria-label={w.value}
                size='small'
                className={style.toggleButton}
                selected={isActive && selectedDays.includes(w.value)}
                onChange={handleFormat}
                data-qa={dataQa ?? 'toggle-button-weekday'}
              >
                {w.label}
              </ToggleButton>
            </span>
          </Tooltip>
        );
      })}
    </Stack>
  );
};

const AddEventSidebarHelper = ({
  form,
  role_permissions,
  add_or_update,
  handleSelectBranches,
  selectedBranches,
  selectedEvent,
  timezones,
  isDeleted,
  eventResources,
  eventResourcesLoading,
}) => {
  const {
    sandboxMode,
    branches,
    users,
    canceled,
    // address,
    endPicker,
    startPicker,
    endRecurPicker,
    startRecurPicker,
    frequency,
    bysetpos,
    interval,
    weekdays,
    desc,
    user_canceled,
    reason_canceled,
    canceled_allday,
    makeUnavailableCanceledByUser,
    user_home,
    usersvirtual,
    pushNotification,
    timezone,
    //
    supervision,
    supervisionUsers,
    supervisionActivity,
    supervisionStartTime,
    supervisionEndTime,
    supervisionEvent_canceled,
    supervisionEvent_userCanceled,
    supervisionEvent_reasonCanceled,
    //
    converted,
    startActual,
    endActual,
    make_unavailable_allday,
  } = form.values;
  const { setFieldValue, setValues } = form;
  const storeLazyResources = useAppSelector(
    (state) => state.calendar.lazyResources,
  );
  const storeLazyResourcesFetchStatus = useAppSelector(
    (state) => state.calendar.lazyResourcesFetchStatus,
  );
  const storeLocationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const storeAvailabilities = useAppSelector(
    (state) => state.calendar.availabilities,
  );
  const storeReasonsCanceled = useAppSelector(
    (state) => state.calendar.reasons_canceled,
  );
  const storeSettingsValuesTimeInterval = useAppSelector(
    (state) => state.settings.settingValues['timeInterval'],
  );
  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const timezoneSettings = useAppSelector(
    (state) => state.settings.settingValues.timezone,
  );
  const isCurrentBranchLastTwoLowest = useAppSelector(
    (state) => state.calendar.isCurrentBranchLastTwoLowest,
  );

  const [selectedRecurranceOption, setSelectedRecurranceOption] = useState(
    initialRecurranceOption(startRecurPicker, endRecurPicker),
  );
  const [selectedRepeatingOption, setSelectedRepeatingOption] = useState(
    repeatingOptions[0],
  );
  const [funderPopulating, setFunderPopulating] = useState(false);

  const supervisionBlockRef = useRef(null);

  useEffect(() => {
    let timer = null;
    if (selectedEvent?.isSupervisionEvent) {
      if (supervisionBlockRef.current) {
        timer = setTimeout(() => {
          supervisionBlockRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          });
        }, 100);
      }
    }
    return () => clearTimeout(timer);
  }, [selectedEvent]);

  const peopleOptions = useMemo(
    () =>
      users.length
        ? [...users.filter((e) => e.roles && e.roles.includes('Person'))]
        : [],
    [users],
  );

  const roomOptions = useMemo(
    () => storeLocationResources.filter((e) => e?.roles?.includes('Room')),
    [storeLocationResources],
  );

  const populateAddressLocationRoom = (updatedUsers) => {
    // Set Address and user home
    if (updatedUsers?.length) {
      let userHome = updatedUsers.filter(
        (e) => e.roles.includes('Location') && e.roles.includes('Home'),
      );
      let selectedClients = updatedUsers.filter((e) => e.type === 'Client');
      let selectedEmployees = updatedUsers.filter((e) => e.type === 'Employee');
      const selectedUsersHome =
        selectedClients[0] ?? selectedEmployees[0] ?? null;
      if (userHome.length && selectedUsersHome) {
        setFieldValue('user_home', [selectedUsersHome]);
        populateAddressFromLocation(selectedClients[0]);
      } else {
        setFieldValue('user_home', []);
        const selectedLocation = updatedUsers.filter((e) =>
          e.roles.includes('Location'),
        );
        if (selectedLocation?.[0]) {
          populateAddressFromLocation(selectedLocation[0]);
        }
      }

      // Set Address based on availability
      const userIds = updatedUsers.map((u) => u.value);
      let userAvailabilities = storeAvailabilities.find(
        (av) =>
          userIds.includes(av.resourceIds?.[0]) && av.location?.length > 0,
      );
      if (userAvailabilities?.resourceIds?.[0] && userHome?.length === 0) {
        const locationUser = storeLocationResources.find(
          (r) => r.id === userAvailabilities?.location?.[0],
        );
        if (locationUser?.address) {
          populateAddressFromLocation(
            formatResourceToSelectOption(locationUser),
          );
        }
      }

      // Set room
      let selectedHome = updatedUsers.filter((e) => e.rooms);
      if (selectedHome.length && roomOptions?.length) {
        setFieldValue('rooms', [roomOptions[0]]);
      } else {
        setFieldValue('rooms', []);
      }
    }
  };

  const handleUsersChange = useLatestCallback((value, resourceName) => {
    let newUsers = users ? [...users] : [];
    newUsers = newUsers.filter((r) => r.type !== resourceName);
    let updatedUsers = [...newUsers, ...value];

    setFieldValue('users', updatedUsers);

    if (
      value.length === 0 ||
      (newUsers.length < users?.length && value[0].roles.includes('Person'))
    ) {
      let newUsersvirtual = usersvirtual ? [...usersvirtual] : [];
      newUsersvirtual = newUsersvirtual.filter((r) => r.type !== resourceName);
      setFieldValue('usersvirtual', [...newUsersvirtual, ...value]);
    }

    populateAddressLocationRoom(updatedUsers);
  });

  const handleFunderPopulateButton = async (event, resourceName) => {
    event.preventDefault();
    event.stopPropagation();
    if (funderPopulating) {
      return;
    }

    let clientResources = users.length
      ? [...users].filter((u) => u.type === 'Client')
      : [];

    if (clientResources.length === 0) {
      return;
    }

    let funder = clientResources[0].funder;
    if (!funder) {
      return;
    }

    setFunderPopulating(true);
    try {
      const response = await axios.get(`/scheduler/resource-by-ids`, {
        params: {
          users: funder.id,
        },
      });

      const resources = response?.data || [];
      if (resources.length === 0) {
        return;
      }

      handleUsersChange(
        [formatResourceToSelectOption(resources[0])],
        resourceName,
      );
    } catch (err) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
    } finally {
      setFunderPopulating(false);
    }
  };

  const handleSelectUsersHome = (val) => {
    setFieldValue('user_home', [val]);
    if (val) {
      populateAddressFromLocation(val);
    }
  };

  const populateAddressFromLocation = (val) => {
    if (val?.address) {
      setFieldValue('address', { label: val.address, value: val.address });
      getAddressCoordinates(val?.address ?? '').then(
        ({ latitude, longitude }) => {
          setFieldValue('latitude', latitude);
          setFieldValue('longitude', longitude);
        },
      );
    } else {
      setFieldValue('address', null);
      setFieldValue('latitude', null);
      setFieldValue('longitude', null);
    }
  };

  const handleSelectDateRange = (sDate, eDate) => {
    const selectedDateWeekday = getWeekDayOfDate(sDate);
    setValues({
      ...form.values,
      weekdays: [selectedDateWeekday],
      startRecurPicker: sDate,
      endRecurPicker: eDate,
    });
  };

  const handleSelectRecurranceOption = (data) => {
    const startPickerToDate = moment(startPicker).toDate();
    // * Does not repeat - Update Recurrance to selected date (1 day)
    if (data.value === 0) {
      const selectedDateWeekday = getWeekDayOfDate(startPickerToDate);
      setValues({
        ...form.values,
        weekdays: [selectedDateWeekday],
        frequency: [frequencyOptions.find((f) => f.value === 'Weekly')],
        startRecurPicker: startPickerToDate,
        endRecurPicker: endPicker,
      });
    }
    // * Weekly
    if (data.value === 1) {
      const selectedDateWeekday = getWeekDayOfDate(startPickerToDate);
      const repeatingNumberAdded = moment(startPickerToDate)
        .add(selectedRepeatingOption.value, 'weeks')
        .toDate();

      // Update Weekday to selected day week
      // Update Frequency to Weekly
      // Update Recurrance from now to next 1 year
      setValues({
        ...form.values,
        weekdays: [selectedDateWeekday],
        frequency: [frequencyOptions.find((f) => f.value === 'Weekly')],
        startRecurPicker: startPickerToDate,
        endRecurPicker: repeatingNumberAdded,
      });
    }
    // * Monthly
    if (data.value === 2) {
      let monthWeekNumber = getWeekNumberOfMonth(startPickerToDate);
      let stringMonthWeekNumber = '';
      const lastWeekNumberOfTheMonth = getWeekNumberOfMonth(
        moment(startPickerToDate).endOf('month').format('YYYY-MM-DD'),
      );
      if (monthWeekNumber === lastWeekNumberOfTheMonth) {
        stringMonthWeekNumber = '-1';
      } else {
        stringMonthWeekNumber = String(monthWeekNumber);
      }

      const selectedDateWeekday = getWeekDayOfDate(startPickerToDate);
      const nextMonth = moment(startRecurPicker)
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
      setValues({
        ...form.values,
        bysetpos: [
          weekNumberOptions.find((w) => w.value === stringMonthWeekNumber) ||
            weekNumberOptions[0],
        ],
        weekdays: [selectedDateWeekday],
        frequency: [frequencyOptions.find((f) => f.value === 'Monthly')],
        startRecurPicker: startPickerToDate,
        endRecurPicker: repeatingNumberAdded,
      });
    }
    // * Every weekday (Monday to Friday)
    if (data.value === 3) {
      const mondayToFridayWeekdays = weekdayOptions.filter(
        (w) => w.pos !== 0 && w.pos !== 6,
      );
      const repeatingNumberAdded = moment(startPickerToDate)
        .add(selectedRepeatingOption.value, 'weeks')
        .toDate();

      // Update Weekday to selected day week
      // Update Frequency to Weekly
      // Update Recurrance from now to next 1 year
      setValues({
        ...form.values,
        weekdays: [...mondayToFridayWeekdays],
        frequency: [frequencyOptions.find((f) => f.value === 'Weekly')],
        startRecurPicker: startPickerToDate,
        endRecurPicker: repeatingNumberAdded,
      });
    }
    // * Custom
    setSelectedRecurranceOption(data);
  };

  const handleChangeRepeatingOption = (data) => {
    let repeatingNumberAdded = moment(startPicker)
      .add(data.value, data.type)
      .toDate();

    if (data.type === 'months') {
      let monthWeekNumber = getWeekNumberOfMonth(startPicker);
      const selectedDateWeekday = getWeekDayOfDate(startPicker);
      const nextMonth = moment(startRecurPicker)
        .add(data.value, data.type)
        .startOf('month')
        .format('YYYY-MM-DD');
      repeatingNumberAdded = getGivenDateOfMonth(
        nextMonth,
        selectedDateWeekday.pos,
        monthWeekNumber,
      );
    }
    handleSelectDateRange(startPicker, repeatingNumberAdded);
    setSelectedRepeatingOption(data);
  };

  let isEmpNotReq = false;
  let isClientReq = false;
  let isLocationReq = false;
  users
    .filter((u) => u.type === 'Activity')
    .forEach((element) => {
      if (element.clientReq) isClientReq = true;
      if (element.locReq) isLocationReq = true;
      if (element.empNotReq) isEmpNotReq = true;
    });

  const lazyEmployeeResources = useMemo(
    () => storeLazyResources.filter((item) => item.type === 'Employee'),
    [storeLazyResources],
  );
  const lazyEmployeeResourcesLoaded =
    storeLazyResourcesFetchStatus[
      `${storeCurrentBranches[0]?.value}:Employee`
    ] === 'success';

  const lazyClientResources = useMemo(
    () => storeLazyResources.filter((item) => item.type === 'Client'),
    [storeLazyResources],
  );
  const lazyClientResourcesLoaded =
    storeLazyResourcesFetchStatus[
      `${storeCurrentBranches[0]?.value}:Client`
    ] === 'success';

  const lazyFunderResources = useMemo(
    () => storeLazyResources.filter((item) => item.type === 'Funder'),
    [storeLazyResources],
  );
  const lazyFunderResourcesLoaded = isCurrentBranchLastTwoLowest;

  const {
    shouldShowDefaultOptions: shouldShowEmployeeDefaultOptions,
    loadResourceOptions: loadEmployeeOptions,
  } = useLoadResourceOptions({
    resourceTypes: ['Employee'],
    resources: [
      ...lazyEmployeeResources,
      ...eventResources.filter((e) => e.type === 'Employee'),
    ],
    resourcesLoaded: lazyEmployeeResourcesLoaded,
    branches: selectedBranches,
  });

  const {
    shouldShowDefaultOptions: shouldShowClientDefaultOptions,
    loadResourceOptions: loadClientOptions,
  } = useLoadResourceOptions({
    resourceTypes: ['Client'],
    resources: [
      ...lazyClientResources,
      ...eventResources.filter((e) => e.type === 'Client'),
    ],
    resourcesLoaded: lazyClientResourcesLoaded,
    branches: selectedBranches,
  });

  const {
    shouldShowDefaultOptions: shouldShowFunderDefaultOptions,
    loadResourceOptions: loadFunderOptions,
  } = useLoadResourceOptions({
    resourceTypes: ['Funder'],
    branches: selectedBranches,
    resources: [
      ...lazyFunderResources,
      ...eventResources.filter((e) => e.type === 'Funder'),
    ],
    resourcesLoaded: lazyFunderResourcesLoaded,
  });

  const {
    shouldShowDefaultOptions: shouldShowEmployeeSupervisionOptions,
    loadResourceOptions: loadEmployeeSupervisionOptions,
  } = useLoadResourceOptions({
    resourceTypes: ['Employee'],
    resources: [
      ...lazyEmployeeResources,
      ...eventResources.filter((e) => e.type === 'Employee'),
    ],
    resourcesLoaded: lazyEmployeeResourcesLoaded,
    branches: selectedBranches,
    postLoadFilter: (resources) =>
      resources.filter(
        (resource) => !users.some((user) => user?.value === resource?.id),
      ),
  });

  const {
    shouldShowDefaultOptions: shouldShowActivityDefaultOptions,
    loadResourceOptions: loadActivityOptions,
  } = useLoadActivityOptions({
    resources: eventResources.filter((e) => e.type === 'Activity'),
    branches: selectedBranches,
  });

  const {
    shouldShowDefaultOptions: shouldShowLocationOptions,
    loadResourceOptions: loadLocationOptions,
  } = useLoadLocationOptions({
    branches: selectedBranches,
    resources: eventResources.filter((e) => e.type === 'Location'),
  });

  const {
    shouldShowDefaultOptions: shouldShowBlockDefaultOptions,
    loadResourceOptions: loadBlockOptions,
  } = useLoadBlockOptions({
    branches: selectedBranches,
    resources: eventResources.filter((e) => e.type === 'Block'),
  });

  const {
    shouldShowDefaultOptions: shouldShowActivitySupervisionOptions,
    loadResourceOptions: loadActivitySupervisionOptions,
  } = useLoadActivityOptions({
    branches: selectedBranches,
    includeSupervision: true,
    resources: eventResources.filter((e) => e.type === 'Activity'),
    postLoadFilter: (resources) =>
      resources.filter((resource) => resource.supervision),
  });

  const {
    shouldShowDefaultOptions: shouldShowLocationRoomOptions,
    loadResourceOptions: loadLocationRoomOptions,
  } = useLoadLocationOptions({
    branches: selectedBranches,
    includeRooms: true,
    resources: eventResources.filter((e) => e.type === 'Location'),
    postLoadFilter: (resources) =>
      resources.filter((resource) => resource?.roles?.includes('Room')),
  });

  const loadNotifUsersOptions = useCallback(
    (inputValue, callback) => {
      const updatedPeopleOptions = peopleOptions.map((p) => ({
        ...p,
        highlight: true,
      }));

      if (!inputValue) {
        callback([
          {
            label: 'Users in Event',
            options: updatedPeopleOptions,
          },
        ]);
        return;
      }

      loadEmployeeOptions(inputValue, (employees) => {
        callback([
          {
            label: 'Users in Event',
            options: updatedPeopleOptions.filter((p) =>
              `${p.label}`
                .toLowerCase()
                .includes(`${inputValue}`.toLowerCase()),
            ),
          },
          {
            label: 'Employees not in Event',
            options: employees.filter(
              (employee) =>
                updatedPeopleOptions.findIndex(
                  (p) => p.value === employee.value,
                ) === -1,
            ),
          },
        ]);
      });
    },
    [peopleOptions, loadEmployeeOptions],
  );

  const loadOptionsMap = {
    Employee: {
      defaultOptions: shouldShowEmployeeDefaultOptions,
      loadOptions: loadEmployeeOptions,
    },
    Client: {
      defaultOptions: shouldShowClientDefaultOptions,
      loadOptions: loadClientOptions,
    },
    Activity: {
      defaultOptions: shouldShowActivityDefaultOptions,
      loadOptions: loadActivityOptions,
    },
    Funder: {
      defaultOptions: shouldShowFunderDefaultOptions,
      loadOptions: loadFunderOptions,
    },
    Block: {
      defaultOptions: shouldShowBlockDefaultOptions,
      loadOptions: loadBlockOptions,
    },
    Location: {
      defaultOptions: shouldShowLocationOptions,
      loadOptions: loadLocationOptions,
    },
  };

  const resources = [
    'Employee',
    'Client',
    'Activity',
    'Funder',
    'Block',
    'Location',
  ].map((e) => {
    return {
      name: e,
      label:
        ['Activity'].includes(e) ||
        (['Location'].includes(e) && isLocationReq) ||
        (['Employee'].includes(e) && !isEmpNotReq) ||
        (['Client'].includes(e) && isClientReq)
          ? e + '*'
          : e,
      multi: ['Activity', 'Location', 'Funder'].includes(e) ? false : true,
      loadOptions: loadOptionsMap[e].loadOptions,
      defaultOptions: loadOptionsMap[e].defaultOptions,
      isDisabled: isDeleted || (['Funder'].includes(e) && funderPopulating),
      isLoading: ['Funder'].includes(e) && funderPopulating,
      hasPopulateButton: ['Funder'].includes(e),
      populateEvent: handleFunderPopulateButton,
    };
  });

  const updatedRecurranceOptions = useMemo(() => {
    return recurranceOptions
      .filter((r) => {
        const isWeekendDays =
          getWeekDayOfDate(startPicker).pos === 0 ||
          getWeekDayOfDate(startPicker).pos === 6;
        if (r.value === 3 && isWeekendDays) {
          return false;
        }
        return true;
      })
      .map((r) => {
        if (r.value === 1) {
          const selectedDateWeekday = getWeekDayOfDate(startPicker);
          return {
            ...r,
            label: `Weekly on ${selectedDateWeekday.name}`,
          };
        }
        if (r.value === 2) {
          const selectedDateWeekday = getWeekDayOfDate(startPicker);
          let monthWeekNumber = getWeekNumberOfMonth(startPicker);
          const lastWeekNumberOfTheMonth = getWeekNumberOfMonth(
            moment(startPicker).endOf('month').format('YYYY-MM-DD'),
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
  }, [startPicker]);

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

  const personCanceledOptions = useMemo(
    () =>
      users.length
        ? [...users.filter((e) => e.roles && e.roles.includes('Person'))]
        : [],
    [users],
  );

  const isMonthlySelected = frequency?.[0]?.value === 'Monthly';
  const updatedFrequencyOptions = useMemo(() => {
    const weeklyFrequencyPossible =
      moment(endRecurPicker).diff(startRecurPicker, 'weeks') > 0;
    const monthlyFrequencyPossible =
      moment(endRecurPicker).diff(startRecurPicker, 'months') > 0;
    return frequencyOptions
      .filter((fr) => {
        if (fr.value === 'Weekly') return weeklyFrequencyPossible;
        if (fr.value === 'Monthly') return monthlyFrequencyPossible;
        return true;
      })
      .map((fr) => {
        const intInterval = Number(interval[0]?.value || 1);
        if (intInterval > 1) {
          return {
            ...fr,
            label: `${fr.name}s`,
          };
        }
        return fr;
      });
  }, [endRecurPicker, startRecurPicker, interval]);
  const duration = moment.duration(moment(endPicker).diff(startPicker));
  // duration in hours
  const hours = parseInt(duration.asHours());
  const formattedHours = hours ? hours + ' hr' + (hours > 1 ? 's ' : ' ') : '';
  // duration in minutes
  const minutes = parseInt(duration.asMinutes()) % 60;
  const formattedMinutes = minutes
    ? minutes + ' min' + (minutes > 1 ? 's ' : ' ')
    : '';

  const isRepeatingOptionsAvailable =
    selectedRecurranceOption.value === 1 ||
    selectedRecurranceOption.value === 2 ||
    selectedRecurranceOption.value === 3;

  const noOptionsMessage = useCallback(({ inputValue, defaultOptions }) => {
    if (defaultOptions || (inputValue && inputValue.length > 1)) {
      return <Typography fontSize='0.875rem'>No options</Typography>;
    }

    return (
      <Typography fontSize='0.875rem'>Type 2+ chars to search...</Typography>
    );
  }, []);

  const loadingMessage = useCallback(() => {
    return <Typography fontSize='0.875rem'>Loading...</Typography>;
  }, []);

  const makeSelectContainer = (qa) => (props) => (
    <components.SelectContainer
      {...props}
      /* merge whatever react-select already passes */
      innerProps={{
        ...props.innerProps,
        'data-qa': qa,
      }}
    />
  );
  return (
    <Stack className='add-event-wrapper' rowGap='1rem'>
      {/* Users and Locations */}
      <Grid container spacing='0.5rem' columns={{ sm: 12, md: 12 }}>
        {resources.map((res) => (
          <Grid
            key={res.name}
            size={{
              sm: 12,
              md: 6,
            }}
          >
            <label htmlFor={res.name}>{res.label}</label>
            {eventResourcesLoading ? (
              <Skeleton height={40} variant='rounded' />
            ) : (
              <div
                data-qa={`appointment-${res.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <AsyncSelect
                  key={res.name}
                  isMulti={res.multi}
                  menuPortalTarget={document.body}
                  id={res.name}
                  styles={selectInputControlStyles(
                    false,
                    false,
                    res.hasPopulateButton,
                  )}
                  className={'w-100'}
                  classNamePrefix='select'
                  placeholder=''
                  isClearable={false}
                  isDisabled={res.isDisabled}
                  isLoading={res.isLoading}
                  loadOptions={res.loadOptions}
                  defaultOptions={res.defaultOptions}
                  noOptionsMessage={({ inputValue }) =>
                    noOptionsMessage({
                      inputValue,
                      defaultOptions: res.defaultOptions,
                    })
                  }
                  loadingMessage={loadingMessage}
                  onIconClick={(e) => {
                    return res.populateEvent(e, res.name);
                  }}
                  value={
                    users && users.length
                      ? [...users].filter((e) => e.type === res.name)
                      : null
                  }
                  onChange={(data) =>
                    handleUsersChange(
                      Array.isArray(data) ? [...data] : [data],
                      res.name,
                    )
                  }
                  components={{
                    Option: EmployeesComponent,
                    ...(res.hasPopulateButton === true && {
                      Control: PopulateButton,
                    }),
                  }}
                />
              </div>
            )}
          </Grid>
        ))}
        {users.flatMap((e) => e.roles).includes('Home') && (
          <Grid
            size={{
              sm: 12,
              md: 6,
            }}
          >
            <label htmlFor='user_home'>Person's Home</label>
            <CustomSelect
              id='user_home'
              options={peopleOptions}
              name='user_home'
              value={user_home.length ? [...user_home] : null}
              onChange={handleSelectUsersHome}
              isDisabled={isDeleted}
              dataQa='appointment-person-home'
            />
          </Grid>
        )}
        {users.filter((e) => e?.rooms?.length)?.length > 0 && (
          <Grid
            size={{
              sm: 12,
              md: 6,
            }}
          >
            <label htmlFor='rooms'>Room</label>
            {eventResourcesLoading ? (
              <Skeleton key='skeleton' height={40} variant='rounded' />
            ) : (
              <CustomAsyncSelect
                key='rooms'
                id='rooms'
                value={form.values.rooms}
                name='rooms'
                loadOptions={loadLocationRoomOptions}
                onChange={(data) => {
                  setFieldValue('rooms', [data]);
                }}
                defaultOptions={shouldShowLocationRoomOptions}
                isDisabled={isDeleted}
                data-qa='appointment-rooms'
              />
            )}
          </Grid>
        )}
      </Grid>
      {/* Branches */}
      <Grid container rowSpacing='0.5rem' columns={{ sm: 12 }}>
        <Grid
          size={{
            sm: 12,
          }}
        >
          <label htmlFor='branches'>Add Branch for More User Options</label>
          <CustomSelect
            options={branches}
            value={selectedBranches[0]}
            onChange={handleSelectBranches}
            isDisabled={isDeleted}
            dataQa='appointment-branches'
          />
        </Grid>
      </Grid>
      {/* Address and Note */}
      <Grid container rowSpacing='0.5rem' columns={{ sm: 12 }}>
        <Grid
          size={{
            sm: 12,
          }}
        >
          {/* <Stack direction='row'>
            <label htmlFor='address'>Address</label>
            <Tooltip title='Populate Based on Location' placement='right' arrow>
              <button
                id='MagicButtonTooltip'
                className='magic-button'
                type='button'
                onClick={handleLocationPopulateButton}
              >
                <AutoFixHighOutlinedIcon />
              </button>
            </Tooltip>
          </Stack> */}
          {/* <CustomInput
            id='address'
            value={address}
            name='address'
            onChange={form.handleChange}
          /> */}
          <AddressAutcompleteInput
            form={form}
            name='address'
            label='Address'
            disabled={isDeleted}
            dataQa='appointment-address'
          />
        </Grid>
        <Grid
          size={{
            sm: 12,
          }}
        >
          <label htmlFor='desc'>Notes</label>
          <textarea
            name='desc'
            id='desc'
            rows='2'
            value={desc}
            onChange={form.handleChange}
            placeholder=''
            className='form-control'
            disabled={isDeleted}
            data-qa='appointment-notes'
          />
        </Grid>
      </Grid>
      {/* Start Time and End Time */}
      <Grid container columnSpacing='0.5rem' columns={{ sm: 12, md: 12 }}>
        <Grid size={8}>
          <label>
            Start & End Recurrence Range
            <LabelTooltip
              title='You can select date range for recurrence (Includes last day)'
              icon={<HelpOutlineIcon fontSize='small' />}
            />
          </label>
          <CustomDateRangePicker
            startDate={startRecurPicker}
            endDate={endRecurPicker}
            onSubmit={(sDate, eDate) => {
              handleSelectDateRange(sDate, eDate);
              setSelectedRecurranceOption(
                initialRecurranceOption(sDate, eDate),
              );
            }}
            dataQa='appointment-recurrence-date-range-picker'
          />
          <RecurranceDateDescription
            startDate={startRecurPicker}
            endDate={endRecurPicker}
            timezone={timezoneSettings}
            isDisabled={isDeleted}
            dataQa='appointment-recurrence-date-description'
          />
        </Grid>
        <Grid size={4}>
          <Grid container columnSpacing='0.5rem' columns={{ sm: 12, md: 12 }}>
            <Grid size={6}>
              <label htmlFor='startDate'>*Start</label>
              <CustomTimePicker
                value={startPicker}
                onChange={(value) => setFieldValue('startPicker', value)}
                interval={storeSettingsValuesTimeInterval}
                dataQa='appointment-start-time-picker'
              />
            </Grid>
            <Grid size={6}>
              <label htmlFor='endPicker'>*End</label>
              <CustomTimePicker
                value={endPicker}
                onChange={(value) => setFieldValue('endPicker', value)}
                interval={storeSettingsValuesTimeInterval}
                dataQa='appointment-end-time-picker'
              />
            </Grid>
            <Grid
              size={{
                sm: 12,
                md: 12,
              }}
              data-qa='appointment-duration'
            >
              <div className={style.infoText}>
                Duration:{' '}
                <span className={style.primaryText}>
                  {formattedHours + formattedMinutes}
                </span>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/* Recurrance Event Inputs */}
      <Grid
        container
        spacing='0.5rem'
        alignItems='center'
        columns={{ sm: 12, md: 12 }}
      >
        <Grid
          size={{
            sm: isRepeatingOptionsAvailable ? 7 : 12,
          }}
        >
          <CustomSelect
            id='recurrance'
            menuPlacement='bottom'
            options={updatedRecurranceOptions}
            value={selectedRecurranceOption}
            onChange={handleSelectRecurranceOption}
            isDisabled={isDeleted}
            dataQa='appointment-recurrence-select'
          />
        </Grid>
        {isRepeatingOptionsAvailable && (
          <>
            <Grid
              size={{
                sm: 5,
                md: 5,
              }}
            >
              <CustomSelect
                id='repeating'
                menuPlacement='top'
                options={updatedRepeatingOptions}
                value={selectedRepeatingOption}
                onChange={handleChangeRepeatingOption}
                isDisabled={isDeleted}
                dataQa='appointment-recurrence-repeating-select'
              />
            </Grid>
          </>
        )}
        {isDateRangeRecurring(startRecurPicker, endRecurPicker) &&
          selectedRecurranceOption.value === 4 &&
          updatedFrequencyOptions.length > 0 && (
            <>
              <Grid>
                <p className={style.infoText}>Repeat Every</p>
              </Grid>
              <Grid>
                <CustomSelect
                  id='interval'
                  menuPlacement='top'
                  options={intervalOptions}
                  value={interval.length ? [...interval] : null}
                  onChange={(data) => {
                    const fr = frequency[0];
                    let updatedFrequency = fr;
                    if (Number(data.value) > 1) {
                      updatedFrequency.label = `${fr.name}s`;
                    } else {
                      updatedFrequency.label = `${fr.name}`;
                    }
                    setValues({
                      ...form.values,
                      frequency: [updatedFrequency],
                      interval: [data],
                    });
                  }}
                  isDisabled={isDeleted}
                  dataQa='appointment-recurrence-interval-select'
                />
              </Grid>
              <Grid
                size={{
                  sm: 3,
                  md: 3,
                }}
              >
                <CustomSelect
                  id='frequency'
                  menuPlacement='top'
                  options={updatedFrequencyOptions}
                  value={frequency.length ? [...frequency] : null}
                  onChange={(data) => setFieldValue('frequency', [data])}
                  isDisabled={isDeleted}
                  dataQa='appointment-recurrence-frequency-select'
                />
              </Grid>
              {isMonthlySelected && (
                <Grid
                  size={{
                    sm: 4,
                    md: 4,
                  }}
                >
                  <CustomSelect
                    id='bysetpos'
                    menuPlacement='top'
                    options={weekNumberOptions}
                    value={bysetpos.length ? [...bysetpos] : null}
                    onChange={(data) => setFieldValue('bysetpos', [data])}
                    isDisabled={isDeleted}
                    dataQa='appointment-recurrence-bysetpos-select'
                  />
                </Grid>
              )}
            </>
          )}
      </Grid>
      {/* Timezone */}
      <Grid container spacing='0.5rem' columns={{ sm: 12, md: 12 }}>
        <Grid size={12}>
          <label>Timezone</label>
          <CustomSelect
            menuPlacement='top'
            options={timezones}
            value={getTimeZones().find((t) => t.id === timezone?.value) ?? null}
            onChange={(data) => setFieldValue('timezone', data)}
            isDisabled={isDeleted}
            dataQa='appointment-timezone-select'
          />
        </Grid>
      </Grid>
      {/* Weekdays */}
      <Grid container spacing='0.5rem' columns={{ sm: 12, md: 12 }}>
        <Grid>
          <label htmlFor='weekdays'>Weekdays</label>
          <ToggleButtonsMultiple
            value={weekdays}
            startDate={moment(startRecurPicker).format('YYYY-MM-DD')}
            endDate={moment(endRecurPicker).format('YYYY-MM-DD')}
            handleSelect={(data) => {
              setFieldValue('weekdays', [...data]);
              setSelectedRecurranceOption(
                initialRecurranceOption(startRecurPicker, endRecurPicker),
              );
            }}
            isDisabled={isDeleted}
            dataQa='appointment-weekdays-toggle-buttons'
          />
        </Grid>
      </Grid>
      {/* Cancellation */}
      {add_or_update && (
        <Stack direction='row' alignItems='center' spacing='0.5rem'>
          <CustomSwitch
            name='canceled'
            disabled={
              canceled
                ? !role_permissions(currentUser, 'deleteCancelation')
                : !role_permissions(currentUser, 'createCancelation') ||
                  isDeleted
            }
            checked={canceled}
            onChange={(e) => setFieldValue('canceled', e.target.checked)}
            data-qa='appointment-cancel-single'
          />
          <label htmlFor='canceled'>Cancel this Event</label>
        </Stack>
      )}
      {canceled && (
        <Stack
          style={{
            backgroundColor: 'rgb(253, 237, 237)',
            borderRadius: '8px',
          }}
          padding='.75rem'
        >
          <Grid container spacing='0.5rem' columns={{ sm: 12, md: 12 }}>
            <Grid
              size={{
                sm: 6,
                md: 6,
              }}
            >
              <label htmlFor='person_canceled'>Person Cancelled</label>
              <CustomSelect
                isDisabled={
                  !role_permissions(currentUser, 'createCancelation') ||
                  isDeleted
                }
                id='person_canceled'
                menuPlacement='top'
                options={personCanceledOptions}
                value={user_canceled.length ? [...user_canceled] : null}
                onChange={(data) => {
                  setValues({
                    ...form.values,
                    user_canceled: [data],
                    makeUnavailableCanceledByUser: data
                      ? makeUnavailableCanceledByUser
                      : false,
                    canceled_allday: data ? canceled_allday : false,
                  });
                }}
                dataQa='appointment-person-canceled-select'
                isClearable
              />
            </Grid>
            <Grid
              size={{
                sm: 6,
                md: 6,
              }}
            >
              <label htmlFor='reason_canceled'>Reason Cancelled *</label>
              <CustomSelect
                id='reason_canceled'
                isDisabled={
                  !role_permissions(currentUser, 'createCancelation') ||
                  isDeleted
                }
                menuPlacement='top'
                options={storeReasonsCanceled}
                value={reason_canceled.length ? [...reason_canceled] : null}
                onChange={(data) => setFieldValue('reason_canceled', [data])}
                dataQa='appointment-reason-canceled-select'
              />
            </Grid>
            <Grid
              size={{
                sm: 12,
                md: 12,
              }}
            >
              <CustomSwitch
                checked={makeUnavailableCanceledByUser}
                onChange={(e) =>
                  setFieldValue(
                    'makeUnavailableCanceledByUser',
                    e.target.checked,
                  )
                }
                disabled={!user_canceled?.[0]?.value || isDeleted}
                data-qa='appointment-make-unavailable-canceled-by-user-switch'
              />
              <label style={{ marginLeft: '0.5rem' }}>
                Person Cancelled: Unavailable during this Event's Time
              </label>
            </Grid>
            <Grid
              size={{
                sm: 12,
                md: 12,
              }}
            >
              <CustomSwitch
                checked={canceled_allday}
                onChange={(e) => {
                  setFieldValue('canceled_allday', e.target.checked);
                  if (!e.target.checked) {
                    setFieldValue('make_unavailable_allday', false);
                  }
                }}
                disabled={!user_canceled?.[0]?.value || isDeleted}
                data-qa='appointment-cancelled-allday-switch'
              />
              <label style={{ marginLeft: '0.5rem' }}>
                Person Cancelled: Cancel All Sessions this Day
              </label>
            </Grid>
            <Grid
              size={{
                sm: 12,
                md: 12,
              }}
            >
              <CustomSwitch
                checked={make_unavailable_allday}
                onChange={(e) => {
                  setFieldValue('make_unavailable_allday', e.target.checked);
                }}
                disabled={!canceled_allday}
                data-qa='appointment-make-unavailable-allday-switch'
              />
              <label style={{ marginLeft: '0.5rem' }}>
                Person Cancelled: Unavailable for Whole Day
              </label>
            </Grid>
          </Grid>
        </Stack>
      )}
      {add_or_update && (
        <Stack direction='row' alignItems='center' spacing='0.5rem'>
          <CustomSwitch
            name='converted'
            checked={converted}
            onChange={(e) => setFieldValue('converted', e.target.checked)}
            disabled={isDeleted}
            data-qa='appointment-convert-event-switch'
          />
          <label htmlFor='converted'>Convert this Event</label>
        </Stack>
      )}
      {converted && (
        <Stack
          style={{
            backgroundColor: '#f7f8fb',
            borderRadius: '8px',
          }}
          padding='.75rem'
        >
          <Grid container spacing='0.75rem' columns={{ sm: 12 }}>
            <Grid size={6}>
              <label htmlFor='startActual'>Start Time</label>
              <CustomTimePicker
                value={startActual}
                onChange={(value) => setFieldValue('startActual', value)}
                interval={storeSettingsValuesTimeInterval}
                dataQa='appointment-start-time'
              />
            </Grid>
            <Grid size={6}>
              <label htmlFor='endActual'>End Time</label>
              <CustomTimePicker
                value={endActual}
                onChange={(value) => setFieldValue('endActual', value)}
                interval={storeSettingsValuesTimeInterval}
                dataQa='appointment-end-time'
              />
            </Grid>
            {supervisionEvent_canceled && (
              <>
                <Grid
                  size={{
                    sm: 6,
                    md: 6,
                  }}
                >
                  <label htmlFor='supervisionEvent_userCanceled'>
                    Person Cancelled *
                  </label>
                  <CustomSelect
                    isDisabled={
                      !role_permissions(currentUser, 'createCancelation') ||
                      isDeleted
                    }
                    id='supervisionEvent_userCanceled'
                    menuPlacement='top'
                    options={personCanceledOptions}
                    value={personCanceledOptions.find(
                      (opt) => opt.value === supervisionEvent_userCanceled,
                    )}
                    onChange={(data) =>
                      setFieldValue('supervisionEvent_userCanceled', data.value)
                    }
                    dataQa='appointment-supervision-event-user-canceled-select'
                  />
                </Grid>
                <Grid
                  size={{
                    sm: 6,
                    md: 6,
                  }}
                >
                  <label htmlFor='supervisionEvent_reasonCanceled'>
                    Reason Canceled *
                  </label>
                  <CustomSelect
                    id='supervisionEvent_reasonCanceled'
                    isDisabled={
                      !role_permissions(currentUser, 'createCancelation') ||
                      isDeleted
                    }
                    menuPlacement='top'
                    options={storeReasonsCanceled}
                    value={storeReasonsCanceled.find(
                      (opt) => opt.value === supervisionEvent_reasonCanceled,
                    )}
                    onChange={(data) =>
                      setFieldValue(
                        'supervisionEvent_reasonCanceled',
                        data.value,
                      )
                    }
                    dataQa='appointment-supervision-event-reason-canceled-select'
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Stack>
      )}
      {/* Supervision */}
      <Stack direction='row' alignItems='center' spacing='0.5rem'>
        <CustomSwitch
          name='supervision'
          checked={supervision}
          onChange={(e) => setFieldValue('supervision', e.target.checked)}
          disabled={isDeleted}
          data-qa='appointment-supervision-switch'
        />
        <label
          htmlFor='canceled'
          display='block'
          style={{ marginLeft: '0.5rem' }}
        >
          Supervise Event
        </label>
      </Stack>
      {supervision && (
        <Stack
          style={{
            backgroundColor: '#f7f8fb',
            borderRadius: '8px',
          }}
          padding='.75rem'
        >
          <Grid container spacing='0.75rem' columns={{ sm: 12 }}>
            <Grid
              size={{
                sm: 6,
              }}
            >
              <label htmlFor='supervisionUsers'>Supervisors</label>
              {eventResourcesLoading ? (
                <Skeleton key='skeleton' height={40} variant='rounded' />
              ) : (
                <CustomAsyncSelect
                  key='supervisionUsers'
                  id='supervisionUsers'
                  name='supervisionUsers'
                  value={supervisionUsers}
                  onChange={(data) => setFieldValue('supervisionUsers', data)}
                  isMulti
                  isDisabled={isDeleted}
                  loadOptions={loadEmployeeSupervisionOptions}
                  defaultOptions={shouldShowEmployeeSupervisionOptions}
                  data-qa='appointment-supervision-users-select'
                />
              )}
            </Grid>
            <Grid
              size={{
                sm: 6,
              }}
            >
              <label htmlFor='supervisionActivity'>Supervision Activity</label>
              {eventResourcesLoading ? (
                <Skeleton key='skeleton' height={40} variant='rounded' />
              ) : (
                <CustomAsyncSelect
                  id='supervisionActivity'
                  key='supervisionActivity'
                  loadOptions={loadActivitySupervisionOptions}
                  name='supervisionActivity'
                  value={supervisionActivity}
                  onChange={(data) =>
                    setFieldValue('supervisionActivity', data)
                  }
                  isDisabled={isDeleted}
                  defaultOptions={shouldShowActivitySupervisionOptions}
                  data-qa='appointment-supervision-activity-select'
                />
              )}
            </Grid>
            <Grid size={6}>
              <label htmlFor='supervisionStartTime'>Start Time</label>
              <CustomTimePicker
                value={supervisionStartTime}
                onChange={(value) =>
                  setFieldValue('supervisionStartTime', value)
                }
                interval={storeSettingsValuesTimeInterval}
                dataQa='appointment-supervision-start-time-picker'
              />
            </Grid>
            <Grid size={6}>
              <label htmlFor='supervisionEndTime'>End Time</label>
              <CustomTimePicker
                value={supervisionEndTime}
                onChange={(value) => setFieldValue('supervisionEndTime', value)}
                interval={storeSettingsValuesTimeInterval}
                dataQa='appointment-supervision-end-time-picker'
              />
            </Grid>
            {add_or_update && (
              <Grid
                size={{
                  sm: 12,
                  md: 12,
                }}
              >
                <Stack direction='row' alignItems='center' spacing='0.5rem'>
                  <CustomSwitch
                    name='supervisionEvent_canceled'
                    checked={supervisionEvent_canceled}
                    onChange={(e) =>
                      setFieldValue(
                        'supervisionEvent_canceled',
                        e.target.checked,
                      )
                    }
                    disabled={isDeleted}
                    data-qa='appointment-supervision-event-canceled-switch'
                  />
                  <label
                    htmlFor='canceled'
                    display='block'
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Cancel Supervise Event
                  </label>
                </Stack>
              </Grid>
            )}

            {supervisionEvent_canceled && (
              <>
                <Grid
                  size={{
                    sm: 6,
                    md: 6,
                  }}
                >
                  <label htmlFor='supervisionEvent_userCanceled'>
                    Person Cancelled *
                  </label>
                  <CustomSelect
                    isDisabled={
                      !role_permissions(currentUser, 'createCancelation') ||
                      isDeleted
                    }
                    id='supervisionEvent_userCanceled'
                    menuPlacement='top'
                    options={personCanceledOptions}
                    value={personCanceledOptions.find(
                      (opt) => opt.value === supervisionEvent_userCanceled,
                    )}
                    onChange={(data) =>
                      setFieldValue('supervisionEvent_userCanceled', data.value)
                    }
                    dataQa='appointment-supervision-event-user-canceled-select'
                  />
                </Grid>
                <Grid
                  size={{
                    sm: 6,
                    md: 6,
                  }}
                >
                  <label htmlFor='supervisionEvent_reasonCanceled'>
                    Reason Canceled *
                  </label>
                  <CustomSelect
                    id='supervisionEvent_reasonCanceled'
                    isDisabled={
                      !role_permissions(currentUser, 'createCancelation') ||
                      isDeleted
                    }
                    menuPlacement='top'
                    options={storeReasonsCanceled}
                    value={storeReasonsCanceled.find(
                      (opt) => opt.value === supervisionEvent_reasonCanceled,
                    )}
                    onChange={(data) =>
                      setFieldValue(
                        'supervisionEvent_reasonCanceled',
                        data.value,
                      )
                    }
                    dataQa='appointment-supervision-event-reason-canceled-select'
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Stack>
      )}
      {/* Push Notification */}
      <Stack direction='row' alignItems='center' spacing='0.5rem'>
        <CustomSwitch
          disabled={
            Boolean(role_permissions(currentUser, 'pushNotification')) ||
            isDeleted
          }
          checked={pushNotification.send}
          onChange={(e) =>
            setFieldValue('pushNotification.send', e.target.checked)
          }
          data-qa='appointment-push-notification-switch'
        />
        <label htmlFor='Push Notification'>Send Push Notification</label>
      </Stack>
      {pushNotification.send && (
        <Stack
          style={{
            backgroundColor: '#f7f8fb',
            borderRadius: '8px',
          }}
          padding='.75rem'
          spacing='0.5rem'
        >
          <Grid
            size={{
              sm: 12,
            }}
          >
            <label htmlFor='pushNotificationMessage'>
              Push Notification Message
            </label>
            <textarea
              name='pushNotificationMessage'
              id='pushNotificationMessage'
              rows='2'
              value={pushNotification.message}
              onChange={(e) =>
                setFieldValue('pushNotification.message', e.target.value)
              }
              placeholder=''
              className='form-control'
              disabled={isDeleted}
              data-qa='appointment-push-notification-message'
            />
          </Grid>
          <Grid
            size={{
              sm: 12,
              md: 6,
            }}
          >
            <label htmlFor='pushTo'>Send Push Notification to</label>
            {eventResourcesLoading ? (
              <Skeleton key='skeleton' height={40} variant='rounded' />
            ) : (
              <CustomAsyncSelect
                id='pushTo'
                key={peopleOptions.map((p) => p.value).join('|')}
                isMulti={true}
                loadOptions={loadNotifUsersOptions}
                menuPlacement='top'
                value={pushNotification.to}
                onChange={(data) => setFieldValue('pushNotification.to', data)}
                isDisabled={isDeleted}
                defaultOptions
                data-qa='appointment-push-notification-to-select'
              />
            )}
          </Grid>
        </Stack>
      )}
      {/* Sandbox Mode */}
      <Stack
        direction='row'
        alignItems='center'
        spacing='0.5rem'
        ref={supervisionBlockRef}
      >
        <CustomSwitch
          name='sandboxMode'
          checked={sandboxMode}
          onChange={(e) => setFieldValue('sandboxMode', e.target.checked)}
          disabled={isDeleted}
          data-qa='appointment-sandbox-mode-switch'
        />
        <label htmlFor='canceled'>Apply Sandbox Mode</label>
      </Stack>
    </Stack>
  );
};

export default AddEventSidebarHelper;
