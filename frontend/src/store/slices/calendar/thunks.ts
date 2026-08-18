import axios from 'axios';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { sortBy, uniqBy } from 'lodash';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../index';
import {
  setEvents,
  setEventsLoading,
  setSocketPending,
  setCalendarTime,
  setAvailabilities,
  setAvailabilitiesFetchedResourceIds,
  setIsCurrentBranchLevelHighest,
  setIsCurrentBranchLastTwoLowest,
  setBranches,
  setStatistics,
  setCurrentBranches,
  setExpandedResourses,
  setTotalTypes,
  setReasonsCanceled,
  setCancellations,
  setSubgroups,
  setTeamsHierarchy,
  setRoles,
  setFrontendRolesHierarchy,
  setOverbookingLoading,
  resetExpandedResources,
  setRetryPopup,
  setDisplayedUser,
  setPushNotification,
  setEventResizingCurrently,
  setLazyResources,
  updateLazyResourceFetchStatus,
  updateLazyResourceFetchStatuses,
  updateLazyResourceFetchCount,
  updateLazyResourceFetchCounts,
  setActivityResources,
  setLocationResources,
  setBlockResources,
  resetEvents,
  resetAvailabilities,
  setLazyResourcesFetchStatus,
  setLazyResourcesFetchCount,
} from './index';
import {
  checkIsCurrentBranchLevelHighest,
  checkIsBranchLastTwoLowest,
  generateTimeRangeParameter,
  handleEvent,
} from 'pages/calendar/utils/formatters';
import operationQueue from 'pages/calendar/classes/OperationQueue';
import { intersectArrays } from 'pages/calendar/utils/intersectArrays';
import { createBranchChildHierarchyMap } from 'pages/calendar/utils/createBranchChildHierarchyMap';
import checkCompanyPlanFeature from 'utils/checkCompanyPlanFeature';
import { getWeekDayOfDate } from 'utils/weekdayGetters';
import role_permissions from 'helpers/role_permissions';
import Errors from 'components/FormItems/error/errors';
import { fetchFlaggingData, fetchCustomConstraints } from '../flagging/actions';
import {
  getCompanySchedulerLockedRecursively,
  setSettingsTimezone,
} from '../../actions/settingsActions';
import {
  setOperations,
  setOperationCurrentIndex,
} from '../calendarUndoRedo/actions';
import { checkNpsSurvey } from '../npsSurvey/actions';
import { selectIsMaxConcurrentJobsReached } from '../solutionGenerator';
import { retriggerSolutionGeneratorJobs } from '../solutionGenerator/actions';
import { ECalendarOperationEnums } from 'types';
import type {
  IApiCalendarEventGroupItem,
  TApiEventUpdateLevel,
  TApiEventUpdateType,
  TApiEventDeleteType,
  TCalendarMultiEventCreateOperationData,
  TCalendarMultiEventUpdateOperationData,
  TCalendarMultiEventDeleteOperationData,
  TCalendarMultiEventUndeleteOperationData,
  ICalendarExecutedOperationItem,
  ICalendarOperationItem,
} from 'types';

export const fetchEvents = (
  params: Record<string, any> | null | undefined = null,
) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const state = getState();
      let filters = {
        bol: true,
        monthViewUser: null,
      };

      if (params) {
        filters = {
          ...filters,
          ...params,
        };
      }

      const sandboxMode = state.calendar.sandboxMode;
      const includeDeleted = state.calendar.includeDeleted;
      const calendars = state.calendar.selectedCalendars;
      const displayedUser = state.calendar.displayedUser;
      const highlightRecentlyChanged =
        state.settings?.settingValues?.highlightRecentlyChanged ?? false;

      // timezones
      const timeZone =
        state.settings?.settingValues?.timezone &&
        state.settings.settingValues.timezone !== ''
          ? state.settings.settingValues.timezone
          : state.calendar.current_branches?.[0]?.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone;
      const datetimeInTimezone = moment().tz(timeZone);
      const offsetMinutes = datetimeInTimezone.utcOffset();
      const startRange = generateTimeRangeParameter(
        state.calendar.calendar_start,
        timeZone,
      );

      const endRange = generateTimeRangeParameter(
        state.calendar.calendar_end,
        timeZone,
      );

      const updatedAtStart = generateTimeRangeParameter(
        state.calendar.eventStartTime,
        timeZone,
      );

      const time = moment().add(-1, 'minutes').toDate().toUTCString();
      const branchNow = state.calendar.current_branches
        .map((e: any) => e.value)
        .join('|');

      const isMoreThanAWeek = moment(endRange).diff(startRange, 'weeks') > 1;
      const calendarResourceIds = Array.isArray(params?.lazyLoadingResourceIds)
        ? params?.lazyLoadingResourceIds
        : state.calendar.visibleResources.reduce((acc, { id, person }) => {
            if (person) {
              acc.push(id);
            }
            return acc;
          }, [] as string[]);

      const resourceIds =
        isMoreThanAWeek && displayedUser?.value
          ? [displayedUser.value]
          : calendarResourceIds;

      if (!resourceIds || resourceIds?.length === 0) {
        return;
      }
      if (branchNow && branchNow.length > 0) {
        //const start2 = Date.now(); // Capture the start time
        //console.log(`Request received at: ${new Date(start2).toISOString()}`);

        const response = await axios.post(
          `/scheduler/events`,
          {
            people: resourceIds.map((p: any) => p).join('|'),
            startRange: startRange,
            endRange: endRange,
            activities: calendars.activity.map((e) => e.id),
            locations: calendars.location.map((e: any) => e.id),
            tags: calendars.tags.map((e: any) => e.id),
            timezone: timeZone,
            offset: offsetMinutes,
            backgroundColorRole:
              state.settings.settingValues?.backgroundColorRole,
            borderColorRole: state.settings.settingValues?.borderColorRole,
          },
          {
            params: {
              start: startRange,
              end: endRange,
              branches: branchNow,
              updatedAtStart,
              bol: filters.bol,
              sandboxMode,
              includeDeleted: includeDeleted || highlightRecentlyChanged,
            },
          },
        );
        const existingEvents = getState().calendar.events;
        // const deletedEventIds = response.data
        //   .filter((y: any) => y.deletedAt)
        //   .map((y: any) => y.id);
        let latestEvents = (response?.data || []).filter(
          (event: any) => event.daysOfWeek.length > 0,
        );

        if (filters.bol || params?.lazyLoadingResourceIds?.length) {
          const ids = latestEvents.map((y: any) => y.id);
          latestEvents = latestEvents.concat(
            existingEvents.filter((t: any) => !ids.includes(t.id)),
          );
        }

        // latestEvents = latestEvents.filter(
        //   (y: any) => !deletedEventIds.includes(y.id),
        // );
        const sortedEvents = sortBy(latestEvents, 'start_real');
        let uniqueEvents = uniqBy(sortedEvents, 'id');

        dispatch(
          setEvents({
            events: uniqueEvents,
            time: time,
          }),
        );
      }
    } catch (error: any) {
      console.log('error', error);
      const errMsg = error?.response?.data;
      if (errMsg) {
        toast.error(errMsg);
      }
      return Promise.reject(error);
    }
  };
};

export const socketEvent = (data: any[]) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const includeDeleted = state.calendar.includeDeleted;
    const settingsHighlightRecentlyChanged =
      state.settings.settingValues.highlightRecentlyChanged;

    let eventsArr: any[] = data.map((event) => event.o);

    const ids = eventsArr.map((y) => y.id);
    let idsDeleted: any[] = [];
    if (!includeDeleted || !settingsHighlightRecentlyChanged) {
      idsDeleted = eventsArr
        .filter((y) => !y.eventGroupId && y.deletedAt)
        .map((y) => y.id);
    }

    const time = moment().add(-1, 'minutes').toDate().toUTCString();
    const calendarEvents = state.calendar.events;

    if (eventsArr.length > 0) {
      dispatch(setSocketPending(true));
      if (state.calendar.events_resizing_currently.length === 0) {
        eventsArr = [
          ...eventsArr,
          ...calendarEvents.filter((t: any) => !ids.includes(t.id)),
        ];

        // Remove deleted events and events without daysOfWeek
        eventsArr = eventsArr.filter(
          (y) => !idsDeleted.includes(y.id) && y.daysOfWeek.length > 0,
        );
        // Remove duplicated events
        eventsArr = uniqBy(eventsArr, 'id');
        // Update Calendar Events State

        dispatch(
          setEvents({
            events: eventsArr,
            time: time,
          }),
        );
      }
    }
  };
};

let eventsFetchTimer = -1;
let flaggingFetchTimer = -1;

export const updateCalendarTime = ({
  start,
  end,
}: {
  start: any;
  end: any;
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const startDate = moment(start);
    const endDate = moment(end);
    // Check if the difference is more than one week
    const isMoreThanAWeek = endDate.diff(startDate, 'weeks') > 1;

    const currentUser = state.auth.currentUser;
    const membership = state.settings.settingsCompany.company.membership;
    const visiblePersonResourceIds = state.calendar.visibleResources.reduce(
      (acc, { id, person }) => {
        if (person) {
          acc.push(id);
        }
        return acc;
      },
      [] as string[],
    );
    const displayedUser = state.calendar.displayedUser;
    const statsViewEnabled = state.settings.settingValues.statsViewEnabled;
    const isFlaggingEnabled = state.flagging.flaggingEnabled;
    const isOverbookingEnabled = state.settings.settingValues.overbooking;

    dispatch(
      setCalendarTime({
        start: start,
        end: end,
      }),
    );

    window.clearTimeout(eventsFetchTimer);
    eventsFetchTimer = window.setTimeout(async () => {
      dispatch(setEventsLoading(true));
      try {
        await Promise.all([
          dispatch(
            fetchEvents({
              bol: false,
              monthViewUser: isMoreThanAWeek ? displayedUser : null,
            }),
          ),
          dispatch(fetchResourceAvailabilities()),
          (() => {
            if (statsViewEnabled) {
              return dispatch(
                fetchStatistics({
                  start,
                  end,
                }),
              );
            }
          })(),
          (() => {
            if (
              checkCompanyPlanFeature(membership, 'flagging') &&
              role_permissions(currentUser, 'flaggingFeature') &&
              (isFlaggingEnabled || isOverbookingEnabled)
            ) {
              window.clearTimeout(flaggingFetchTimer);
              flaggingFetchTimer = window.setTimeout(() => {
                dispatch(
                  fetchFlaggingData({
                    ids: visiblePersonResourceIds,
                  }),
                );
              }, 150);
            }
          })(),
        ]);
      } catch (error: any) {
        const msg = error?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error('Something went wrong. Try again!');
        }

        return Promise.reject(error);
      } finally {
        dispatch(setEventsLoading(false));
      }
    }, 400);
  };
};

export const fetchResourceAvailabilities = ({
  lazyLoadingResourceIds,
}: {
  lazyLoadingResourceIds?: string[];
} = {}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const currentUser = state.auth.currentUser;
      const isMoreThanAWeek =
        moment(state.calendar.calendar_end).diff(
          moment(state.calendar.calendar_start),
          'weeks',
        ) > 1;

      if (
        !role_permissions(currentUser, 'viewAvailability') ||
        isMoreThanAWeek
      ) {
        return;
      }

      const branchNow = state.calendar.branches ?? [];
      if (!Array.isArray(branchNow) || branchNow.length === 0) {
        return;
      }

      const resourceIds = Array.isArray(lazyLoadingResourceIds)
        ? lazyLoadingResourceIds
        : state.calendar.visibleResources.map(({ id }) => id);

      if (resourceIds.length === 0) {
        return;
      }

      const timeZone =
        state.settings?.settingValues?.timezone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone;
      const startRange = generateTimeRangeParameter(
        state.calendar.calendar_start,
        timeZone,
      );
      const endRange = generateTimeRangeParameter(
        state.calendar.calendar_end,
        timeZone,
      );

      const response = await axios.post(
        `/scheduler/resource-availabilities`,
        {
          resourceIds: resourceIds.map((p: any) => p).join('|'),
        },
        {
          params: {
            start: startRange,
            end: endRange,
            timezone: timeZone,
          },
        },
      );

      let availabilities = response.data as any[];
      if (
        Array.isArray(lazyLoadingResourceIds) &&
        lazyLoadingResourceIds.length > 0
      ) {
        const existingAvailabilities = getState().calendar.availabilities;
        const availabilityIdsMap = availabilities.reduce(
          (acc: Map<string, boolean>, item: any) => {
            acc.set(item.av_id, true);
            return acc;
          },
          new Map<string, boolean>(),
        );
        availabilities = [
          ...existingAvailabilities.filter(
            (item) => !availabilityIdsMap.has(item.av_id),
          ),
          ...availabilities,
        ];
      }

      dispatch(setAvailabilities(availabilities));
      dispatch(
        setAvailabilitiesFetchedResourceIds(
          resourceIds.reduce(
            (acc, id) => {
              acc[id] = true;
              return acc;
            },
            {} as Record<string, boolean>,
          ),
        ),
      );
    } catch (error: any) {
      console.log('error', error);
      const errMsg = error?.response?.data;
      if (errMsg) {
        toast.error(errMsg);
      }
      return Promise.reject(error);
    }
  };
};

// ** Fetch Event_updatedby and createdby
export const fetchEventsUpdatedBy = (eventData: any) => {
  return async (_: AppDispatch, __: () => RootState) => {
    const { createdById, createdAt, updatedAt, updatedById, deletedAt } =
      eventData;
    const response = await axios.get(`/scheduler/events/history`, {
      params: {
        createdById,
        updatedById,
      },
    });
    return {
      eventUpdatedBy: response.data.updatedBy,
      eventCreatedBy: response.data.createdBy,
      eventUpdatedAt: moment(updatedAt).format('h:m:ss a MM/DD/YY'),
      eventCreatedAt: moment(createdAt).format('h:m:ss a MM/DD/YY'),
      eventdeletedAt: moment(deletedAt).format('h:m:ss a MM/DD/YY'),
    };
  };
};

export const fetchBranches = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    let bol = state.calendar.current_branches[0] === 'lk';
    const currentUser = state.auth.currentUser;
    const membership = state.settings.settingsCompany.company.membership;
    const selectedBranches = state.settings.settingValues.selectedBranches;

    const response = await axios.get(`/scheduler/branches`);

    const findUsersBranch =
      selectedBranches.length > 0
        ? Object.values(response.data)
            .flatMap((t: any) => t.options)
            .find((t) => t.value === selectedBranches[0].id)
        : null;

    const branchNow = findUsersBranch ? [findUsersBranch] : [response.data[0]];

    dispatch(
      setBranches({
        branches: response.data,
        branchNow,
      }),
    );

    const currentBranchTimezone = branchNow?.[0]?.timezone;
    const globalTimezone = state.settings?.settingValues?.timezone;

    if (!globalTimezone && currentBranchTimezone) {
      dispatch(setSettingsTimezone(currentBranchTimezone));
    }

    if (bol && branchNow[0]) {
      const isHeighest = checkIsCurrentBranchLevelHighest(
        response.data,
        branchNow[0].level,
      );
      const isLastTwoLowest = checkIsBranchLastTwoLowest(
        response.data,
        branchNow[0].value,
      );

      dispatch(setIsCurrentBranchLevelHighest(isHeighest));
      dispatch(setIsCurrentBranchLastTwoLowest(isLastTwoLowest));

      if (isLastTwoLowest) {
        dispatch(
          prefetchResources({
            branchId: branchNow[0].value,
            allBranches: response.data,
          }),
        );
      } else {
        dispatch(
          fetchNonPersonResources({
            branches: branchNow[0].value,
          }),
        );
      }

      const callCustomConstraint =
        (checkCompanyPlanFeature(membership, 'flagging') &&
          role_permissions(currentUser, 'flaggingFeature')) ||
        (checkCompanyPlanFeature(membership, 'optimizer') &&
          role_permissions(currentUser, 'optimizerFeature')) ||
        role_permissions(currentUser, 'createEvent');
      if (callCustomConstraint) {
        dispatch(fetchCustomConstraints());
      }
    }
  };
};

export const changeBranch = (branch: any) => {
  return (dispatch: AppDispatch, _: () => RootState) => {
    dispatch(resetExpandedResources());
    dispatch(resetEvents());
    dispatch(resetAvailabilities());
    dispatch(setLazyResources([]));
    dispatch(setLazyResourcesFetchStatus({}));
    dispatch(setLazyResourcesFetchCount({}));
    dispatch(currentBranches([branch]));
    dispatch(fetchSubgroups([branch].map((e) => e.value).join('|')));
  };
};

export const currentBranches = (branches: any[]) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setCurrentBranches(branches));

    if (branches && branches.length) {
      const currentBranchTimezone = branches[0].timezone;
      if (currentBranchTimezone) {
        dispatch(setSettingsTimezone(currentBranchTimezone));
      }

      if (branches[0]) {
        dispatch(getCompanySchedulerLockedRecursively(branches[0].value));
      }

      const state = getState();

      const allBranches = state.calendar.branches;
      const isHeighest = checkIsCurrentBranchLevelHighest(
        allBranches,
        branches[0].level,
      );
      const isLastTwoLowest = checkIsBranchLastTwoLowest(
        allBranches,
        branches[0].value,
      );
      dispatch(setIsCurrentBranchLevelHighest(isHeighest));
      dispatch(setIsCurrentBranchLastTwoLowest(isLastTwoLowest));

      await Promise.all([
        isLastTwoLowest
          ? dispatch(
              prefetchResources({
                branchId: branches[0].value,
                allBranches,
              }),
            )
          : dispatch(
              fetchNonPersonResources({
                branches: branches.map((e) => e.value).join('|'),
              }),
            ),
        (() => {
          const currentUser = state.auth.currentUser;
          const membership = state.settings.settingsCompany.company.membership;

          const callCustomConstraint =
            (checkCompanyPlanFeature(membership, 'flagging') &&
              role_permissions(currentUser, 'flaggingFeature')) ||
            (checkCompanyPlanFeature(membership, 'optimizer') &&
              role_permissions(currentUser, 'optimizerFeature')) ||
            role_permissions(currentUser, 'createEvent');
          if (callCustomConstraint) {
            return dispatch(fetchCustomConstraints());
          }
        })(),
      ]);
    }
  };
};

/**
 * Toggles the expansion state of a resource in the calendar view.
 * If the resource is already expanded, it will be collapsed.
 * If the resource is collapsed, it will be expanded.
 *
 * This function also handles solution generator job limits by checking if the maximum
 * number of concurrent jobs has been reached before allowing resource expansion.
 *
 * @param resource - The resource to toggle expansion for
 * @param resource.id - Unique identifier of the resource
 * @param resource.type - Type of the resource (e.g., 'Employee', 'Client', 'Activity', 'Location')
 */
export const expandResource = (resource: { id: string; type: string }) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const solutionGeneratorJobs = state.solutionGenerator.solutionGeneratorJobs;
    const branchId = state.calendar.current_branches[0]?.value;
    const resourceId = resource.id;
    const jobKey = `${resourceId}__${branchId}`;
    const isJobExists = !!solutionGeneratorJobs[jobKey];
    const isMaxConcurrentJobsReached = selectIsMaxConcurrentJobsReached(state);

    // Check if max concurrent jobs limit is reached and prevent expansion if so
    if (!isJobExists && isMaxConcurrentJobsReached) {
      // If the job does not exist and the total jobs exceed the limit, do not proceed
      toast.error(`Max solution generator jobs reached. Please wait.`);
      return;
    }

    // Get the current list of expanded resources, default to empty array if not set
    const expandedResources = state.calendar?.expandedResources || [];

    // Check if the resource is already in the expanded state
    const isResourceExpanded = expandedResources.some(
      (expandedResource: any) => expandedResource.id === resource.id,
    );

    // Note: allow only one resource to be expanded at a time for now
    const updatedExpandedResources = isResourceExpanded
      ? []
      : [
          {
            id: resource.id,
            type: resource.type,
          },
        ];

    // Dispatch the updated expanded resources list
    dispatch(setExpandedResourses(updatedExpandedResources));
  };
};

export const fetchNonPersonResources = ({
  branches = 'lk',
}: {
  branches?: string;
} = {}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const currentBranchId = state.calendar.current_branches[0].value;

    const _branches = branches === 'lk' ? currentBranchId : branches;
    if (!_branches) {
      return;
    }

    const response = await axios.post(
      `/scheduler/resources`,
      {
        resourceTypes: ['Activity', 'Location', 'Block'].join('|'),
      },
      {
        params: {
          branches: _branches,
        },
      },
    );

    const resources = (response?.data || []) as any[];

    const categorizedResources = resources.reduce(
      (categories, resource) => {
        switch (resource.type) {
          case 'Activity':
            categories.activityResources.push(resource);
            break;
          case 'Location':
            categories.locationResources.push(resource);
            break;
          case 'Block':
            categories.blockResources.push(resource);
            break;
        }
        return categories;
      },
      {
        activityResources: [] as any[],
        locationResources: [] as any[],
        blockResources: [] as any[],
      },
    );

    const { activityResources, locationResources, blockResources } =
      categorizedResources;

    dispatch(setActivityResources(activityResources));
    dispatch(setLocationResources(locationResources));
    dispatch(setBlockResources(blockResources));
  };
};

export const prefetchResources = ({
  branchId = 'lk',
  allBranches,
}: {
  branchId?: string;
  allBranches: any[];
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const currentBranchId = state.calendar.current_branches[0].value;

    const _branchId = branchId === 'lk' ? currentBranchId : branchId;
    if (!_branchId) {
      return;
    }

    const branchChildHierarchy = createBranchChildHierarchyMap(
      allBranches.flatMap((item) => item.options),
    );

    const childBranches = branchChildHierarchy[_branchId] || [];
    if (!Array.isArray(childBranches) || childBranches.length === 0) {
      return;
    }

    const fetchStatusKeys = ['Employee', 'Client'].flatMap((resourceType) =>
      childBranches.map((branchId) => `${branchId}:${resourceType}`),
    );

    dispatch(
      updateLazyResourceFetchStatuses(
        fetchStatusKeys.map((fetchStatusKey) => ({
          key: fetchStatusKey,
          status: 'loading',
        })),
      ),
    );

    try {
      const response = await axios.post(`/scheduler/resources`, undefined, {
        params: {
          branches: _branchId,
        },
      });

      const allResources = (response?.data || []) as any[];

      // Categorize resources by type
      const categorizedResources = allResources.reduce(
        (categories, resource) => {
          switch (resource.type) {
            case 'Activity':
              categories.activityResources.push(resource);
              break;
            case 'Location':
              categories.locationResources.push(resource);
              break;
            case 'Block':
              categories.blockResources.push(resource);
              break;
            default:
              categories.lazyResources.push(resource);
              break;
          }
          return categories;
        },
        {
          activityResources: [] as any[],
          locationResources: [] as any[],
          blockResources: [] as any[],
          lazyResources: [] as any[],
        },
      );

      const {
        activityResources,
        locationResources,
        blockResources,
        lazyResources,
      } = categorizedResources;

      dispatch(setActivityResources(activityResources));
      dispatch(setLocationResources(locationResources));
      dispatch(setBlockResources(blockResources));
      dispatch(setLazyResources(lazyResources));
      dispatch(
        updateLazyResourceFetchStatuses(
          fetchStatusKeys.map((fetchStatusKey) => ({
            key: fetchStatusKey,
            status: 'success',
          })),
        ),
      );
      dispatch(
        updateLazyResourceFetchCounts(
          ['Employee', 'Client'].flatMap((resourceType) =>
            childBranches.map((branchId) => {
              const count =
                lazyResources.filter(
                  (r: any) =>
                    r.type === resourceType &&
                    r?.branches?.includes(branchId) &&
                    !r.calendarhide,
                ).length || 1;
              return {
                key: `${branchId}:${resourceType}`,
                count: count,
              };
            }),
          ),
        ),
      );
    } catch (error: any) {
      console.log('error', error);
      const errMsg = error?.response?.data;
      if (errMsg) {
        toast.error(errMsg);
      }
      dispatch(
        updateLazyResourceFetchStatuses(
          fetchStatusKeys.map((fetchStatusKey) => ({
            key: fetchStatusKey,
            status: 'error',
          })),
        ),
      );
    }
  };
};

export const fetchResourcesLazy = ({
  branchId,
  resourceType,
}: {
  branchId: string;
  resourceType: string;
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const lazyResourcesFetchStatus = state.calendar.lazyResourcesFetchStatus;
    const fetchStatusKey = `${branchId}:${resourceType}`;
    const fetchStatus = lazyResourcesFetchStatus[fetchStatusKey];
    if (['loading', 'success'].includes(fetchStatus)) {
      return;
    }

    dispatch(
      updateLazyResourceFetchStatus({
        key: fetchStatusKey,
        status: 'loading',
      }),
    );
    try {
      const response = await axios.post(
        `/scheduler/resources`,
        {
          resourceTypes: resourceType,
          excludeDescendents: true,
        },
        {
          params: {
            branches: branchId,
          },
        },
      );

      const resources = response.data;
      const resourceIdsMap = resources.reduce(
        (acc: Map<string, boolean>, item: any) => {
          acc.set(item.id, true);
          return acc;
        },
        new Map<string, boolean>(),
      );

      dispatch(
        setLazyResources([
          ...getState().calendar.lazyResources.filter(
            (item) => !resourceIdsMap.has(item.id),
          ),
          ...resources,
        ]),
      );
      dispatch(
        updateLazyResourceFetchStatus({
          key: fetchStatusKey,
          status: 'success',
        }),
      );
      dispatch(
        updateLazyResourceFetchCount({
          key: fetchStatusKey,
          count: resources.filter((r: any) => !r.calendarhide).length,
        }),
      );
    } catch (error: any) {
      console.log('error', error);
      const errMsg = error?.response?.data;
      if (errMsg) {
        toast.error(errMsg);
      }
      dispatch(
        updateLazyResourceFetchStatus({
          key: fetchStatusKey,
          status: 'error',
        }),
      );
    }
  };
};

export const fetchStatistics = ({
  start,
  end,
  resourceIds,
  bol1 = true,
  bol2 = true,
}: {
  start: any;
  end: any;
  resourceIds?: string[];
  bol1?: boolean;
  bol2?: boolean;
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    if (
      moment(state.calendar.calendar_end).diff(
        moment(state.calendar.calendar_start),
      ) > 86400000
    ) {
      bol1 = false;
    }

    const visibleResourcesIds = state.calendar.visibleResources.map(
      (r) => r.id,
    );
    const visiblePersonResourceIds = state.calendar.visibleResources.reduce(
      (acc, { id, person }) => {
        if (person) {
          acc.push(id);
        }
        return acc;
      },
      [] as string[],
    );

    const visibleResourcesIdsMap = visibleResourcesIds.reduce((acc, id) => {
      acc.set(id, true);
      return acc;
    }, new Map<string, boolean>());
    const visiblePersonResourceIdsMap = visiblePersonResourceIds.reduce(
      (acc, id) => {
        acc.set(id, true);
        return acc;
      },
      new Map<string, boolean>(),
    );

    const personResourceIds = Array.isArray(resourceIds)
      ? resourceIds.filter((id) => visiblePersonResourceIdsMap.has(id))
      : visiblePersonResourceIds;

    resourceIds = Array.isArray(resourceIds)
      ? resourceIds.filter((id) => visibleResourcesIdsMap.has(id))
      : visibleResourcesIds;

    if (resourceIds.length === 0) {
      return;
    }

    const resourceIdsMap = resourceIds.reduce((acc, id) => {
      acc.set(id, true);
      return acc;
    }, new Map<string, boolean>());

    const resources = [
      ...[
        ...state.calendar.lazyResources,
        ...state.calendar.locationResources,
        ...state.calendar.blockResources,
      ].filter((item) => resourceIdsMap.has(item.id)),
      ...state.calendar.activityResources,
    ];

    const level = state.calendar.current_branches[0].level;

    const branchNow = state.calendar.current_branches
      .map((e: any) => e.value)
      .join('|');

    const sandboxMode = state.calendar.sandboxMode;
    const datetimeInTimezone = moment().tz(
      state.settings?.settingValues?.timezone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    );

    const formData = {
      people: personResourceIds.map((p) => p).join('|'),
      activities: null,
      totalType: state.settings.settingValues.totalCustom || 'total',
      bol1: bol1,
      bol2: bol2,
      level: level,
      resources,
      offset: -datetimeInTimezone.utcOffset(),
    };

    const response = await axios.post(
      `/scheduler/statistics?start=${start}&end=${end}&branches=${branchNow}&sandboxMode=${sandboxMode}`,
      formData,
    );

    const capacity = response.data.capacity;
    const individual = response.data.individual;
    const currentStatistics = getState().calendar.statistics;

    capacity.users = {
      ...Object.keys(currentStatistics.capacity.users).reduce(
        (acc: any, id: string) => {
          if (!(id in capacity.users)) {
            acc[id] = currentStatistics.capacity.users[id];
          }
          return acc;
        },
        {},
      ),
      ...capacity.users,
    };
    individual.users = {
      ...Object.keys(currentStatistics.individual.users).reduce(
        (acc: any, id: string) => {
          if (!(id in individual.users)) {
            acc[id] = currentStatistics.individual.users[id];
          }
          return acc;
        },
        {},
      ),
      ...individual.users,
    };

    dispatch(
      setStatistics({
        statistics: {
          capacity,
          individual,
        },
        bol1: bol1,
        bol2: bol2,
      }),
    );
  };
};

export const fetchTotalTypes = () => {
  return async (dispatch: AppDispatch, _: () => RootState) => {
    const response = await axios.get('/totaltypes?activity=none');
    dispatch(setTotalTypes(response.data.rows));
  };
};

export const fetchReasonsCanceled = () => {
  return async (dispatch: AppDispatch, _: () => RootState) => {
    const response = await axios.get('/scheduler/reasons_canceled');
    dispatch(setReasonsCanceled(response.data));
  };
};

export const fetchCancellations = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const timeZone =
      state.settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    const startRange = generateTimeRangeParameter(
      state.calendar.calendar_start,
      timeZone,
    );
    const endRange = generateTimeRangeParameter(
      state.calendar.calendar_end,
      timeZone,
    );

    const response = await axios.get(`/scheduler/cancellations`, {
      params: {
        start: startRange,
        end: endRange,
      },
    });

    dispatch(setCancellations(response.data));
  };
};

export const fetchSubgroups = (branches: any[] | string | undefined = []) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const branchNow =
      branches.length > 0
        ? branches
        : getState()
            .calendar.current_branches.map((e: any) => e.value)
            .join('|');
    const response = await axios.get('/scheduler/subgroups', {
      params: {
        branches: branchNow,
        excludeTeamsHierarchy: true,
      },
    });

    dispatch(setSubgroups(response.data[0]));
  };
};

export const fetchTeamsHierarchy = () => {
  return async (dispatch: AppDispatch, _: () => RootState) => {
    const response = await axios.get('/scheduler/teams-hierarchy');
    dispatch(setTeamsHierarchy(response.data));
  };
};

export const fetchRoles = () => {
  return async (dispatch: AppDispatch, _: () => RootState) => {
    const response = await axios.get('/scheduler/roles');
    dispatch(setRoles(response.data));
  };
};

export const fetchFrontendRolesHierarchy = () => {
  return async (dispatch: AppDispatch, _: () => RootState) => {
    const response = await axios.get('/scheduler/roles_hierarchy');
    dispatch(setFrontendRolesHierarchy(response.data));
  };
};

export const replacing = (event: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const activityResources = state.calendar.activityResources;
    const locationResources = state.calendar.locationResources;
    const blockResources = state.calendar.blockResources;
    let formData: Record<string, any> = {};
    const eventData = handleEvent({
      event,
      activityResources,
      locationResources,
      fallbackTimezone: state.settings?.settingValues?.timezone as any,
    });
    formData = {
      data: {
        ...eventData.data,
        id: event.id,
      },
      id: event.id,
    };

    dispatch(setOverbookingLoading(true));
    try {
      // Here we are assuming that sol-gen returns resources either with Person, Activity or Location, not any other type
      const people = formData.data.users
        .filter(
          (p: any) =>
            ![
              ...activityResources,
              ...locationResources,
              ...blockResources,
            ].find((t) => t.id === p),
        )
        .join('|');
      const branchNow = state.calendar.current_branches
        .map((e: any) => e.value)
        .join('|');

      const response = await axios.post(
        '/scheduler/overbooking',
        {
          obj: formData,
          people: people,
        },
        {
          params: {
            overbook: true,
            start: formData.data.startRecur,
            end: formData.data.endRecur,
            startTime: formData.data.start,
            endTime: formData.data.end,
            branches: branchNow,
            eventId: JSON.stringify([formData.id]),
          },
        },
      );
      const overlappingEvents = response.data.overlapping_events;
      const intersectionEvents = response.data.overlapping_events;

      if (
        intersectionEvents &&
        intersectionEvents.length &&
        overlappingEvents &&
        overlappingEvents.length
      ) {
        const replacingData = intersectionEvents.map((e: any) => {
          return {
            start: moment(e.start).format('MM-DD-YYYY h:mm a'),
            end: moment(e.end).format('MM-DD-YYYY h:mm a'),
            location: e.users.map((t: any) => t.firstName).join(' - '),
            users: e.users.map((t: any) => t.firstName).join(' - '),
            activity: e.activity,
            client: e.client,
            employee: e.employee,
            intersection: e.inter.join(' - '),
            time: `${moment(e.lo_time).format('h:mm')} - ${moment(
              e.hi_time,
            ).format('h:mm a')}`,
          };
        });

        return {
          replacingData,
          overlappingEvents,
        };
      }
    } catch (error: any) {
      const msg = error?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again!');
      }
    } finally {
      dispatch(setOverbookingLoading(false));
    }
  };
};

export const makeUnavailable = (event: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const formData = handleEvent({
      event,
      activityResources: state.calendar.activityResources,
      locationResources: state.calendar.locationResources,
      fallbackTimezone: state.settings?.settingValues?.timezone as any,
      includeActivityLocationResources: true,
    });

    try {
      await axios.post(`/availabilities/unavailable`, formData);

      // ** ADD-OPERATON
      dispatch(
        addOperation({
          operation: {
            name: 'Create Unavailable',
            executedOperations: [
              {
                route: '/availabilities/unavailable',
                type: ECalendarOperationEnums.CREATED,
                data: {
                  requestData: {
                    body: formData,
                  },
                },
              },
            ],
          },
          allResources: [...(formData?.data?.users || [])],
        }),
      );

      await Promise.all([
        dispatch(fetchResourceAvailabilities()),
        dispatch(fetchEvents()),
      ]);
    } catch (error: any) {
      const msg = error?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again!');
      }
    }
  };
};

export const removeUnavailable = (checkedResources: any[]) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const start = moment(getState().calendar.calendar_start);
    const end = moment(getState().calendar.calendar_end);
    const optimizerJobs = getState().optimizer.optimizerJobs;
    const currentBranches = getState().calendar.current_branches;
    const timezone =
      getState().settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    const unav = getState().calendar.availabilities.filter((a: any) => {
      const startDate = moment.tz(a.start, timezone).startOf('day');
      const endDate = moment.tz(a.end, timezone).endOf('day');
      const isInRange = optimizerJobs.some((job) => {
        if (job.branch?.value !== currentBranches?.[0]?.value) {
          return false; // Skip jobs not in the current branch
        }

        const jobStartDate = moment(job.startDate).tz(timezone);
        const jobEndDate = moment(job.endDate).tz(timezone);

        // Check if the job's date range overlaps with the given date range
        // Overlap occurs when: job start <= given end AND job end >= given start
        const startOverlap = jobEndDate.isSameOrAfter(startDate);
        const endOverlap = jobStartDate.isSameOrBefore(endDate);

        return startOverlap && endOverlap;
      });

      return (
        !a.av &&
        a.resourceIds.length > 0 &&
        checkedResources.some((item) => item?.value === a.resourceIds[0]) &&
        moment(a.start).diff(start) >= 0 &&
        moment(a.end).diff(end) <= 0 &&
        !isInRange
      );
    });

    if (unav.length > 0) {
      await axios.post(`/scheduler/remove_availabilities`, {
        ids: unav.map((a: any) => a.av_id),
      });
      dispatch(fetchResourceAvailabilities());
    }
  };
};

export const addUnavailablities = (
  checkedResources: any[],
  available: boolean = false,
) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const timezone =
      getState().settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const calendarStart = getState().calendar.calendar_start;
    const calendarEnd = getState().calendar.calendar_end;
    const optimizerJobs = getState().optimizer.optimizerJobs;
    const currentBranches = getState().calendar.current_branches;

    const startTime = moment
      .tz(timezone)
      .set({ hour: 4, minute: 0, second: 0, millisecond: 0 });
    const endTime = moment
      .tz(timezone)
      .set({ hour: 20, minute: 0, second: 0, millisecond: 0 });

    const startRange = moment(calendarStart).tz(timezone).format('YYYY-MM-DD');
    const endRange = moment(calendarEnd).tz(timezone).format('YYYY-MM-DD');
    const weekday = getWeekDayOfDate(startRange).value;

    const startDate = moment.tz(calendarStart, timezone).startOf('day');
    const endDate = moment.tz(calendarEnd, timezone).startOf('day');

    const isInRange = optimizerJobs.some((job) => {
      if (job.branch?.value !== currentBranches?.[0]?.value) {
        return false; // Skip jobs not in the current branch
      }

      const jobStartDate = moment(job.startDate).tz(timezone);
      const jobEndDate = moment(job.endDate).tz(timezone);

      // Check if the job's date range overlaps with the given date range
      // Overlap occurs when: job start <= given end AND job end >= given start
      const startOverlap = jobEndDate.isSameOrAfter(startDate);
      const endOverlap = jobStartDate.isSameOrBefore(endDate);

      return startOverlap && endOverlap;
    });

    if (isInRange) {
      return;
    }
    // TODO Remove overriding unavailabilites between startRange, endRang
    let unavailabilitiesArray = checkedResources.map((resource: any) => ({
      id: uuidv4(),
      user: resource.value,
      startTime,
      endTime,
      days: [weekday],
      timezone,
      available,
      startRange,
      endRange,
      status: 'Approved',
    }));
    if (unavailabilitiesArray.length) {
      await axios.post(`/availabilities/create/multiple`, {
        data: unavailabilitiesArray,
      });

      dispatch(
        addOperation({
          operation: {
            name: 'Multi Create Unavailable',
            executedOperations: [
              {
                route: '/availabilities',
                type: ECalendarOperationEnums.MULTI_CREATED,
                data: {
                  requestData: {
                    body: {
                      data: unavailabilitiesArray,
                    },
                  },
                },
              },
            ],
          },
          allResources: unavailabilitiesArray.map((item) => item.user),
        }),
      );

      dispatch(fetchResourceAvailabilities());
    }
  };
};

export const addOperation = ({
  operation,
  allResources = [],
  runFlagging = true,
}: {
  operation: ICalendarOperationItem;
  allResources?: any[];
  runFlagging?: boolean;
}) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const operations = state.calendarUndoRedo.operations;
    const currentIndex = state.calendarUndoRedo.currentIndex;
    const currentUser = state.auth.currentUser;
    const membership = state.settings.settingsCompany.company.membership;
    const isFlaggingEnabled = state.flagging.flaggingEnabled;
    const isOverbookingEnabled = state.settings.settingValues.overbooking;
    const statsViewEnabled = state.settings.settingValues.statsViewEnabled;

    const newOperations = [...operations.slice(0, currentIndex), operation];

    const visiblePersonResourceIdsMap = state.calendar.visibleResources.reduce(
      (acc, item) => {
        if (item.person) {
          acc.set(item.id, true);
        }
        return acc;
      },
      new Map<string, boolean>(),
    );

    const resourceIds: any[] = [...new Set(allResources ?? [])];
    const personResourceIds: any[] = resourceIds.filter((id) =>
      visiblePersonResourceIdsMap.has(id),
    );

    // ** Check flagging
    if (
      checkCompanyPlanFeature(membership, 'flagging') &&
      role_permissions(currentUser, 'flaggingFeature') &&
      (isFlaggingEnabled || isOverbookingEnabled) &&
      runFlagging &&
      personResourceIds.length > 0
    ) {
      dispatch(
        fetchFlaggingData({
          ids: personResourceIds,
          updateIds: personResourceIds,
          showBroken: true,
        }),
      );
    }

    if (statsViewEnabled) {
      const startRange = state.calendar.calendar_start;
      const endRange = state.calendar.calendar_end;
      dispatch(
        fetchStatistics({
          start: startRange,
          end: endRange,
          bol1: true,
          bol2: true,
        }),
      );
    }

    // 1. Add operation
    dispatch(setOperations(newOperations));

    // 2. Set index
    dispatch(setOperationCurrentIndex(newOperations.length));
  };
};

async function validateEventUsers(allEvents: any, resources: any) {
  const errors: string[] = [];

  // Build a resourceId -> resource map for O(1) lookups
  const resourceMap = new Map<string, any>();
  for (const r of resources) {
    resourceMap.set(r.id, r);
  }

  // Optionally, build type->Set<id> maps for fast type checks
  const typeToIds = resources.reduce(
    (acc: Record<string, Set<string>>, r: any) => {
      if (!acc[r.type]) {
        acc[r.type] = new Set();
      }

      acc[r.type].add(r.id);
      return acc;
    },
    {} as Record<string, Set<string>>,
  );

  for (let i = 0; i < allEvents.length; i++) {
    const evt = allEvents[i];
    // If evt.users is array of objects with .value, extract ids
    const userIds: string[] = evt.users.map((u: any) => u.value);

    // 1) find the activity resource for this event
    // Use resourceMap for O(1) lookup
    const activity = resources.find(
      (r: any) => r.type === 'Activity' && userIds.includes(r.id),
    );
    if (!activity) {
      errors.push(`No activity resource found among the event's users`);
      continue;
    }

    // 2) if employee is required (empNotReq === false), ensure an Employee is present
    if (activity.empNotReq === false) {
      // Check if any userId is in Employee set
      const hasEmployee = userIds.some((id) => typeToIds.Employee?.has(id));
      if (!hasEmployee) {
        errors.push(
          `Activity “${activity.name}” requires at least one Employee, but none were selected`,
        );
      }
    }

    // 3) if a client is required
    if (activity.clientReq === true) {
      const hasClient = userIds.some((id) => typeToIds.Client?.has(id));
      if (!hasClient) {
        errors.push(
          `Activity “${activity.name}” requires at least one Client, but none were selected`,
        );
      }
    }

    // 4) if a location is required
    if (activity.locReq === true) {
      const hasLocation = userIds.some((id) => typeToIds.Location?.has(id));
      if (!hasLocation) {
        errors.push(
          `Activity “${activity.name}” requires a Location, but none were selected`,
        );
      }
    }

    if ((i + 1) % 200 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return errors;
}

let reqCount = 0;
export const operateSelectedEvents = ({
  operations: { toBeAdded, toBeUpdated, toBeDeleted, toBeUndeleted },
  formatted = false,
  availabilityObj = null,
  runFlagging = true,
  revertFunction = null,
  copyActive = false,
  skipValidation = false,
}: {
  operations: {
    toBeAdded?: {
      items: any[];
    } | null;
    toBeUpdated?: {
      items: any[];
      updateLevel: TApiEventUpdateLevel;
      updateType: TApiEventUpdateType;
      cancellationUpdate?: boolean;
      sandboxUpdate?: boolean;
    } | null;
    toBeDeleted?: {
      items: any[];
      deleteType: TApiEventDeleteType;
    } | null;
    toBeUndeleted?: {
      items: any[];
    } | null;
  };
  formatted?: boolean;
  availabilityObj?: any;
  runFlagging?: boolean;
  revertFunction?: any;
  copyActive?: boolean;
  skipValidation?: boolean;
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const activityResources = getState().calendar.activityResources;
    const locationResources = getState().calendar.locationResources;
    const blockResources = getState().calendar.blockResources;
    const lazyResources = getState().calendar.lazyResources;

    //Validate Events
    if (
      ((toBeAdded && toBeAdded.items.length > 0) ||
        (toBeUpdated && toBeUpdated.items.length > 0)) &&
      !skipValidation
    ) {
      const allEvents = [
        ...(toBeAdded?.items || []),
        ...(toBeUpdated?.items?.map((pair: any) => pair.newEvent) || []),
      ];

      const errors = await validateEventUsers(allEvents, [
        ...activityResources,
        ...locationResources,
        ...blockResources,
        ...lazyResources,
      ]);
      if (errors.length) {
        errors.forEach((e: any) => toast.error(e));
        return {
          success: false,
        };
      }
    }

    reqCount = reqCount + 1;

    try {
      const executedOperations: ICalendarExecutedOperationItem[] = [];
      let allResources: any[] = [];

      let _createdResult = {
        calendarEvents: [] as any[],
        operationData: {
          requestData: {
            body: {},
          },
          responseData: {
            created: [] as any[],
            updated: [] as any[],
            deleted: [] as any[],
          } as Record<string, any>,
        } as TCalendarMultiEventCreateOperationData,
      };
      let _updatedResult = {
        calendarEvents: [] as any[],
        toBeExcludedIds: [] as any[],
        operationData: {
          requestData: {
            body: {},
            params: {},
          },
          responseData: {
            created: [] as any[],
            updated: [] as any[],
            deleted: [] as any[],
          },
        } as TCalendarMultiEventUpdateOperationData,
      };
      let _deletedResult = {
        calendarEvents: [] as any[],
        toBeExcludedIds: [] as any[],
        operationData: {
          requestData: {
            body: {},
            params: {},
          },
          responseData: {
            created: [] as any[],
            updated: [] as any[],
            deleted: [] as any[],
            isolated: [] as any[],
          },
        } as TCalendarMultiEventDeleteOperationData,
      };
      let _undeletedResult = {
        calendarEvents: [] as any[],
        operationData: {
          requestData: {
            body: {},
          },
          responseData: {
            undeleted: [] as any[],
          },
        } as TCalendarMultiEventUndeleteOperationData,
      };

      // Add
      if (
        toBeAdded &&
        Array.isArray(toBeAdded.items) &&
        toBeAdded.items.length
      ) {
        allResources = [
          ...allResources,
          ...toBeAdded.items.flatMap((t) =>
            t.users.flatMap((v: any) => (typeof v === 'object' ? v.value : v)),
          ),
        ];
        _createdResult = await dispatch(
          addSelectedEvents({
            events: toBeAdded.items,
            formatted,
          }),
        );
      }
      // Update
      if (
        toBeUpdated &&
        Array.isArray(toBeUpdated?.items) &&
        toBeUpdated.items.length > 0
      ) {
        allResources = [
          ...allResources,
          ...toBeUpdated.items.flatMap((t) =>
            t.newEvent.users.flatMap((v: any) => v.value),
          ),
          ...toBeUpdated.items.flatMap((t) =>
            t.oldEvent.users.flatMap((v: any) => v.value),
          ),
        ];

        const result = await dispatch(
          updateSelectedEvents({
            events: toBeUpdated.items,
            formatted,
            updateLevel: toBeUpdated.updateLevel,
            updateType: toBeUpdated.updateType,
            cancellationUpdate: toBeUpdated?.cancellationUpdate || false,
            sandboxUpdate: toBeUpdated?.sandboxUpdate || false,
          }),
        );
        _updatedResult = {
          calendarEvents: result.calendarEvents,
          operationData: result.operationData,
          toBeExcludedIds: result.toBeExcludedIds,
        };

        if (result.calendarEventsToBeRemoved?.length) {
          _deletedResult.calendarEvents = [
            ..._deletedResult.calendarEvents,
            ...result.calendarEventsToBeRemoved,
          ];
        }
      }

      // Delete
      if (
        toBeDeleted &&
        Array.isArray(toBeDeleted.items) &&
        toBeDeleted.items.length > 0
      ) {
        allResources = [
          ...allResources,
          // eslint-disable-next-line array-callback-return
          ...toBeDeleted.items.flatMap((t) => {
            if (t.users) {
              return t.users.flatMap((v: any) => v.value);
            } else if (t.resourceIds) {
              return t.resourceIds;
            }
          }),
        ];
        const result = await dispatch(
          removeSelectedEvents({
            events: toBeDeleted.items,
            deleteType: toBeDeleted.deleteType,
            formatted,
          }),
        );
        _deletedResult = {
          calendarEvents: [
            ..._deletedResult.calendarEvents,
            ...result.calendarEvents,
          ],
          operationData: result.operationData,
          toBeExcludedIds: result.toBeExcludedIds,
        };

        if (result.calendarEventsToBeUpdated?.length) {
          _updatedResult.calendarEvents = [
            ..._updatedResult.calendarEvents,
            ...result.calendarEventsToBeUpdated,
          ];
        }
      }

      // Undelete
      if (
        toBeUndeleted &&
        Array.isArray(toBeUndeleted.items) &&
        toBeUndeleted.items.length > 0
      ) {
        allResources = [
          ...allResources,
          // eslint-disable-next-line array-callback-return
          ...toBeUndeleted.items.flatMap((t) => {
            if (t.users) {
              return t.users.flatMap((v: any) => v.value);
            } else if (t.resourceIds) {
              return t.resourceIds;
            }
          }),
        ];
        _undeletedResult = await dispatch(
          undeleteSelectedEvents({
            events: toBeUndeleted.items,
          }),
        );
      }

      const expandedResources = getState().calendar.expandedResources;
      if (expandedResources.length > 0) {
        const currentBrancheId =
          getState().calendar.current_branches?.[0]?.value;
        dispatch(
          retriggerSolutionGeneratorJobs({
            branchId: currentBrancheId,
            resourceIds: allResources.map((id) => `${id}`.slice(0, 36)),
          }),
        );
      }

      if (availabilityObj) {
        await axios.post(`/availabilities`, availabilityObj);
        executedOperations.push({
          route: '/availabilities',
          type: ECalendarOperationEnums.CREATED,
          data: {
            requestData: {
              body: availabilityObj,
            },
          },
        });
      }

      if (_createdResult?.operationData?.requestData?.body?.arr?.length) {
        executedOperations.push({
          route: '/events/create/multiple',
          type: ECalendarOperationEnums.EVENTS_MULTI_CREATED,
          data: _createdResult.operationData,
        });
      }
      if (_updatedResult?.operationData?.requestData?.body?.arr?.length) {
        executedOperations.push({
          route: '/events/update/multiple',
          type: ECalendarOperationEnums.EVENTS_MULTI_UPDATED,
          data: _updatedResult.operationData,
        });
      }
      if (_deletedResult?.operationData?.requestData?.body?.arr?.length) {
        executedOperations.push({
          route: '/events/remove/multiple',
          type: ECalendarOperationEnums.EVENTS_MULTI_DELETED,
          data: _deletedResult.operationData,
        });
      }
      if (_undeletedResult?.operationData?.requestData?.body?.arr?.length) {
        executedOperations.push({
          route: '/events/undelete/multiple',
          type: ECalendarOperationEnums.EVENTS_MULTI_UNDELETED,
          data: _undeletedResult.operationData,
        });
      }

      if (availabilityObj) {
        dispatch(fetchResourceAvailabilities());
      }

      // ** ADD-OPERATON
      const call = () => {
        dispatch(
          updateCalendarEvents({
            toBeAdded: _createdResult.calendarEvents,
            toBeUpdated: _updatedResult.calendarEvents,
            toBeDeleted: _deletedResult.calendarEvents,
            toBeExcludedIds: [
              ..._updatedResult.toBeExcludedIds,
              ..._deletedResult.toBeExcludedIds,
            ],
            toBeUndeleted: _undeletedResult.calendarEvents,
          }),
        );
      };
      const callPostOperations = () => {
        if (executedOperations.length > 0) {
          dispatch(
            addOperation({
              operation: {
                name: 'Operate Selected Events',
                executedOperations,
              },
              allResources,
              runFlagging,
            }),
          );
        }
      };
      const events_resizing_currently =
        getState().calendar.events_resizing_currently;

      if (events_resizing_currently.length) {
        operationQueue.freeze();
      } else {
        operationQueue.unfreeze();
      }
      operationQueue.addOperation(call);
      if (reqCount === 1) {
        operationQueue.addOperation(callPostOperations);
      }

      return {
        success: true,
      };
    } catch (error: any) {
      let postfix = '';
      if (!copyActive && revertFunction) {
        revertFunction();
        postfix = 'Your update is reverted back!';
      }

      if (copyActive) {
        dispatch(
          setEvents({
            events: getState().calendar.events,
            time: getState().calendar.eventStartTime,
          }),
        );

        postfix = 'Your update is reverted back!';
      }

      let errorMsg = 'Something went wrong. Try again!';

      const msg = error?.response?.data;
      if (msg) {
        errorMsg = msg;
      }

      toast.error(`${errorMsg} ${postfix}`);

      // If status forbidden (scheduler is locked)
      const status = error?.response?.status;
      if (status === 403) {
        dispatch(getCompanySchedulerLockedRecursively());
        return {
          success: false,
        };
      }

      dispatch(
        setRetryPopup({
          modal: true,
          data: {
            toBeAdded,
            toBeUpdated,
            toBeDeleted,
            toBeUndeleted,
          },
        }),
      );
      return {
        success: false,
      };
    } finally {
      reqCount = reqCount - 1;
    }
  };
};

export const addSelectedEvents = ({
  events,
  formatted,
}: {
  events: any[];
  formatted: any;
}) => {
  return async (_: AppDispatch, getState: () => RootState) => {
    let pushNotification = null;
    const uniqueEvents = [];
    const seenEventKeys = new Set();

    for (const event of events) {
      const eventId = event.id;
      const startRecur = event.startRecur;
      // Create a unique key using both 'id' and 'startRecur'
      const eventKey = `${eventId}-${startRecur}`;

      // Check if the id has already been seen, this fixes edge case for duplication
      if (!seenEventKeys.has(eventKey)) {
        uniqueEvents.push(event);
        seenEventKeys.add(eventKey);
      }
    }

    const formattedEvents = uniqueEvents.map((event) => {
      if (event?.pushNotification?.send) {
        pushNotification = event.pushNotification;
      }

      const generatedEventGroupId = uuidv4();
      if (formatted) {
        const generatedId = uuidv4();
        return {
          data: {
            ...event,
            id: generatedId,
            eventGroupId: generatedEventGroupId,
          },
          id: generatedId,
        };
      }
      let obj = handleEvent({
        event,
        activityResources: getState().calendar.activityResources,
        locationResources: getState().calendar.locationResources,
        fallbackTimezone: getState().settings?.settingValues?.timezone as any,
        optType: 'add',
      });

      obj.data.eventGroupId = generatedEventGroupId;
      return obj;
    });
    const startRange = getState().calendar.calendar_start;
    const endRange = getState().calendar.calendar_end;
    const currentBranches = getState().calendar.current_branches;
    const selectedBranches = currentBranches.map((e: any) => e.value).join('|');
    // timezones
    const timeZone =
      getState().settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const datetimeInTimezone = moment().tz(timeZone);
    const offsetMinutes = datetimeInTimezone.utcOffset();

    const borderColorRole = getState().settings.settingValues?.borderColorRole;
    const backgroundColorRole =
      getState().settings.settingValues?.backgroundColorRole;

    // Partially creating
    let calendarEvents: any[] = [];
    const responseData = {
      created: [] as any[],
      updated: [] as any[],
      deleted: [] as any[],
    };
    const batchSize = 100;
    for (let i = 0; i < formattedEvents.length; i += batchSize) {
      const formattedEventsBatch = formattedEvents.slice(i, i + batchSize);
      const res = await axios.post(
        `/events/create/multiple`,
        {
          arr: formattedEventsBatch,
          pushNotification,
          borderColorRole,
          backgroundColorRole,
          offset: offsetMinutes,
          timezone: timeZone,
        },
        {
          params: {
            start: startRange,
            end: endRange,
            branches: selectedBranches,
          },
        },
      );
      calendarEvents = [...calendarEvents, ...(res.data?.calendar || [])];
      responseData.created = [
        ...responseData.created,
        ...(res.data?.created || []),
      ];
      responseData.updated = [
        ...responseData.updated,
        ...(res.data?.updated || []),
      ];
      responseData.deleted = [
        ...responseData.deleted,
        ...(res.data?.deleted || []),
      ];
      await new Promise((resolve) => setTimeout(resolve, 300)); // wait 300msec
    }

    return {
      calendarEvents,
      operationData: {
        requestData: {
          body: {
            arr: formattedEvents,
            pushNotification,
            borderColorRole,
            backgroundColorRole,
            offset: offsetMinutes,
            timezone: timeZone,
          },
        },
        responseData,
      },
    };
  };
};

export const updateSelectedEvents = ({
  events,
  formatted,
  updateLevel,
  updateType,
  cancellationUpdate = false,
  sandboxUpdate = false,
}: {
  events: any;
  formatted: any;
  updateLevel: TApiEventUpdateLevel;
  updateType: TApiEventUpdateType;
  cancellationUpdate?: boolean;
  sandboxUpdate?: boolean;
}) => {
  return async (_: AppDispatch, getState: () => RootState) => {
    let pushNotification = null;
    const uniqueEvents = [];
    const seenIds = new Set();

    for (const event of events) {
      const eventId = event.oldEvent.id;

      // Check if the id has already been seen, this fixes edge case for duplication
      if (!seenIds.has(eventId)) {
        uniqueEvents.push(event);
        seenIds.add(eventId);
      }
    }
    const formattedEvents = uniqueEvents.map((event) => {
      // Generating new ids for the update action, to make possible replicate
      // undo/redo action back and forth : newEvents = backend(events, ...ids)
      const isolationGroupId = uuidv4();
      const leftEventId = uuidv4();
      const rightEventId = uuidv4();
      const mainEventId = uuidv4();
      if (formatted) {
        const id = event.newEvent.id;
        return {
          newData: {
            id,
            // New ids for update
            isolationGroupId,
            leftEventId,
            rightEventId,
            mainEventId,
            //
            data: { ...event.newEvent, id },
          },
          oldData: {
            id,
            data: { ...event.oldEvent, id },
          },
        };
      }
      const id = event.newEvent.id;
      if (event.newEvent?.pushNotification?.send) {
        pushNotification = event.newEvent.pushNotification;
      }
      let newEvent = handleEvent({
        event: event.newEvent,
        oldEvent: event.oldEvent,
        activityResources: getState().calendar.activityResources,
        locationResources: getState().calendar.locationResources,
        fallbackTimezone: getState().settings?.settingValues?.timezone as any,
      });
      let oldEvent = handleEvent({
        event: event.oldEvent,
        activityResources: getState().calendar.activityResources,
        locationResources: getState().calendar.locationResources,
        fallbackTimezone: getState().settings?.settingValues?.timezone as any,
      });
      newEvent.data.id = id;
      oldEvent.data.id = id;
      return {
        newData: {
          ...newEvent,
          id,
          // New ids for update
          isolationGroupId,
          leftEventId,
          rightEventId,
          mainEventId,
          //
        },
        oldData: { ...oldEvent, id },
      };
    });

    const startRange = getState().calendar.calendar_start;
    const endRange = getState().calendar.calendar_end;
    const toBeUpdated = formattedEvents.map((ev) => ev.newData);
    const current_branches = getState().calendar.current_branches;
    const selectedBranches = current_branches
      .map((e: any) => e.value)
      .join('|');
    // timezones
    const timeZone =
      getState().settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const datetimeInTimezone = moment().tz(timeZone);
    const offsetMinutes = datetimeInTimezone.utcOffset();

    const backgroundColorRole =
      getState().settings.settingValues?.backgroundColorRole;
    const borderColorRole = getState().settings.settingValues?.borderColorRole;

    const res = await axios.put(
      `/events/update/multiple`,
      {
        arr: toBeUpdated,
        pushNotification,
        backgroundColorRole,
        borderColorRole,
        offset: offsetMinutes,
        timezone: timeZone,
      },
      {
        params: {
          start: startRange,
          end: endRange,
          branches: selectedBranches,
          update_level: updateLevel,
          update_type: updateType,
          cancellation_update: cancellationUpdate,
          sandbox_update: sandboxUpdate,
        },
      },
    );

    const includeDeleted = getState().calendar.includeDeleted;
    const _calendarEvents: any[] = res.data?.calendar || [];
    const calendarEventsToBeRemoved: any[] = [];
    toBeUpdated.forEach((ev) => {
      const index = _calendarEvents.findIndex((val: any) => val.id === ev.id);
      if (index === -1) {
        calendarEventsToBeRemoved.push(ev.id);
      }
    });
    const calendarEvents = _calendarEvents.reduce((acc: any[], ev: any) => {
      if ((includeDeleted && ev.eventGroupId) || !ev.deletedAt) {
        acc.push(ev);
      } else {
        calendarEventsToBeRemoved.push(ev.id);
      }
      return acc;
    }, [] as any[]);

    const operationData: TCalendarMultiEventUpdateOperationData = {
      requestData: {
        body: {
          arr: toBeUpdated,
          backgroundColorRole,
          borderColorRole,
          offset: offsetMinutes,
          timezone: timeZone,
        },
        params: {
          update_level: updateLevel,
          update_type: updateType,
          cancellation_update: cancellationUpdate,
        },
      },
      responseData: {
        created: res.data?.created || [],
        updated: res.data?.updated || [],
        deleted: res.data?.deleted || [],
      },
    };

    return {
      calendarEvents,
      calendarEventsToBeRemoved,
      operationData,
      // we need to exclude all updated events from list, because
      // they should be already included in the toBeUpdated list
      // if it's not, BE issue
      toBeExcludedIds: (res.data?.updated || []).map((ev: any) => ev.id),
    };
  };
};

export const removeSelectedEvents = ({
  events,
  formatted,
  deleteType,
}: {
  events: any[];
  formatted: any;
  deleteType: TApiEventDeleteType;
}) => {
  return async (_: AppDispatch, getState: () => RootState) => {
    let pushNotification = null;
    const formattedEvents = events.map((ev) => {
      if (ev?.pushNotification?.send) {
        pushNotification = ev.pushNotification;
      }

      // Generating new ids for the remove action, to make possible replicate
      // undo/redo action back and forth : newEvents = backend(events, ...ids)
      const isolationGroupId = uuidv4();
      const leftEventId = uuidv4();
      const rightEventId = uuidv4();
      const mainEventId = uuidv4();
      if (formatted) {
        return {
          id: ev.id,
          //
          isolationGroupId,
          leftEventId,
          rightEventId,
          mainEventId,
          //
          data: {
            ...ev,
            id: ev.id,
          },
        };
      }
      let eventData = handleEvent({
        event: ev,
        activityResources: getState().calendar.activityResources,
        locationResources: getState().calendar.locationResources,
        fallbackTimezone: getState().settings?.settingValues?.timezone as any,
      });
      const formData = {
        data: {
          ...eventData.data,
          id: ev.id,
        },
        id: ev.id,
        //
        isolationGroupId,
        leftEventId,
        rightEventId,
        mainEventId,
        //
      };

      return formData;
    });
    const startRange = moment(getState().calendar.calendar_start)
      .subtract(1, 'days')
      .format();
    const endRange = moment(getState().calendar.calendar_end)
      .add(1, 'days')
      .format();

    const current_branches = getState().calendar.current_branches;
    const selectedBranches = current_branches

      .map((e: any) => e.value)
      .join('|');
    // timezones
    const timezone =
      getState().settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const datetimeInTimezone = moment().tz(timezone);
    const offsetMinutes = datetimeInTimezone.utcOffset();
    const backgroundColorRole =
      getState().settings.settingValues?.backgroundColorRole;
    const borderColorRole = getState().settings.settingValues?.borderColorRole;

    const res = await axios.post(
      '/events/remove/multiple',
      {
        arr: formattedEvents,
        pushNotification,
        backgroundColorRole,
        borderColorRole,
        offset: offsetMinutes,
        timezone,
      },
      {
        params: {
          start: startRange,
          end: endRange,
          branches: selectedBranches,
          delete_type: deleteType,
        },
      },
    );

    const includeDeleted = getState().calendar.includeDeleted;
    const _calendarEvents: any[] = res.data?.calendar || [];
    const calendarEventsToBeUpdated: any[] = [];
    const calendarEvents = _calendarEvents.reduce((acc: any[], ev: any) => {
      if ((!includeDeleted || !ev.eventGroupId) && ev.deletedAt) {
        acc.push(ev.id);
      } else {
        calendarEventsToBeUpdated.push(ev);
      }
      return acc;
    }, [] as any[]);

    const operationData: TCalendarMultiEventDeleteOperationData = {
      requestData: {
        body: {
          arr: formattedEvents,
          backgroundColorRole,
          borderColorRole,
          offset: offsetMinutes,
          timezone,
        },
        params: {
          delete_type: deleteType,
        },
      },
      responseData: {
        created: res.data?.created || [],
        updated: res.data?.updated || [],
        deleted: res.data?.deleted || [],
        isolated: res.data?.isolated || [],
      },
    };
    return {
      calendarEvents,
      calendarEventsToBeUpdated,
      operationData,
      // we need to exclude all updated events from list, because
      // they should be already included in the toBeUpdated list
      // if it's not, BE issue
      toBeExcludedIds: (res.data?.updated || []).map((ev: any) => ev.id),
    };
  };
};

export const undeleteSelectedEvents = ({ events }: { events: any[] }) => {
  return async (_: AppDispatch, getState: () => RootState) => {
    let pushNotification = null;
    const startRange = moment(getState().calendar.calendar_start)
      .subtract(1, 'days')
      .format();
    const endRange = moment(getState().calendar.calendar_end)
      .add(1, 'days')
      .format();

    const current_branches = getState().calendar.current_branches;
    const selectedBranches = current_branches

      .map((e: any) => e.value)
      .join('|');
    // timezones
    const timezone =
      getState().settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const datetimeInTimezone = moment().tz(timezone);
    const offsetMinutes = datetimeInTimezone.utcOffset();
    const backgroundColorRole =
      getState().settings.settingValues?.backgroundColorRole;
    const borderColorRole = getState().settings.settingValues?.borderColorRole;

    const res = await axios.post(
      '/events/undelete/multiple',
      {
        arr: events,
        pushNotification,
        backgroundColorRole,
        borderColorRole,
        offset: offsetMinutes,
        timezone,
      },
      {
        params: {
          start: startRange,
          end: endRange,
          branches: selectedBranches,
        },
      },
    );

    const operationData: TCalendarMultiEventUndeleteOperationData = {
      requestData: {
        body: {
          arr: events,
          backgroundColorRole,
          borderColorRole,
          offset: offsetMinutes,
          timezone,
        },
      },
      responseData: {
        undeleted: res.data?.undeleted || [],
      },
    };
    return {
      calendarEvents: res.data?.calendar || [],
      operationData,
    };
  };
};

let temporaryEventsStorage: any[] = [];
export const updateCalendarEvents = ({
  toBeAdded,
  toBeUpdated,
  toBeDeleted,
  toBeExcludedIds,
  toBeUndeleted,
}: {
  toBeAdded: any[];
  toBeUpdated: any[];
  toBeDeleted: any[];
  toBeExcludedIds: any[];
  toBeUndeleted: any[];
}) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const events = state.calendar.events;
    const includeDeleted = state.calendar.includeDeleted;
    const settingsHighlightRecentlyChanged =
      state.settings.settingValues.highlightRecentlyChanged;

    let updatedEvents =
      temporaryEventsStorage.length > 0 ? temporaryEventsStorage : [...events];

    // We need to exclude all updated events from list, because
    // they should be already included in the toBeUpdated list
    if (toBeExcludedIds?.length) {
      updatedEvents = updatedEvents.filter(
        (ev) => !toBeExcludedIds.includes(ev.id),
      );
    }

    if (toBeAdded?.length) {
      updatedEvents = [...updatedEvents, ...toBeAdded];
    }
    if (toBeUpdated?.length) {
      const toBeUpdatedIds = toBeUpdated.map((ev) => ev.id);
      updatedEvents = updatedEvents.filter(
        (ev) => !toBeUpdatedIds.includes(ev.id),
      );

      updatedEvents = [...updatedEvents, ...toBeUpdated];
    }
    if (toBeUndeleted?.length) {
      const toBeUndeletedIds = toBeUndeleted.map((ev) => ev.id);
      updatedEvents = updatedEvents.filter(
        (ev) => !toBeUndeletedIds.includes(ev.id),
      );

      updatedEvents = [...updatedEvents, ...toBeUndeleted];
    }
    if (toBeDeleted?.length) {
      updatedEvents = updatedEvents.filter((ev) => {
        const isEventToBeDeleted = toBeDeleted.includes(ev.id);

        // If event is not in the deletion list, keep it
        if (!isEventToBeDeleted) {
          return true;
        }

        // Event is in deletion list - check if we should show deleted events
        const hasDeletedAt = Boolean(ev.deletedAt);
        const shouldShowDeletedEvents =
          includeDeleted || settingsHighlightRecentlyChanged;

        // Keep deleted events only if we should show them and they have deletedAt
        return hasDeletedAt && shouldShowDeletedEvents;
      });
    }

    // const updatedEventIds = updatedEvents.map(ev => ev.id);
    // If the same event is being updated
    if (reqCount <= 1) {
      const time = moment().add(-1, 'minutes').toDate().toUTCString();

      const _temporaryEventsStorage = temporaryEventsStorage.filter((ev) => {
        const eventIndex = updatedEvents.findIndex((val) => val.id === ev.id);
        return eventIndex === -1;
      });
      const _updatedEvents = [...updatedEvents, ..._temporaryEventsStorage];
      const sortedEvents = sortBy(_updatedEvents, 'start_real');
      const uniqueEvents = uniqBy(sortedEvents, 'id');

      dispatch(
        setEvents({
          events: uniqueEvents,
          time: time,
        }),
      );

      temporaryEventsStorage = [];
    } else {
      const _temporaryEventsStorage = temporaryEventsStorage.filter((ev) => {
        const eventIndex = updatedEvents.findIndex((val) => val.id === ev.id);
        return eventIndex === -1;
      });
      temporaryEventsStorage = [..._temporaryEventsStorage, ...updatedEvents];
    }
  };
};

export const makeEventsSandboxed = ({
  selectedEventIds,
  sandboxMode = true,
}: {
  selectedEventIds: any[];
  sandboxMode?: boolean;
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    await axios.put('/events/update/sandbox', {
      data: {
        eventIds: selectedEventIds,
        sandboxMode,
      },
    });

    dispatch(fetchEvents());
    if (getState().settings.settingValues.statsViewEnabled) {
      dispatch(
        fetchStatistics({
          start: getState().calendar.calendar_start,
          end: getState().calendar.calendar_end,
        }),
      );
    }
  };
};

export const handleSetDisplayedUser = ({
  user,
  doFetchEvents = false,
}: {
  user: any;
  doFetchEvents?: boolean;
}) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setDisplayedUser(user));
    if (doFetchEvents) {
      dispatch(
        fetchEvents({
          monthViewUser: user,
          bol: false,
        }),
      );

      const statsViewEnabled =
        getState().settings.settingValues.statsViewEnabled;
      const start = getState().calendar.calendar_start;
      const end = getState().calendar.calendar_end;
      if (statsViewEnabled) {
        dispatch(
          fetchStatistics({
            start,
            end,
          }),
        );
      }
    }
  };
};

export const distanceCalculator = (params: any) => {
  return async (_: AppDispatch, __: () => RootState) => {
    try {
      const response = await axios.get(`/distancematrix/calculator`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again!');
      }
    }
  };
};

export const sendMultipleEmails = (data: Record<string, any>) => {
  return async (_: AppDispatch, getState: () => RootState) => {
    const current_branches = getState().calendar.current_branches;
    const calendar_start = getState().calendar.calendar_start;
    const timeZone =
      getState().settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    const startOfWeek = moment(calendar_start).startOf('week');
    const startRange = startOfWeek.format();
    const endRange = startOfWeek.add(1, 'week').format();

    const formattedStartRange = generateTimeRangeParameter(
      startRange,
      timeZone,
    );
    const formattedEndRange = generateTimeRangeParameter(endRange, timeZone);
    try {
      const req = {
        ...data,
        branchId: current_branches[0]?.value,
        start: formattedStartRange,
        end: formattedEndRange,
      };
      await axios.post('/scheduler/send-emails', req);
      return true;
    } catch (error: any) {
      Errors.showMessage(error);
      return false;
    }
  };
};

export const handlePushNotificationReset = (time: number = 0) => {
  return (dispatch: AppDispatch, _: () => RootState) => {
    setTimeout(() => {
      dispatch(
        setPushNotification({
          send: false,
          message: '',
          to: [],
        }),
      );
    }, time);
  };
};

export const handlePushNotificationValues = ({
  key,
  value,
}: {
  key: string;
  value: any;
}) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(
      setPushNotification({
        ...getState().calendar.pushNotification,
        [key]: value,
      }),
    );
  };
};

export const handleResizingEvents = ({
  event,
  add = true,
}: {
  event: any;
  add?: boolean;
}) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    let temp = [];
    const id = event.id;
    const eventsResizingCurrently =
      getState().calendar.events_resizing_currently;

    if (add) {
      temp = [...eventsResizingCurrently, event?.id];
    } else {
      temp = eventsResizingCurrently.filter((item) => item !== id);
    }

    dispatch(setEventResizingCurrently(temp));
  };
};

export const fetchEventGroups = (ids: string[]) => {
  return async (_: AppDispatch, __: () => RootState) => {
    try {
      const response = await axios.post<{
        result: IApiCalendarEventGroupItem[];
      }>('/events/group/ids', {
        ids: ids.join('|'),
      });
      return response.data?.result || [];
    } catch (error: any) {
      console.log('error', error);
      const errMsg = error?.response?.data;
      if (errMsg) {
        toast.error(errMsg);
      }
      return Promise.reject(error);
    }
  };
};
