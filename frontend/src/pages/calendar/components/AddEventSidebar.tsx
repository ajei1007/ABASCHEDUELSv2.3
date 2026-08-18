import { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Formik } from 'formik';
import AddEventSidebarHelper from './AddEventSidebarHelper';
import role_permissions from 'helpers/role_permissions';
import ModalWrapper from 'components/ModalWrapper';
import type { IModalWrapperRef } from 'components/ModalWrapper';
import SelectAndConfirmPromiseModal from './modals/SelectAndConfirmPromiseModal';
import type { ISelectAndConfirmPromiseModalPropsForRef } from './modals/SelectAndConfirmPromiseModal';
import ChangeAffectedEventGroupsConfirmModal from './modals/ChangeAffectedEventGroupsConfirmModal';
import type { IChangeAffectedEventGroupsConfirmModalPropsForRef } from './modals/ChangeAffectedEventGroupsConfirmModal';
import CustomButton from 'components/Button';
import moment from 'moment';
import style from '../Calendar.module.scss';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  Drawer,
  IconButton,
  Stack,
  Grid2 as Grid,
  Alert,
  DialogTitle,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ManageHistoryOutlinedIcon from '@mui/icons-material/ManageHistoryOutlined';
import {
  setSelectedEvent,
  setDeleteEventsLoading,
  setUndeleteEventsLoading,
} from 'store/slices/calendar/actions';
import {
  makeUnavailable,
  fetchEventsUpdatedBy,
  operateSelectedEvents,
  fetchReasonsCanceled,
  fetchEventGroups,
} from 'store/slices/calendar/thunks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import { eventExtractFormatter } from '../utils/eventExtractFormatter';
import { eventOptions } from '../constants';
import {
  frequencyOptions,
  intervalOptions,
  weekdayOptions,
  weekNumberOptions,
} from 'constants/recurrenceOptions';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import axios from 'axios';
import { isObjEmpty } from 'utils/isObjectRmpty';
import { getEventUpdateType } from '../utils/getEventUpdateType';
import { getEventDeleteType } from '../utils/getEventDeleteType';
import {
  getEventUpdateLevel,
  adaptEventFromUpdateForm,
} from '../utils/getEventUpdateLevel';
import {
  getEventCancellationUpdate,
  adaptEventForGetCancellationUpdate,
} from '../utils/getEventCancellationUpdate';
import { prepareToBeUpdatedEvents } from '../utils/prepareToBeUpdatedEvents';
import { prepareToBeDeletedEvents } from '../utils/prepareToBeDeletedEvents';
import hasUserPermissionOnLockedScheduler from '../utils/hasUserPermissionOnLockedScheduler';
import daysOfWeek from 'constants/daysOfWeek';
import { getTimeZones } from 'utils/timezones';
import convertTZ from 'utils/convertTZ';
import { getDaysOfWeekBetweenDates } from 'utils/weekdayGetters';
import { handleEvent } from '../utils/formatters';
import { formatEventOptions } from '../utils/eventOptionsFormatter';
import convertDateToTodaysDate from 'utils/convertDateToTodaysDate';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useExtendEventsWithRecurringInfo } from '../hooks/useExtendEventsWithRecurringInfo';
import { formatResourceToSelectOption } from '../utils/formatResourceToSelectOption';
import type { IApiCalendarEventGroupItem } from 'types/api';
import CanceledEventsListModal, {
  type ICanceledEventsListModalPropsForRef,
} from './modals/CanceledEventsListModal';
import { handleSettingValues } from 'store/actions/settingsActions';
import { selectEventFormDrawerOpen } from 'store/slices/calendarOverlayingPanels';
import { toggleEventFormDrawerOpen } from 'store/slices/calendarOverlayingPanels/actions';
import { useFullcalendarApiContext } from '../context/FullcalendarApiContext';
import { useCalendarViewContext } from '../context/CalendarViewContext';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';

const makeUnavailability = ({
  updatedEvent,
  activityResources,
  locationResources,
  timezone,
}: {
  updatedEvent: any;
  activityResources: any[];
  locationResources: any[];
  timezone: string;
}) => {
  const formattedCurrentEvent = handleEvent({
    event: updatedEvent,
    activityResources,
    locationResources,
    fallbackTimezone: timezone as any,
  });

  const startRange = moment(updatedEvent.startRecur)
    .tz(timezone)
    .format('YYYY-MM-DD');
  const endRange = moment(updatedEvent.endRecur)
    .tz(timezone)
    .format('YYYY-MM-DD');

  const startTime = moment(updatedEvent.start).tz(timezone).format();
  const endTime = moment(updatedEvent.end).tz(timezone).format();

  const avData = formattedCurrentEvent.data;
  const id = formattedCurrentEvent.id;
  return {
    id,
    data: {
      id,
      user: avData.cancelledByUserId,
      days: avData.daysOfWeek,
      startTime,
      endTime,
      startRange,
      endRange,
      available: false,
    },
  };
};
const findCanceledEventForUnavailability = (
  operations: {
    toBeAdded?: any[];
    toBeUpdated: any[];
  },
  targetId: any,
) => {
  const creatingArr = operations.toBeAdded ? operations.toBeAdded : [];
  const updatingArr = operations.toBeUpdated
    ? operations.toBeUpdated.map((ev: any) => ev.newEvent)
    : [];
  const allOperations = [...creatingArr, ...updatingArr];

  return allOperations.find((op) => op.id === targetId && op.canceled === true);
};

const DRAWER_TRANSITION_TIME = 175;
// TODO move
const eventValidationSchema = () => {
  const yupShape = {
    users: Yup.array()
      .nullable()
      .test('activity-required', 'Activity Required !', function (users: any) {
        return (
          users.filter((e: any) => ['Activity'].includes(e.type)).length !== 0
        );
      })
      .test('users-required', 'User(s) Required !', function (users: any) {
        return (
          users.filter((e: any) => ['Client'].includes(e.type)).length !== 0 ||
          users.filter((e: any) => ['Employee'].includes(e.type)).length !== 0
        );
      })
      .test('users-required', 'Client Required !', function (users: any) {
        let isClientReq = false;
        users
          .filter((u: any) => u.type === 'Activity')
          .forEach((element: any) => {
            if (element.clientReq) isClientReq = true;
          });
        return !(
          users.filter((e: any) => ['Client'].includes(e.type)).length === 0 &&
          isClientReq
        );
      })
      .test('users-required', 'Location Required !', function (users: any) {
        let isLocationReq = false;
        users
          .filter((u: any) => u.type === 'Activity')
          .forEach((element: any) => {
            if (element.locReq) isLocationReq = true;
          });
        return !(
          users.filter((e: any) => ['Location'].includes(e.type)).length ===
            0 && isLocationReq
        );
      })
      .test('users-required', 'Employee Required !', function (users: any) {
        let isEmpNotReq = false;
        users
          .filter((u: any) => u.type === 'Activity')
          .forEach((element: any) => {
            if (element.empNotReq) isEmpNotReq = true;
          });
        return !(
          users.filter((e: any) => ['Employee'].includes(e.type)).length ===
            0 && !isEmpNotReq
        );
      }),
    startPicker: Yup.string()
      .required('Start time is required')
      .test('valid-start', 'Invalid start time format', (value) => {
        const date = new Date(value as string);
        return !isNaN(date.getTime());
      }),
    endPicker: Yup.string()
      .required('End time is required')
      .test('valid-end', 'Invalid end time format', (value) => {
        const date = new Date(value as string);
        return !isNaN(date.getTime());
      })
      .test(
        'is-after-start',
        'End time must be after start time',
        function (value) {
          const { startPicker } = this.parent;
          const start = new Date(startPicker);
          const end = new Date(value as string);

          // If either time is invalid, skip this test
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return true;
          }

          return end.getTime() > start.getTime();
        },
      )
      .test(
        'valid-duration',
        'Duration must not be more than 24 hours',
        function (value) {
          const { startPicker } = this.parent;
          const start = new Date(startPicker);
          const end = new Date(value as string);

          // If either time is invalid, skip this test
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return true;
          }

          return end.getTime() - start.getTime() < 24 * 60 * 60 * 1000; // 24 hours
        },
      ),
    weekdays: Yup.array()
      .nullable()
      .test(
        'weekdays-required',
        'Please select at least one week day !',
        function (weekdays: any) {
          return weekdays.length !== 0;
        },
      )
      .test(
        'valid-weekdays',
        'Please select at least one week day !',
        function (weekdays: any) {
          const { startRecurPicker, endRecurPicker } = this.parent;
          if (!startRecurPicker || !endRecurPicker) {
            return true;
          }

          const possibleWeekdays = getDaysOfWeekBetweenDates(
            startRecurPicker,
            endRecurPicker,
          );

          let _weekdays = Array.isArray(weekdays)
            ? weekdays.map((w: any) => w.pos)
            : [];

          _weekdays = _weekdays.filter((w: any) =>
            possibleWeekdays.includes(w),
          );

          return _weekdays.length > 0;
        },
      ),
    canceled: Yup.boolean()
      .nullable()
      // .test(
      //   'user_canceled-required',
      //   'Person who Canceled is Required !',
      //   function (canceled) {
      //     const { user_canceled } = this.parent;
      //     if (canceled) {
      //       return user_canceled.length !== 0;
      //     }
      //     return true;
      //   },
      // )
      .test(
        'reason_canceled-required',
        'Reason for Cancelation Required !',
        function (canceled) {
          const { reason_canceled } = this.parent;
          if (canceled) {
            return reason_canceled.length !== 0;
          }
          return true;
        },
      ),

    // Supervision
    supervision: Yup.boolean()
      .test(
        'supervision-required',
        'Supervisors Required!',
        function (supervision) {
          const { supervisionUsers } = this.parent;
          if (supervision) {
            return supervisionUsers.length !== 0;
          }
          return true;
        },
      )
      .test(
        'reason_canceled-required',
        'Supervision Actvity Required!',
        function (supervision) {
          const { supervisionActivity } = this.parent;
          if (supervision) {
            return supervisionActivity !== null;
          }
          return true;
        },
      ),
    supervisionStartTime: Yup.string().when('supervision', {
      is: true,
      then: Yup.string()
        .required('Supervision Start time is required')
        .test(
          'valid-supervision-start',
          'Invalid supervision start time format',
          (value) => {
            if (!value) return false; // Ensures the value exists when required
            const date = new Date(value);
            return !isNaN(date.getTime());
          },
        )
        .test(
          'supervision-start-within-appointment',
          'Supervision Start Time must be within the main appointment times',
          function (value) {
            const { startPicker, endPicker } = this.parent;

            if (!value || !startPicker || !endPicker) {
              return true;
            }
            const supStart = new Date(value).getTime();
            const apptStart = new Date(startPicker).getTime();
            const apptEnd = new Date(endPicker).getTime();

            if (isNaN(supStart) || isNaN(apptStart) || isNaN(apptEnd)) {
              return true;
            }

            return supStart >= apptStart && supStart <= apptEnd;
          },
        ),
      otherwise: Yup.string().notRequired(),
    }),
    supervisionEndTime: Yup.string().when('supervision', {
      is: true,
      then: Yup.string()
        .required('Supervision End time is required')
        .test(
          'valid-supervision-end',
          'Invalid supervision end time format',
          (value) => {
            if (!value) return false;
            const date = new Date(value);
            return !isNaN(date.getTime());
          },
        )
        .test(
          'supervision-end-within-appointment',
          'Supervision End Time must be within the main appointment times',
          function (value) {
            const { startPicker, endPicker } = this.parent;

            if (!value || !startPicker || !endPicker) {
              return true;
            }
            const supEnd = new Date(value).getTime();
            const apptStart = new Date(startPicker).getTime();
            const apptEnd = new Date(endPicker).getTime();

            if (isNaN(supEnd) || isNaN(apptStart) || isNaN(apptEnd)) {
              return true;
            }

            return supEnd >= apptStart && supEnd <= apptEnd;
          },
        )
        .test(
          'supervision-end-after-start',
          'Supervision End Time must be after the Supervision Start Time',
          function (value) {
            const { supervisionStartTime } = this.parent;
            if (!supervisionStartTime || !value) return false;

            const start = new Date(supervisionStartTime);
            const end = new Date(value);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              return true;
            }

            return end.getTime() > start.getTime();
          },
        ),
      otherwise: Yup.string().notRequired(),
    }),

    // Converted
    converted: Yup.boolean(),
    startActual: Yup.string().when('converted', {
      is: true,
      then: Yup.string()
        .required('Converted Start time is required')
        .test('valid-start', 'Invalid start time format', (value) => {
          if (!value) return false; // Ensures the value exists when required
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
      otherwise: Yup.string().notRequired(),
    }),
    endActual: Yup.string().when('converted', {
      is: true,
      then: Yup.string()
        .required('Converted End time is required')
        .test('valid-end', 'Invalid end time format', (value) => {
          if (!value) return false; // Ensures the value exists when required
          const date = new Date(value);
          return !isNaN(date.getTime());
        })
        .test(
          'is-after-start',
          'Converted End Time must be after start time',
          function (value) {
            const { startActual } = this.parent;
            if (!startActual || !value) return false; // Ensures both values exist
            const start = new Date(startActual);
            const end = new Date(value);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              return true;
            }

            return end.getTime() > start.getTime();
          },
        ),
      otherwise: Yup.string().notRequired(),
    }),
  };
  return Yup.object().shape(yupShape);
};
// TODO move
const formatEventData = (data: any, timezone: any) => {
  const {
    weekdays,
    startPicker,
    endPicker,
    startRecurPicker,
    endRecurPicker,
    supervisionUsers,
    supervisionActivity,
    users,
    rooms,
    supervision,
    converted,
    pushNotification,
    supervisionStartTime: _supervisionStartTime,
    supervisionEndTime: _supervisionEndTime,
  } = data;
  const start = moment(startPicker).tz(timezone, true).format();
  const end = moment(endPicker).tz(timezone, true).format();
  const supervisionStartTime = supervision
    ? moment(_supervisionStartTime).tz(timezone, true).format()
    : _supervisionStartTime;

  const supervisionEndTime = supervision
    ? moment(_supervisionEndTime).tz(timezone, true).format()
    : _supervisionEndTime;

  const isHomeEligible =
    users.filter((u: any) => u.rooms?.length > 0)?.length > 0;

  const sUsers = supervision ? supervisionUsers : [];
  return {
    ...data,
    daysOfWeek: weekdays.map(
      (day: any) => daysOfWeek.find((f) => f.value === day.value)?.value,
    ),
    start,
    end,
    startRecur: moment(startRecurPicker).format('YYYY-MM-DD'),
    endRecur: moment(endRecurPicker).add(1, 'day').format('YYYY-MM-DD'),
    endRecurPicker: moment(endRecurPicker).add(1, 'day').toDate(),
    supervisionUsers: sUsers?.map((u: any) => u.value) ?? [],
    supervisionActivity: supervisionActivity?.value ?? null,
    supervisionStartTime,
    supervisionEndTime,
    rooms: isHomeEligible ? rooms : [],
    address: data.address?.label ?? null,
    longitude: data?.longitude ?? null,
    latitude: data?.latitude ?? null,
    timezone,
    converted,
    pushNotification: {
      ...pushNotification,
      to: pushNotification.to.map((u: any) => u?.value).filter((u: any) => u),
    },
  };
};

const getResourceIdsFromEvent = (event: any) => {
  const resourceIds = [...(Array.isArray(event?.users) ? event.users : [])];
  if (event.user_canceled) {
    resourceIds.push(event.user_canceled);
  }
  return resourceIds;
};

// TODO move
interface IEventActionsProps {
  handleUnav: () => void;
  handleDeleteEvent: () => void;
  handleUndeleteEvent: () => void;
  handleCloseDrawer: () => void;
  currentUser: any;
  eventInfoLoading: boolean;
  handleGetEventInfo: (e: any) => Promise<void>;
  isAddOrUpdate: boolean;
  eventResourcesLoading: boolean;
  eventHistory: any;
  isSupervision: boolean;
  isDeleted: boolean;
}

const EventActions = ({
  handleUnav,
  handleDeleteEvent,
  handleUndeleteEvent,
  handleCloseDrawer,
  currentUser,
  eventInfoLoading,
  handleGetEventInfo,
  isAddOrUpdate,
  eventResourcesLoading,
  eventHistory,
  isSupervision,
  isDeleted,
}: IEventActionsProps) => {
  if (!isAddOrUpdate) {
    return (
      <Stack
        marginTop='1rem'
        direction='row'
        spacing='0.5rem'
        justifyContent='space-between'
        width='100%'
      >
        <CustomButton
          type='submit'
          loading={eventResourcesLoading}
          data-qa='appointment-add-event'
        >
          Add Event
        </CustomButton>
        <CustomButton
          type='reset'
          onClick={handleCloseDrawer}
          variant='outlined'
        >
          Cancel
        </CustomButton>
        <div style={{ marginLeft: 'auto' }}>
          <CustomButton onClick={handleUnav} variant='outlined' color='error'>
            Unavailable
          </CustomButton>
        </div>
      </Stack>
    );
  } else {
    return (
      <Stack
        direction='row'
        justifyContent='space-between'
        width='100%'
        marginTop='1rem'
      >
        {!isDeleted && (
          <Stack direction='row' spacing='0.5rem'>
            {!isSupervision && (
              <CustomButton
                type='submit'
                loading={eventResourcesLoading}
                data-qa='appointment-update'
              >
                Update Event
              </CustomButton>
            )}
            {role_permissions(currentUser, 'deleteEvent') && (
              <CustomButton
                onClick={handleDeleteEvent}
                variant='outlined'
                color='error'
                loading={eventResourcesLoading}
                data-qa='appointment-delete'
              >
                Delete Event
              </CustomButton>
            )}
          </Stack>
        )}
        {isDeleted &&
          !isSupervision &&
          role_permissions(currentUser, 'deleteEvent') && (
            <CustomButton
              onClick={handleUndeleteEvent}
              loading={eventResourcesLoading}
              data-qa='appointment-undelete'
            >
              Undelete Event
            </CustomButton>
          )}
        {!eventHistory && (
          <CustomButton
            variant='outlined'
            loading={eventInfoLoading || eventResourcesLoading}
            onClick={handleGetEventInfo}
            data-qa='appointment-event-history'
          >
            Event History
          </CustomButton>
        )}
      </Stack>
    );
  }
};

const AddEventSidebar = memo(() => {
  const dispatch = useAppDispatch();
  const storeReasonsCanceled = useAppSelector(
    (state) => state.calendar.reasons_canceled,
  );

  const storeEvents = useAppSelector((state) => state.calendar.events);
  const storeBranches = useAppSelector((state) => state.calendar.branches);
  const storeLazyResources = useAppSelector(
    (state) => state.calendar.lazyResources,
  );
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const storeLocationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const storeBlockResources = useAppSelector(
    (state) => state.calendar.blockResources,
  );

  const storeSettingsValuesIsolateCanceled = useAppSelector(
    (state) => state.settings.settingValues?.isolateCanceled,
  );
  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );
  const storeSettingsValuesBusinessStartTime = useAppSelector(
    (state) => state.settings.settingValues?.businessStartTime,
  );

  const storeSettingsValuesBusinessEndTime = useAppSelector(
    (state) => state.settings.settingValues?.businessEndTime,
  );

  const schedulerLocked = useAppSelector(
    (state) => state.settings.schedulerLocked,
  );
  const timezone = useAppSelector(
    (state) => state.settings.settingValues.timezone,
  );
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const selectedEvent = useAppSelector((state) => state.calendar.selectedEvent);
  const storeCalendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const storeCalendarEnd = useAppSelector(
    (state) => state.calendar.calendar_end,
  );

  const eventFormDrawerOpen = useAppSelector(selectEventFormDrawerOpen);

  // Context for FullCalendar API
  const { calendarApi } = useFullcalendarApiContext();

  // Context for active day and view
  const { activeDay, activeView } = useCalendarViewContext();

  // Context for selected resources
  const { selectedResources, setSelectedResources } =
    useCalendarSelectedResourcesContext();

  const isAddOrUpdate = useMemo(() => {
    return isObjEmpty(selectedEvent) ||
      (!isObjEmpty(selectedEvent) && !selectedEvent?.title?.length)
      ? false
      : true;
  }, [selectedEvent]);

  const [eventInfoLoading, setEventInfoLoading] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<any[]>([]);
  const [eventResourcesLoading, setEventResourcesLoading] = useState(false);
  const [eventResources, setEventResources] = useState<any[]>([]);
  const [eventHistory, setEventHistory] = useState<any>(null);

  const isolate = useLatestCallback((isolatedUsers = null) => {
    const _checkedResources = isolatedUsers ? isolatedUsers : selectedResources;
    dispatch(handleSettingValues('isolatedResources', _checkedResources));
  });

  const prefetchEventResources = useLatestCallback(
    async ({ selectedEvent }: { selectedEvent: any }) => {
      if (isObjEmpty(selectedEvent)) {
        return;
      }

      const eventResourceIds = getResourceIdsFromEvent(selectedEvent);
      const supervisionId = selectedEvent?.extendedProps?.supervisionId;
      if (supervisionId) {
        const supervisionEvent = storeEvents.find(
          (e: any) => e.id === selectedEvent?.extendedProps?.supervisionId,
        );
        if (supervisionEvent) {
          eventResourceIds.push(...getResourceIdsFromEvent(supervisionEvent));
        }
      }

      const resources = [
        ...storeLazyResources,
        ...storeActivityResources,
        ...storeLocationResources,
        ...storeBlockResources,
      ];

      const locallyFoundResources = resources.filter((resource) =>
        eventResourceIds.includes(resource.id),
      );

      setEventResources(locallyFoundResources);
      if (locallyFoundResources.length === eventResourceIds.length) {
        return;
      }

      const locallyFoundResourcesIds = locallyFoundResources.map((r) => r.id);
      const notLocallyFoundResourceIds = eventResourceIds.filter(
        (id) => !locallyFoundResourcesIds.includes(id),
      );

      setEventResourcesLoading(true);
      try {
        const response = await axios.get(`/scheduler/resource-by-ids`, {
          params: {
            users: notLocallyFoundResourceIds.map((u: any) => u).join('|'),
          },
        });
        setEventResources((prev) => [...prev, ...response.data]);
      } catch (err: any) {
        const errMsg = err?.response?.data;
        toast.error(errMsg);
      } finally {
        window.setTimeout(() => {
          setEventResourcesLoading(false);
        });
      }
    },
  );

  const {
    extendUpdatingEventsWithRecurringInfo,
    extendDeletingEventsWithRecurringInfo,
  } = useExtendEventsWithRecurringInfo({
    eventDateRangeExtractor: (event) => ({
      startDate: event.startRecur,
      endDate: event.endRecur,
    }),
    eventGroupIdExtractor: (event) => event.eventGroupId,
  });

  const updateEventsModalRef =
    useRef<IModalWrapperRef<ISelectAndConfirmPromiseModalPropsForRef, any>>(
      null,
    );
  const deleteEventsModalRef =
    useRef<IModalWrapperRef<ISelectAndConfirmPromiseModalPropsForRef, any>>(
      null,
    );

  const changeAffectedEventsModalRef =
    useRef<
      IModalWrapperRef<IChangeAffectedEventGroupsConfirmModalPropsForRef, any>
    >(null);

  const canceledEventsListRef =
    useRef<IModalWrapperRef<ICanceledEventsListModalPropsForRef, any>>(null);

  useEffect(() => {
    if (
      eventFormDrawerOpen &&
      storeReasonsCanceled.length === 0 &&
      isAddOrUpdate
    ) {
      dispatch(fetchReasonsCanceled());
    }
  }, [eventFormDrawerOpen, storeReasonsCanceled, isAddOrUpdate, dispatch]);

  useEffect(() => {
    prefetchEventResources({ selectedEvent });
  }, [selectedEvent, prefetchEventResources]);

  const handleSelectBranches = async (_branches: any) => {
    setSelectedBranches(_branches);
  };

  const getEventUsers = useLatestCallback((resources: any[]) => {
    if (
      !selectedEvent ||
      !Array.isArray(selectedEvent?.users) ||
      selectedEvent?.users.length === 0
    ) {
      return [] as any[];
    }

    return resources.reduce((acc: any[], resource) => {
      if (
        Array.isArray(resource?.roles) &&
        selectedEvent.users.includes(resource.id) &&
        !resource.roles.includes('Room')
      ) {
        acc.push(formatResourceToSelectOption(resource));
      }
      return acc;
    }, [] as any[]);
  });

  const getSupervisionActivity = useLatestCallback(
    (resources: any[], activityId) => {
      if (
        !selectedEvent ||
        !Array.isArray(selectedEvent?.users) ||
        selectedEvent?.users.length === 0
      ) {
        return null;
      }

      const supervisionActivity = resources.find(
        (resource) =>
          resource.id === activityId && resource.type === 'Activity',
      );

      return supervisionActivity
        ? formatResourceToSelectOption(supervisionActivity)
        : null;
    },
  );

  const getRoomsUsers = useLatestCallback((resources: any[]) => {
    if (
      !selectedEvent ||
      !Array.isArray(selectedEvent?.users) ||
      selectedEvent?.users.length === 0
    ) {
      return [];
    }

    return resources.reduce((acc, resource) => {
      if (
        Array.isArray(resource?.roles) &&
        selectedEvent.users.includes(resource.id) &&
        resource.roles.includes('Room')
      ) {
        acc.push(formatResourceToSelectOption(resource));
      }
      return acc;
    }, [] as any[]);
  });

  const getSupervisionUsers = useLatestCallback(
    (users: any[], resources: any[]) => {
      if (!Array.isArray(users) || users.length === 0) {
        return [] as any[];
      }

      return resources.reduce((acc: any[], resource) => {
        if (users.includes(resource.id) && resource.type === 'Employee') {
          acc.push(formatResourceToSelectOption(resource));
        }
        return acc;
      }, [] as any[]);
    },
  );

  const getCanceledUser = useLatestCallback((resources: any[]) =>
    selectedEvent && !!selectedEvent.user_canceled
      ? resources.reduce((acc: any[], resource) => {
          if (resource.id === selectedEvent.user_canceled) {
            acc.push(formatResourceToSelectOption(resource));
          }
          return acc;
        }, [] as any[])
      : [],
  );

  const getReasonCanceled = useCallback(
    () =>
      selectedEvent && selectedEvent.reason_canceled !== ''
        ? storeReasonsCanceled.filter(
            (e) => selectedEvent.reason_canceled === e.value,
          )
        : [],
    [selectedEvent, storeReasonsCanceled],
  );

  const timezones = getTimeZones().map((val) => ({
    ...val,
    value: val.id,
  }));

  const iniValues = useMemo(() => {
    const timezoneValue = selectedEvent?.timezone || timezone;
    const selectedTimezone =
      timezones.find((t) => t.id === timezoneValue) ?? null;
    const currentStart = moment(selectedEvent.start)
      .tz(timezone)
      .format('YYYY-MM-DD');

    const startRecurPicker = selectedEvent?.extendedProps?.startRecur1
      ? moment(selectedEvent.extendedProps.startRecur1).tz(timezone).toDate()
      : moment(currentStart).toDate();
    const endRecurPicker = selectedEvent?.extendedProps?.endRecur1
      ? moment(selectedEvent.extendedProps.endRecur1)
          .tz(timezone)
          .subtract(1, 'day')
          .toDate()
      : moment(currentStart).toDate();

    const weekdays =
      selectedEvent?.daysofweek?.map((p: any) => weekdayOptions[p]) || [];

    const businessStartTime = convertDateToTodaysDate(
      storeSettingsValuesBusinessStartTime as unknown as string,
    );
    const businessEndTime = convertDateToTodaysDate(
      storeSettingsValuesBusinessEndTime as unknown as string,
    );

    let startPicker = selectedEvent?.start
      ? convertTZ(selectedEvent.start, timezoneValue)
      : moment().tz(timezone).toDate();
    let endPicker = selectedEvent?.end
      ? convertTZ(selectedEvent.end, timezoneValue)
      : moment().tz(timezone).add(1, 'hour').toDate();
    if (!isAddOrUpdate) {
      if (
        activeDay === 'Month' ||
        (activeDay === 'Week' && activeView !== 'Timegrid')
      ) {
        startPicker = businessStartTime;
        endPicker = businessEndTime;
      }
    }
    // Supervision
    const supervisionEvent = storeEvents.find(
      (e) => e.id === selectedEvent?.extendedProps?.supervisionId,
    );
    let supervision = false;
    let supervisionUsers: any[] = [];
    let supervisionActivity = null;
    let supervisionStartTime = startPicker;
    let supervisionEndTime = endPicker;
    let supervisionId = null;
    let supervisionEvent_canceled = false;
    let supervisionEvent_userCanceled = null;
    let supervisionEvent_reasonCanceled = null;
    if (supervisionEvent) {
      supervision = true;
      supervisionId = supervisionEvent.id;

      const eventUsers = getEventUsers(eventResources);
      let employeeIds: any[] = [];
      if (eventUsers?.length) {
        const employeeUsers = eventUsers?.filter(
          (user) => user.type === 'Employee',
        );
        if (employeeUsers?.length) {
          employeeIds = employeeUsers.map((u) => u.value);
        }
      }
      const filteredSupervisionEventUsers = supervisionEvent.users.filter(
        (value: any) => !employeeIds.includes(value),
      );
      supervisionUsers = getSupervisionUsers(
        filteredSupervisionEventUsers,
        eventResources,
      );
      supervisionActivity = getSupervisionActivity(
        eventResources,
        supervisionEvent.activity0Id,
      );
      supervisionStartTime = supervisionEvent?.startUTC
        ? convertTZ(supervisionEvent.startUTC, timezoneValue)
        : moment().tz(timezone).toDate();
      supervisionEndTime = supervisionEvent?.endUTC
        ? convertTZ(supervisionEvent.endUTC, timezoneValue)
        : moment().tz(timezone).add(1, 'hour').toDate();
      supervisionEvent_canceled = supervisionEvent.canceled;
      supervisionEvent_userCanceled = supervisionEvent.user_canceled;
      supervisionEvent_reasonCanceled = supervisionEvent.reason_canceled;
    }

    const sAddress = selectedEvent?.extendedProps?.address;
    const address = sAddress ? { label: sAddress, value: sAddress } : null;
    return {
      branches: storeBranches?.slice(-3),
      title: selectedEvent.title || '',
      allDay: selectedEvent.allDay || false,
      recur: selectedEvent.recur || false,
      visible: selectedEvent.visible || false,
      address,
      latitude: selectedEvent?.extendedProps?.latitude ?? null,
      longitude: selectedEvent?.extendedProps?.longitude ?? null,
      desc: selectedEvent?.extendedProps?.notes || '',
      users: getEventUsers(eventResources),
      rooms: getRoomsUsers(eventResources),
      user_canceled: getCanceledUser(eventResources),
      user_home: selectedEvent.home || [],
      eventIdCustom: selectedEvent?.extendedProps?.eventIdCustom || '',
      startPicker,
      endPicker,
      timezone: selectedTimezone,
      weekdays,
      startRecurPicker,
      endRecurPicker,
      canceled: selectedEvent.canceled === true || false,
      sandboxMode: selectedEvent.sandboxMode === true,
      secondary: false,
      canceled_allday: false,
      make_unavailable_allday: false,
      makeUnavailableCanceledByUser: false,
      reason_canceled: getReasonCanceled(),
      interval: selectedEvent?.extendedProps?.startRecur1
        ? [
            intervalOptions.find(
              (e) => e.value === String(selectedEvent.extendedProps.interval),
            ),
          ]
        : [intervalOptions.find((e) => e.value === '1')],
      frequency: selectedEvent?.extendedProps?.startRecur1
        ? [
            frequencyOptions.find(
              (e) => e.value === selectedEvent.extendedProps.frequency,
            ),
          ]
        : [frequencyOptions.find((e) => e.value === 'Weekly')],
      bysetpos: selectedEvent?.extendedProps?.bysetpos
        ? [
            weekNumberOptions.find(
              (e) => e.value === selectedEvent.extendedProps.bysetpos,
            ),
          ]
        : [weekNumberOptions.find((e) => e.value === '1')],
      // Push Notification
      pushNotification: {
        message: '',
        to: [],
        send: false,
      },
      // supervision
      supervisionId,
      supervision,
      supervisionUsers,
      supervisionActivity,
      supervisionStartTime,
      supervisionEndTime,
      supervisionEvent_canceled,
      supervisionEvent_userCanceled,
      supervisionEvent_reasonCanceled,
      // Converted
      converted: selectedEvent?.converted === true || false,
      startActual:
        selectedEvent?.extendedProps?.startActual && selectedEvent?.converted
          ? new Date(selectedEvent?.extendedProps?.startActual)
          : startPicker,
      endActual:
        selectedEvent?.extendedProps?.endActual && selectedEvent?.converted
          ? new Date(selectedEvent?.extendedProps?.endActual)
          : endPicker,
    };
  }, [
    selectedEvent,
    storeBranches,
    eventResources,
    timezone,
    timezones,
    storeEvents,
    storeSettingsValuesBusinessStartTime,
    storeSettingsValuesBusinessEndTime,
    getCanceledUser,
    getEventUsers,
    getReasonCanceled,
    getRoomsUsers,
    getSupervisionUsers,
    getSupervisionActivity,
    activeDay,
    activeView,
    isAddOrUpdate,
  ]);

  const handleUnav = (values: any) => {
    const selectedTimezone = values?.timezone?.value || timezone;
    const eventData = formatEventData(values, selectedTimezone);
    if (selectedEvent?.resourceId) {
      eventData.users = [selectedEvent.resourceId];
    }

    dispatch(makeUnavailable(eventData));
    dispatch(toggleEventFormDrawerOpen());
    resetInputValuesWithDelay();
  };

  const handleCloseDrawer = () => {
    dispatch(toggleEventFormDrawerOpen());
    resetInputValuesWithDelay();
  };

  const handleResetInputValues = () => {
    dispatch(setSelectedEvent({}));
    setEventResources([]);
    setSelectedBranches([]);
    setEventHistory(null);
  };

  const handleGetEventInfo = async (e: any) => {
    e.preventDefault();
    setEventInfoLoading(true);
    try {
      const obj = await dispatch(
        fetchEventsUpdatedBy({
          createdById: selectedEvent?.extendedProps?.createdById,
          createdAt: selectedEvent?.extendedProps?.createdAt,
          updatedById: selectedEvent?.extendedProps?.updatedById,
          updatedAt: selectedEvent?.extendedProps?.updatedAt,
          deletedAt: selectedEvent?.extendedProps?.deletedAt,
        }),
      );
      setEventHistory(obj);
    } catch (error: any) {
      toast.error(error.res.data);
    } finally {
      setEventInfoLoading(false);
    }
  };

  const resetInputValuesWithDelay = () => {
    setTimeout(() => {
      handleResetInputValues();
    }, DRAWER_TRANSITION_TIME);
  };

  const handleAddEvent = (data: any) => {
    const selectedTimezone = data?.timezone?.value || timezone;
    let eventObj = formatEventData(data, selectedTimezone);

    dispatch(
      operateSelectedEvents({
        operations: {
          toBeAdded: {
            items: [eventObj],
          },
        },
        skipValidation: true,
      }),
    ).then(({ success }) => {
      if (success) {
        dispatch(
          checkNpsSurvey({
            chance: 1, // 100% chance to show NPS survey
          }),
        );
      }
    });
  };

  const handleDeleteEvent = async (values: any) => {
    const selectedTimezone = values?.timezone?.value || timezone;

    let groups: IApiCalendarEventGroupItem[] = [];
    let groupsIsFetched = false;
    const toBeDeletedEvents = await extendDeletingEventsWithRecurringInfo({
      events: [
        {
          ...formatEventData(values, selectedTimezone),
          id: selectedEvent.id,
          eventGroupId: selectedEvent.extendedProps.eventGroupId,
          usersNames: [
            ...(selectedEvent?.extendedProps?.roles_list?.Employee || []),
            ...(selectedEvent?.extendedProps?.roles_list?.Client || []),
          ].map((name) => `${name}`.trim()),
        },
      ],
      onEventGroupsFetched(_groups) {
        groups = _groups;
        groupsIsFetched = true;
      },
    });

    if (!deleteEventsModalRef.current) {
      console.warn('deleteEventsModalRef ref is not attached to component');
      return;
    }

    const recurringEvents = toBeDeletedEvents.filter(
      ({ isRecurring }) => isRecurring,
    );

    const result = await deleteEventsModalRef.current.show({
      showSelectInput: recurringEvents.length > 0,
      options: formatEventOptions({
        eventOptions,
        includeWeekOptions: false,
      }),
    });
    if (!result.isSubmit) {
      return;
    }

    const deleteType = getEventDeleteType(result.payload);
    const preparedToBeDeletedEvents = prepareToBeDeletedEvents({
      events: toBeDeletedEvents.map((item) => item.event),
      deleteType,
      calendarStartDate: storeCalendarStart,
      calendarEndDate: storeCalendarEnd,
      timezone: storeSettingsValuesTimezone,
    });

    // Check whether selected only-this-event delete type
    // deleteType never can be PARTLY here, but we check it for safety
    if (['PARTLY', 'ONLY'].includes(deleteType)) {
      deleteEvents(preparedToBeDeletedEvents);
      return;
    }

    if (!groupsIsFetched) {
      groups = await dispatch(
        fetchEventGroups(
          recurringEvents.map(({ event }) => event.eventGroupId),
        ),
      );
      groupsIsFetched = true;
    }

    // Check whether one of groups has multiple event members
    if (groups.some((item) => item.count > 1)) {
      if (!changeAffectedEventsModalRef.current) {
        console.warn(
          'changeAffectedEventsModalRef ref is not attached to component',
        );
        return;
      }

      const result = await changeAffectedEventsModalRef.current.show({
        eventGroups: groups,
        action: 'DELETE',
        actionType: deleteType,
        toBeChangedEvents: preparedToBeDeletedEvents.items,
      });
      if (!result.isSubmit) {
        return;
      }
    }

    deleteEvents(preparedToBeDeletedEvents);
  };

  const deleteEvents = useLatestCallback(
    async (toBeDeleted: ReturnType<typeof prepareToBeDeletedEvents>) => {
      dispatch(setDeleteEventsLoading(true));
      try {
        const { success } = await dispatch(
          operateSelectedEvents({
            operations: {
              toBeDeleted,
            },
          }),
        );
        if (success) {
          dispatch(
            checkNpsSurvey({
              chance: 1, // 100% chance to show NPS survey
            }),
          );
        }
      } catch (error) {
      } finally {
        dispatch(toggleEventFormDrawerOpen());
        dispatch(setDeleteEventsLoading(false));
      }
    },
  );

  const handleUndeleteEvent = async (_: any) => {
    dispatch(setUndeleteEventsLoading(true));
    try {
      const { success } = await dispatch(
        operateSelectedEvents({
          operations: {
            toBeUndeleted: {
              items: [
                {
                  id: selectedEvent.id,
                  eventGroupId: selectedEvent.extendedProps.eventGroupId,
                },
              ],
            },
          },
        }),
      );
      if (success) {
        dispatch(
          checkNpsSurvey({
            chance: 1, // 100% chance to show NPS survey
          }),
        );
      }
    } catch (error) {
    } finally {
      dispatch(toggleEventFormDrawerOpen());
      dispatch(setUndeleteEventsLoading(false));
    }
  };

  const handleUpdateEvent = async (data: any) => {
    const selectedTimezone = data?.timezone?.value || timezone;

    let updatedEvent = formatEventData(data, selectedTimezone);
    updatedEvent = {
      ...updatedEvent,
      id: selectedEvent.id,
      eventGroupId: selectedEvent.extendedProps.eventGroupId,
      usersNames: data.users.reduce((acc: string[], user: any) => {
        if (['Employee', 'Client'].includes(user.type)) {
          acc.push(user.label);
        }
        return acc;
      }, [] as string[]),
    };
    let previousEventData = eventExtractFormatter(selectedEvent);

    let groups: IApiCalendarEventGroupItem[] = [];
    let groupsIsFetched = false;

    const toBeUpdatedEvents = await extendUpdatingEventsWithRecurringInfo({
      events: [
        {
          newEvent: updatedEvent,
          oldEvent: previousEventData,
        },
      ],
      onEventGroupsFetched(_groups) {
        groups = _groups;
        groupsIsFetched = true;
      },
    });

    const updateLevel = getEventUpdateLevel(
      adaptEventFromUpdateForm(updatedEvent),
      adaptEventFromUpdateForm(previousEventData),
    );
    const cancellationUpdate = getEventCancellationUpdate(
      adaptEventForGetCancellationUpdate(updatedEvent),
      adaptEventForGetCancellationUpdate(previousEventData),
    );

    let availabilityObj: any = null;
    if (
      updatedEvent.canceled &&
      updatedEvent.user_canceled.length &&
      (updatedEvent.make_unavailable_allday ||
        updatedEvent.makeUnavailableCanceledByUser)
    ) {
      availabilityObj = makeUnavailability({
        updatedEvent,
        activityResources: storeActivityResources,
        locationResources: storeLocationResources,
        timezone,
      });
    }

    const cancelAllDay =
      updatedEvent.canceled &&
      updatedEvent.canceled_allday &&
      updatedEvent.user_canceled.length;

    // check update-level=SIMPLE to prevent edge case with RRULE change and cancelAllDay combination
    if (cancelAllDay && updateLevel === 'SIMPLE') {
      // Cancel All Events of today
      const currentEventStart = moment(updatedEvent.start)
        .tz(timezone)
        .format('YYYY-MM-DD');

      const calendarEvents: any[] = [];
      calendarApi?.getEvents().forEach((ev: any) => {
        const existingEv = storeEvents.find((e) => e.id === ev.id);
        if (existingEv) calendarEvents.push(existingEv);
      });

      const toBeCanceledEventsOfToday = calendarEvents.filter((event) => {
        const date = moment(currentEventStart);
        const dayOfWeek = date.day();
        const startDate = moment(event.startRecur);
        const endDate = moment(event.endRecur).add(-1, 'day');
        const isTheSameDate =
          date.isBetween(startDate, endDate, 'days', '[]') &&
          event.daysOfWeek.includes(dayOfWeek);
        // const isTheSameDate =
        //   date.isSame(startDate, 'day') &&
        //   event.daysOfWeek.includes(dayOfWeek);

        if (!isTheSameDate) return false;
        const findCanceledUserIndex = updatedEvent.user_canceled.findIndex(
          (user: any) => event.resourceIds.includes(user.value),
        );
        return (
          findCanceledUserIndex === 0 &&
          !event.canceled &&
          event.id !== updatedEvent.id
        );
      });
      const appliedCancellationsToTheEvents = toBeCanceledEventsOfToday.map(
        (event) => {
          const otExtractedEvent = storeEvents.find((ev) => ev.id === event.id);
          const updatedEventStart = moment(updatedEvent.start).tz(timezone);
          const updatedEventEnd = moment(updatedEvent.start).tz(timezone);
          const moment_start_real = moment(event.start_real).tz(timezone);
          const moment_end_real = moment(event.end_real).tz(timezone);

          const combinedStart = updatedEventStart
            .clone()
            .hour(moment_start_real.hour())
            .minute(moment_start_real.minute())
            .second(moment_start_real.second())
            .format();
          const combinedEnd = updatedEventEnd
            .clone()
            .hour(moment_end_real.hour())
            .minute(moment_end_real.minute())
            .second(moment_end_real.second())
            .format();
          const extractedEvent = eventExtractFormatter({
            id: otExtractedEvent.id,
            start: combinedStart,
            end: combinedEnd,
            allDay: otExtractedEvent.allDay ?? false,
            extendedProps: otExtractedEvent,
          });

          return {
            newEvent: {
              ...extractedEvent,
              canceled: true,
              canceled_allday: true,
              make_unavailable_allday: true,
              reason_canceled: updatedEvent.reason_canceled,
              user_canceled: updatedEvent.user_canceled,
            },
            oldEvent: extractedEvent,
            isRecurring: false,
          };
        },
      );

      if (appliedCancellationsToTheEvents.length) {
        if (!canceledEventsListRef.current) {
          console.warn(
            'canceledEventsListRef ref is not attached to component',
          );
          return;
        }
        const toBeChangedEvents = appliedCancellationsToTheEvents.map(
          ({ newEvent }) => newEvent,
        );
        const result = await canceledEventsListRef.current.show({
          toBeChangedEvents,
        });
        if (!result.isSubmit) {
          return;
        }
      }
      toBeUpdatedEvents.push(...appliedCancellationsToTheEvents);

      const startRange = moment(updatedEvent.start)
        .tz(timezone)
        .format('YYYY-MM-DD');
      const endRange = moment(updatedEvent.start)
        .tz(timezone)
        .add(1, 'day')
        .format('YYYY-MM-DD');

      const startTime = moment
        .tz(timezone)
        .set({ hour: 4, minute: 0, second: 0, millisecond: 0 });
      const endTime = moment
        .tz(timezone)
        .set({ hour: 20, minute: 0, second: 0, millisecond: 0 });

      if (availabilityObj) {
        availabilityObj.data = {
          ...availabilityObj.data,
          startRange,
          endRange,
          startTime,
          endTime,
        };
      }
      dispatch(
        operateSelectedEvents({
          operations: {
            toBeUpdated: prepareToBeUpdatedEvents({
              // only cases which (SIMPLE, ONLY)
              events: toBeUpdatedEvents.map(({ oldEvent, newEvent }) => {
                const newEventStartDate = moment(oldEvent.start).tz(
                  storeSettingsValuesTimezone,
                );
                const newEventStartDatePlusOneDay = newEventStartDate
                  .clone()
                  .add(1, 'days');
                return {
                  oldEvent,
                  newEvent: {
                    ...newEvent,
                    startRecur: newEventStartDate.format('YYYY-MM-DD'),
                    endRecur: newEventStartDatePlusOneDay.format('YYYY-MM-DD'),
                  },
                };
              }),
              updateType: 'ONLY',
              updateLevel: 'SIMPLE',
              calendarStartDate: storeCalendarStart,
              calendarEndDate: storeCalendarEnd,
              timezone,
              cancellationUpdate: true,
            }),
          },
          formatted: false,
          skipValidation: true,
          availabilityObj,
        }),
      ).then(({ success }) => {
        if (success) {
          dispatch(
            checkNpsSurvey({
              chance: 1, // 100% chance to show NPS survey
            }),
          );
        }
      });
      return;
    }

    if (
      updatedEvent?.user_canceled?.[0]?.value &&
      storeSettingsValuesIsolateCanceled
    ) {
      const option = {
        value: updatedEvent.user_canceled[0].id,
        label: updatedEvent.user_canceled[0].title,
        type: updatedEvent.user_canceled[0].type,
        email: updatedEvent.user_canceled[0].email,
        email1: updatedEvent.user_canceled[0].email1,
        email2: updatedEvent.user_canceled[0].email2,
      };
      setSelectedResources([option]);
      isolate([option]);
    }

    const recurringEvents = toBeUpdatedEvents.filter(
      ({ isRecurring }) => isRecurring,
    );

    if (recurringEvents.length === 0) {
      // If selected event is not recurring
      dispatch(
        operateSelectedEvents({
          operations: {
            toBeUpdated: prepareToBeUpdatedEvents({
              // cases which (ALL, SIMPLE, non-recurring) or (ALL, RRULE, not-recurring)
              events: toBeUpdatedEvents,
              updateType: 'ALL',
              updateLevel,
              calendarStartDate: storeCalendarStart,
              calendarEndDate: storeCalendarEnd,
              timezone,
              cancellationUpdate,
            }),
          },
          formatted: false,
          skipValidation: true,
          availabilityObj,
        }),
      ).then(({ success }) => {
        if (success) {
          dispatch(
            checkNpsSurvey({
              chance: 1, // 100% chance to show NPS survey
            }),
          );
        }
      });
      resetInputValuesWithDelay();
      return;
    }

    if (!updateEventsModalRef.current) {
      console.warn('updateEventsModalRef ref is not attached to component');
      return;
    }

    const result = await updateEventsModalRef.current.show({
      showSelectInput: true,
      options: formatEventOptions({
        eventOptions,
        updateLevel,
      }),
    });
    if (!result.isSubmit) {
      return;
    }

    const updateType = getEventUpdateType(result.payload);
    const preparedToBeUpdatedEvents = prepareToBeUpdatedEvents({
      // cases which (ONLY, SIMPLE, recurring) or (ALL, RRULE)
      events: toBeUpdatedEvents.map(({ oldEvent, newEvent, isRecurring }) => {
        if (updateType === 'ONLY' && updateLevel === 'SIMPLE' && isRecurring) {
          const newEventStartDate = moment(newEvent.start).tz(
            storeSettingsValuesTimezone,
          );
          const newEventStartDatePlusOneDay = newEventStartDate
            .clone()
            .add(1, 'days');

          newEvent = {
            ...newEvent,
            startRecur: newEventStartDate.format('YYYY-MM-DD'),
            endRecur: newEventStartDatePlusOneDay.format('YYYY-MM-DD'),
          };
        }

        return {
          oldEvent,
          newEvent,
        };
      }),
      updateType,
      updateLevel,
      timezone,
      calendarStartDate: storeCalendarStart,
      calendarEndDate: storeCalendarEnd,
      cancellationUpdate,
    });

    // Check whether selected only-this-event update type
    if (updateType === 'ONLY') {
      updateEvents(preparedToBeUpdatedEvents);
      return;
    }

    if (!groupsIsFetched) {
      groups = await dispatch(
        fetchEventGroups(
          recurringEvents.map(({ newEvent }) => newEvent.eventGroupId),
        ),
      );
      groupsIsFetched = true;
    }

    // Check whether one of groups has multiple event members
    if (groups.some((item) => item.count > 1)) {
      if (!changeAffectedEventsModalRef.current) {
        console.warn(
          'changeAffectedEventsModalRef ref is not attached to component',
        );
        return;
      }

      const result = await changeAffectedEventsModalRef.current.show({
        eventGroups: groups,
        action: 'UPDATE',
        actionType: updateType,
        toBeChangedEvents: preparedToBeUpdatedEvents.items.map(
          ({ newEvent }) => newEvent,
        ),
        updateLevel,
      });
      if (!result.isSubmit) {
        return;
      }
    }

    updateEvents(preparedToBeUpdatedEvents);
  };

  const updateEvents = useLatestCallback(
    (toBeUpdated: ReturnType<typeof prepareToBeUpdatedEvents>) => {
      let availabilityObj = null;
      if (
        toBeUpdated.items[0]?.newEvent?.canceled &&
        toBeUpdated.items[0]?.newEvent?.id &&
        toBeUpdated.items[0]?.newEvent?.makeUnavailableCanceledByUser
      ) {
        const canceledEventForUnavailability =
          findCanceledEventForUnavailability(
            {
              toBeUpdated: toBeUpdated.items,
            },
            toBeUpdated.items[0]?.newEvent?.id,
          );
        availabilityObj = makeUnavailability({
          updatedEvent: canceledEventForUnavailability,
          activityResources: storeActivityResources,
          locationResources: storeLocationResources,
          timezone,
        });
      }
      dispatch(
        operateSelectedEvents({
          operations: {
            toBeUpdated,
          },
          formatted: false,
          skipValidation: true,
          availabilityObj,
        }),
      ).then(({ success }) => {
        if (success) {
          dispatch(
            checkNpsSurvey({
              chance: 1, // 100% chance to show NPS survey
            }),
          );
        }
      });

      resetInputValuesWithDelay();
    },
  );

  const handleSubmit = (values: any) => {
    if (!isAddOrUpdate) {
      handleAddEvent(values);
    } else {
      handleUpdateEvent(values);
    }
    dispatch(toggleEventFormDrawerOpen());
    resetInputValuesWithDelay();
  };

  const isSupervision = useMemo(() => {
    if (selectedEvent && storeActivityResources?.length) {
      const activity0Id = selectedEvent?.extendedProps?.activity0Id;

      const supervisionActivities = storeActivityResources.filter(
        (e) => e.supervision,
      );
      return (
        supervisionActivities.findIndex((r) => r.id === activity0Id) !== -1
      );
    }
    return false;
  }, [storeActivityResources, selectedEvent]);

  const isDeleted = useMemo(() => {
    if (selectedEvent) {
      const deletedAt = selectedEvent?.extendedProps?.deletedAt;

      return Boolean(deletedAt);
    }
    return false;
  }, [selectedEvent]);

  return (
    <>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues}
        validationSchema={eventValidationSchema()}
        validateOnChange={false}
        enableReinitialize
      >
        {(form) => {
          return (
            <Drawer
              anchor='right'
              open={eventFormDrawerOpen}
              onClose={() => {
                handleCloseDrawer();
                form.handleReset();
              }}
              transitionDuration={DRAWER_TRANSITION_TIME}
              PaperProps={{
                'data-qa': 'appointment-modal',
              }}
            >
              <Stack
                direction='column'
                maxWidth='35rem'
                alignItems='center'
                px={2}
                py={2}
              >
                <Stack
                  width='100%'
                  marginBottom={1}
                  flexDirection='row'
                  justifyContent='space-between'
                  alignItems='center'
                >
                  <Stack>
                    <DialogTitle
                      style={{ padding: '0', color: '#16365f' }}
                      data-qa='appointment-title'
                    >
                      {!isDeleted &&
                        `${isAddOrUpdate ? 'Update' : 'Create'} Event`}
                      {isDeleted && (
                        <Typography fontSize='1rem' color='#ff4b23'>
                          This event Deleted!
                        </Typography>
                      )}
                    </DialogTitle>
                    {isSupervision && (
                      <Typography fontSize='1rem' color='#ff4b23'>
                        You cannot directly update supervision event! <br />
                        Please update parent event!
                      </Typography>
                    )}
                  </Stack>
                  <IconButton
                    onClick={() => {
                      handleCloseDrawer();
                      form.handleReset();
                    }}
                    data-qa='appointment-close'
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                </Stack>

                <form onSubmit={form.handleSubmit}>
                  <AddEventSidebarHelper
                    form={form}
                    add_or_update={isAddOrUpdate}
                    role_permissions={role_permissions}
                    selectedBranches={selectedBranches}
                    handleSelectBranches={(data: any) => {
                      handleSelectBranches([data]);
                    }}
                    eventResources={eventResources}
                    eventResourcesLoading={eventResourcesLoading}
                    selectedEvent={selectedEvent}
                    timezones={timezones}
                    isDeleted={isDeleted}
                  />
                  {Object.values(form.errors).map((err, index) => (
                    <Alert
                      key={index}
                      severity='error'
                      className='alert-block'
                      style={{ marginTop: '1rem' }}
                      data-qa='appointment-error'
                    >
                      {err as any}
                    </Alert>
                  ))}
                  {hasUserPermissionOnLockedScheduler(
                    currentUser,
                    schedulerLocked,
                  ) ? (
                    <EventActions
                      currentUser={currentUser}
                      handleCloseDrawer={handleCloseDrawer}
                      handleDeleteEvent={() => handleDeleteEvent(form.values)}
                      handleUndeleteEvent={() =>
                        handleUndeleteEvent(form.values)
                      }
                      handleUnav={() => handleUnav(form.values)}
                      eventResourcesLoading={eventResourcesLoading}
                      eventInfoLoading={eventInfoLoading}
                      handleGetEventInfo={handleGetEventInfo}
                      isAddOrUpdate={isAddOrUpdate}
                      eventHistory={eventHistory}
                      isSupervision={isSupervision}
                      isDeleted={isDeleted}
                    />
                  ) : (
                    <Alert
                      severity='error'
                      className='alert-block'
                      style={{ marginTop: '1rem' }}
                      data-qa='appointment-error'
                    >
                      Scheduler is locked!
                    </Alert>
                  )}
                  {eventHistory && (
                    <Grid
                      size={{
                        sm: 10,
                        md: 10,
                      }}
                    >
                      <Stack direction='column' color='#6b859e'>
                        <p className={style.infoText}>
                          <HistoryOutlinedIcon fontSize='small' /> Created by{' '}
                          {eventHistory.eventCreatedBy} at{' '}
                          {moment(eventHistory.eventCreatedAt).format(
                            'h:mm:ss a, MMM Do',
                          )}
                        </p>
                        <p className={style.infoText}>
                          <ManageHistoryOutlinedIcon fontSize='small' />{' '}
                          {isDeleted ? `Deleted by` : `Updated by`}{' '}
                          {eventHistory.eventUpdatedBy} at{' '}
                          {moment(eventHistory.eventUpdatedAt).format(
                            'h:mm:ss a, MMM Do',
                          )}
                        </p>
                        <p className={style.infoText}>
                          <ManageHistoryOutlinedIcon fontSize='small' /> Event
                          ID: {selectedEvent.id}
                        </p>
                      </Stack>
                    </Grid>
                  )}
                </form>
              </Stack>
            </Drawer>
          );
        }}
      </Formik>
      {/* Update Event Modal */}
      <ModalWrapper
        ref={updateEventsModalRef}
        renderModal={(
          isOpen,
          modalProps: ISelectAndConfirmPromiseModalPropsForRef,
          handleClose,
          handleConfirm,
        ) => (
          <SelectAndConfirmPromiseModal
            isOpen={isOpen}
            title='Confirm Update Event'
            confirmButtonText='Update'
            confirmButtonColor='primary'
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            {...modalProps}
          />
        )}
      />
      {/* Delete Event Modal */}
      <ModalWrapper
        ref={deleteEventsModalRef}
        renderModal={(
          isOpen,
          modalProps: ISelectAndConfirmPromiseModalPropsForRef,
          handleClose,
          handleConfirm,
        ) => (
          <SelectAndConfirmPromiseModal
            isOpen={isOpen}
            title='Confirm Delete for Event'
            confirmButtonText='Delete'
            confirmButtonColor='error'
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            {...modalProps}
          />
        )}
      />
      <ModalWrapper
        ref={changeAffectedEventsModalRef}
        renderModal={(
          isOpen,
          modalProps: IChangeAffectedEventGroupsConfirmModalPropsForRef,
          handleClose,
          handleConfirm,
        ) => (
          <ChangeAffectedEventGroupsConfirmModal
            isOpen={isOpen}
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            {...modalProps}
          />
        )}
      />
      <ModalWrapper
        ref={canceledEventsListRef}
        renderModal={(
          isOpen,
          modalProps: ICanceledEventsListModalPropsForRef,
          handleClose,
          handleConfirm,
        ) => (
          <CanceledEventsListModal
            isOpen={isOpen}
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            {...modalProps}
          />
        )}
      />
    </>
  );
});

export default AddEventSidebar;
