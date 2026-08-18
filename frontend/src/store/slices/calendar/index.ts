import moment from 'moment';
import {
  createAction,
  createSlice,
  prepareAutoBatched,
} from '@reduxjs/toolkit';
import type { Action, PayloadAction } from '@reduxjs/toolkit';
import { UsersFormActionTypes } from 'types/redux/users/usersForm';
import { UsersListActionTypes } from 'types/redux/users/usersList';
import type {
  TApiEventUpdateType,
  TApiEventDeleteType,
  TApiEventUpdateLevel,
} from 'types/api';

// ** Initial State
const initialState = {
  calendar_start: moment().startOf('day').toDate(),
  calendar_end: moment().startOf('day').add(1, 'days').toDate(),
  eventStartTime: new Date('1900-01-01') as Date | string,
  events: [] as any[],
  events_resizing_currently: [] as any[],
  resourceSortsSolGen: [] as any[],
  lazyResources: [] as any[],
  lazyResourcesFetchStatus: {} as Record<
    string,
    'loading' | 'success' | 'error'
  >,
  lazyResourcesFetchCount: {} as Record<string, number>,
  activityResources: [] as any[],
  locationResources: [] as any[],
  blockResources: [] as any[],
  visibleResources: [] as {
    id: string;
    person: boolean;
  }[],
  visibleResourcesCount: 0,
  requestedVisibleResources: [] as {
    id: string;
    person: boolean;
  }[],
  pushNotification: {
    send: false as boolean,
    message: '' as string,
    to: [] as string[],
  },
  availabilities: [] as any[],
  availabilitiesFetchedResourceIds: {} as Record<string, boolean>,
  drag_events: [] as any[],
  selectedEvent: {} as any,
  connected_events: {},
  reasons_canceled: [] as any[],
  socket_pending: false,
  cancellations: [] as any[],
  time_constraints: [] as any[],
  current_branches: ['lk'] as any[],
  expandedResources: [] as {
    id: string;
    type: string;
  }[],
  roles: [] as any[],
  subgroups: {} as Record<string, any>,
  teams_hierarchy: {} as Record<string, any>,
  totalTypes: ['lk'] as any[],
  branches: ['lk'] as string[],
  frontend_roles_hierarchy: {} as Record<string, any>,
  statistics: {
    capacity: {
      users: {} as Record<string, any>,
      roles: {} as Record<string, any>,
      total: {} as Record<string, any>,
      type: {} as Record<string, any>,
    },
    individual: {
      users: {} as Record<string, any>,
      roles: {} as Record<string, any>,
      total: {} as Record<string, any>,
      type: {} as Record<string, any>,
    },
  },
  selectedCalendars: {
    activity: [] as any[],
    location: [] as any[],
    tags: [] as any[],
  },
  modalOverbookingData: [] as any[],
  modalOverbooking: false,
  eventsLoading: false,
  overbookingLoading: false,
  oncallCheckbox: false,
  updatingEventsLoading: false,
  isCurrentBranchLevelHighest: false,
  isCurrentBranchLastTwoLowest: false,
  sandboxMode: false,
  includeDeleted: false,
  active: true,
  activeFilteredEvent: [] as any[],

  displayedUser: null as Record<string, any> | null,
  pasteEventsLoading: false,
  deleteEventsLoading: false,
  undeletingEventsLoading: false,
  retryPopup: false,
  retryData: null as any,
};

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setEvents: {
      reducer(
        state,
        action: PayloadAction<{
          events: any[];
          time: string | Date;
        }>,
      ) {
        state.socket_pending = false;
        state.events = action.payload.events;
        state.eventStartTime = action.payload.time;
      },
      prepare: prepareAutoBatched<{
        events: any[];
        time: string | Date;
      }>(),
    },
    setAvailabilities(state, action: PayloadAction<any[]>) {
      state.availabilities = action.payload;
    },
    setAvailabilitiesFetchedResourceIds(
      state,
      action: PayloadAction<Record<string, boolean>>,
    ) {
      state.availabilitiesFetchedResourceIds = {
        ...state.availabilitiesFetchedResourceIds,
        ...action.payload,
      };
    },
    setBranches(
      state,
      action: PayloadAction<{
        branches: any[];
        branchNow: any[];
      }>,
    ) {
      state.branches = action.payload.branches;
      if (state.current_branches[0] === 'lk') {
        state.current_branches = action.payload.branchNow;
      }
    },
    setCurrentBranches(state, action: PayloadAction<any[]>) {
      state.current_branches = action.payload;
    },
    setStatistics(
      state,
      action: PayloadAction<{
        statistics: {
          capacity: any;
          individual: any;
        };
        bol1: boolean;
        bol2: boolean;
      }>,
    ) {
      if (action.payload.bol1) {
        state.statistics.capacity = action.payload.statistics.capacity;
      }
      if (action.payload.bol2) {
        state.statistics.individual = action.payload.statistics.individual;
      }
    },
    setExpandedResourses(state, action: PayloadAction<any[]>) {
      state.expandedResources = action.payload;
    },
    setTotalTypes(state, action: PayloadAction<any[]>) {
      state.totalTypes = action.payload;
    },
    setReasonsCanceled(state, action: PayloadAction<any[]>) {
      state.reasons_canceled = action.payload;
    },
    setCancellations(state, action: PayloadAction<any[]>) {
      state.reasons_canceled = action.payload;
    },
    setSubgroups(state, action: PayloadAction<any>) {
      state.subgroups = action.payload;
    },
    setTeamsHierarchy(state, action: PayloadAction<any>) {
      state.teams_hierarchy = action.payload;
    },
    setRoles(state, action: PayloadAction<any[]>) {
      state.roles = action.payload;
    },
    setFrontendRolesHierarchy(
      state,
      action: PayloadAction<Record<string, any>>,
    ) {
      state.frontend_roles_hierarchy = action.payload;
    },
    setSocketPending: {
      reducer(state, action: PayloadAction<boolean>) {
        state.socket_pending = action.payload;
      },
      prepare: prepareAutoBatched<boolean>(),
    },
    setEventsLoading(state, action: PayloadAction<boolean>) {
      state.eventsLoading = action.payload;
    },
    setOverbookingLoading(state, action: PayloadAction<boolean>) {
      state.overbookingLoading = action.payload;
    },
    setUpdatingEventsLoading(state, action: PayloadAction<boolean>) {
      state.updatingEventsLoading = action.payload;
    },
    setSandboxMode(state, action: PayloadAction<boolean>) {
      state.sandboxMode = action.payload;
    },
    setIncludeDeleted(state, action: PayloadAction<boolean>) {
      state.includeDeleted = action.payload;
    },
    setActive(state, action: PayloadAction<boolean>) {
      state.active = action.payload;
    },
    setActiveFilteredEvent(state, action: PayloadAction<any[]>) {
      state.activeFilteredEvent = action.payload;
    },
    setIsCurrentBranchLevelHighest(state, action: PayloadAction<boolean>) {
      state.isCurrentBranchLevelHighest = action.payload;
    },
    setIsCurrentBranchLastTwoLowest(state, action: PayloadAction<boolean>) {
      state.isCurrentBranchLastTwoLowest = action.payload;
    },
    setRetryPopup(
      state,
      action: PayloadAction<{
        modal: boolean;
        data: {
          toBeAdded?: {
            items: any[];
          } | null;
          toBeUpdated?: {
            items: any[];
            updateLevel: TApiEventUpdateLevel;
            updateType: TApiEventUpdateType;
            cancellationUpdate?: boolean;
          } | null;
          toBeDeleted?: {
            items: any[];
            deleteType: TApiEventDeleteType;
          } | null;
          toBeUndeleted?: {
            items: any[];
          } | null;
        } | null;
      }>,
    ) {
      state.retryPopup = action.payload.modal;
      state.retryData = action.payload.data;
    },
    setDisplayedUser(state, action: PayloadAction<any>) {
      state.displayedUser = action.payload;
    },
    setModalOverbooking: {
      reducer(state, action: PayloadAction<string>) {
        const type = action.payload;
        let overbooking = true;
        if (type === 'flip') {
          overbooking = !state.modalOverbooking;
        } else {
          overbooking = !!type;
        }
        state.modalOverbooking = overbooking;
      },
      prepare(type = 'flip') {
        return {
          payload: type,
        };
      },
    },
    setOverbookingData: {
      reducer(state, action: PayloadAction<any[]>) {
        state.modalOverbookingData = action.payload;
      },
      prepare(data: any[] = []) {
        return {
          payload: data,
        };
      },
    },

    updateFilter(state, action: PayloadAction<any>) {
      const selectedCalendarsActivities = state.selectedCalendars.activity;
      const filterIndex = selectedCalendarsActivities.findIndex(
        (i) => i.id === action.payload.id,
      );
      if (filterIndex !== -1) {
        selectedCalendarsActivities.splice(filterIndex, 1);
      } else {
        selectedCalendarsActivities.push(action.payload);
      }
    },

    updateAllFilters(state, action: PayloadAction<boolean>) {
      const value = action.payload;
      let selected: any[] = [];
      if (value === false) {
        selected = state.activityResources.map((resource) => ({
          id: resource.id,
          label: resource.title,
        }));
      } else {
        selected = [];
      }
      state.selectedCalendars.activity = selected;
    },
    updateFilterLocations(state, action: PayloadAction<any>) {
      const updatedLocations = state.selectedCalendars.location;
      const filterIndex = updatedLocations.findIndex(
        (i) => i.id === action.payload.id,
      );
      if (filterIndex !== -1) {
        updatedLocations.splice(filterIndex, 1);
      } else {
        updatedLocations.push(action.payload);
      }
    },
    updateAllFiltersLocations(state, action: PayloadAction<boolean>) {
      const value = action.payload;
      let selected: any[] = [];
      if (value === false) {
        selected = state.locationResources.map((resource) => ({
          id: resource.id,
          label: resource.title,
        }));
      } else {
        selected = [];
      }
      state.selectedCalendars.location = selected;
    },
    setCalendarTime(state, action: PayloadAction<{ start: any; end: any }>) {
      state.calendar_start = action.payload.start;
      state.calendar_end = action.payload.end;
      state.expandedResources = [];
    },
    setSelectedEvent(state, action: PayloadAction<any>) {
      state.selectedEvent = action.payload;
    },
    resetEvents(state) {
      state.events = [];
      state.eventStartTime = new Date('1900-01-01');
    },
    resetAvailabilities(state) {
      state.availabilities = [];
      state.availabilitiesFetchedResourceIds = {};
    },
    resetExpandedResources(state) {
      state.expandedResources = [];
    },
    setPushNotification(
      state,
      action: PayloadAction<{
        send: boolean;
        message: string;
        to: any[];
      }>,
    ) {
      state.pushNotification = action.payload;
    },
    setEventResizingCurrently(state, action: PayloadAction<any[]>) {
      state.events_resizing_currently = action.payload;
    },
    resetStatistics(state) {
      state.statistics = {
        capacity: {
          users: {},
          roles: {},
          total: {},
          type: {},
        },
        individual: {
          users: {},
          roles: {},
          total: {},
          type: {},
        },
      };
    },
    setSortResourcesSolGen(state, action: PayloadAction<any[]>) {
      state.resourceSortsSolGen = action.payload;
    },
    setPasteEventsLoading(state, action: PayloadAction<boolean>) {
      state.pasteEventsLoading = action.payload;
    },
    setDeleteEventsLoading(state, action: PayloadAction<boolean>) {
      state.deleteEventsLoading = action.payload;
    },
    setUndeleteEventsLoading(state, action: PayloadAction<boolean>) {
      state.undeletingEventsLoading = action.payload;
    },
    setRequestedVisibleResources(
      state,
      action: PayloadAction<
        {
          id: string;
          person: boolean;
        }[]
      >,
    ) {
      state.requestedVisibleResources = action.payload;
    },
    appendVisibleResource: {
      reducer(
        state,
        action: PayloadAction<{
          id: string;
          person: boolean;
        }>,
      ) {
        state.visibleResources = [...state.visibleResources, action.payload];
        state.visibleResourcesCount++;
      },
      prepare: prepareAutoBatched<{
        id: string;
        person: boolean;
      }>(),
    },
    filterOutVisibleResource: {
      reducer(state, action: PayloadAction<string>) {
        state.visibleResources = state.visibleResources.filter(
          ({ id }) => id !== action.payload,
        );
        state.requestedVisibleResources =
          state.requestedVisibleResources.filter(
            ({ id }) => id !== action.payload,
          );
      },
      prepare: prepareAutoBatched<string>(),
    },
    setLazyResources(state, action: PayloadAction<any[]>) {
      state.lazyResources = action.payload;
    },
    setLazyResourcesFetchStatus(
      state,
      action: PayloadAction<Record<string, 'loading' | 'success' | 'error'>>,
    ) {
      state.lazyResourcesFetchStatus = action.payload;
    },
    setLazyResourcesFetchCount(
      state,
      action: PayloadAction<Record<string, number>>,
    ) {
      state.lazyResourcesFetchCount = action.payload;
    },
    updateLazyResourceFetchStatus(
      state,
      action: PayloadAction<{
        key: string;
        status: 'loading' | 'success' | 'error';
      }>,
    ) {
      state.lazyResourcesFetchStatus[action.payload.key] =
        action.payload.status;
    },
    updateLazyResourceFetchStatuses(
      state,
      action: PayloadAction<
        {
          key: string;
          status: 'loading' | 'success' | 'error';
        }[]
      >,
    ) {
      action.payload.forEach(({ key, status }) => {
        state.lazyResourcesFetchStatus[key] = status;
      });
    },
    updateLazyResourceFetchCount(
      state,
      action: PayloadAction<{
        key: string;
        count: number;
      }>,
    ) {
      state.lazyResourcesFetchCount[action.payload.key] = action.payload.count;
    },
    updateLazyResourceFetchCounts(
      state,
      action: PayloadAction<
        {
          key: string;
          count: number;
        }[]
      >,
    ) {
      action.payload.forEach(({ key, count }) => {
        state.lazyResourcesFetchCount[key] = count;
      });
    },
    setActivityResources(state, action: PayloadAction<any[]>) {
      state.activityResources = action.payload;
    },
    setLocationResources(state, action: PayloadAction<any[]>) {
      state.locationResources = action.payload;
    },
    setBlockResources(state, action: PayloadAction<any[]>) {
      state.blockResources = action.payload;
    },
  },
  extraReducers: (builder) => {
    // It handles only special case of updating activity resource's default duration
    // TODO: Refactor to handle all resources in a more generic way
    builder.addCase(
      UsersFormActionTypes.USERS_FORM_UPDATE_SUCCESS as any,
      (
        state,
        action: PayloadAction<{
          id: string;
          resources: string;
          data: Record<string, any>;
        }>,
      ) => {
        const { id, resources, data } = action.payload;
        if (resources !== 'Activity') {
          return;
        }

        const activityResource = state.activityResources.find(
          (r) => r.id === id,
        );
        if (!activityResource) {
          return;
        }

        try {
          const defaultDuration =
            typeof activityResource.defaultDuration === 'number'
              ? activityResource.defaultDuration
              : null;

          const updatedDefaultDuration =
            typeof data.defaultDuration === 'number'
              ? data.defaultDuration
              : defaultDuration;

          if (defaultDuration !== updatedDefaultDuration) {
            activityResource.defaultDuration = updatedDefaultDuration;
          }
        } catch (error) {
          console.error('Error updating activity resource:', error);
        }
      },
    );

    builder.addCase(
      UsersListActionTypes.USERS_LIST_DELETE_SUCCESS as any,
      (
        state,
        action: PayloadAction<{
          id: string;
        }>,
      ) => {
        const { id } = action.payload;
        try {
          // Remove the deleted resource from activity resources
          const activityResourceIndex = state.activityResources.findIndex(
            (resource) => resource.id === id,
          );
          if (activityResourceIndex !== -1) {
            // If the resource is an activity resource, we remove it from the activity resources
            state.activityResources = state.activityResources.filter(
              (resource) => resource.id !== id,
            );
            return;
          }

          // If the resource is not an activity resource, we check if it's a location or lazy resource
          // Remove the deleted resource from visible resources
          const locationResourceIndex = state.locationResources.findIndex(
            (resource) => resource.id === id,
          );
          if (locationResourceIndex !== -1) {
            // If the resource is a location, we remove it from the location resources
            state.locationResources = state.locationResources.filter(
              (resource) => resource.id !== id,
            );
            return;
          }

          // If the resource is not an activity or location resource, we check if it's a lazy resource
          // Remove the deleted resource from lazy resources
          const lazyResourceIndex = state.lazyResources.findIndex(
            (resource) => resource.id === id,
          );
          if (lazyResourceIndex !== -1) {
            // If the resource is a lazy resource, we remove it from the lazy resources
            state.lazyResources = state.lazyResources.filter(
              (resource) => resource.id !== id,
            );
            return;
          }
        } catch (error) {
          console.error('Error deleting resource:', error);
        }
      },
    );
  },
});

export const {
  setEvents,
  setAvailabilities,
  setAvailabilitiesFetchedResourceIds,
  setBranches,
  setCurrentBranches,
  setStatistics,
  setExpandedResourses,
  setTotalTypes,
  setReasonsCanceled,
  setCancellations,
  setSubgroups,
  setTeamsHierarchy,
  setRoles,
  setFrontendRolesHierarchy,
  setModalOverbooking,
  setOverbookingData,
  setSocketPending,
  setEventsLoading,
  setOverbookingLoading,
  setUpdatingEventsLoading,
  setSandboxMode,
  setIncludeDeleted,
  setActive,
  setActiveFilteredEvent,
  setIsCurrentBranchLevelHighest,
  setIsCurrentBranchLastTwoLowest,
  setRetryPopup,
  setDisplayedUser,
  setCalendarTime,
  setSelectedEvent,
  setPushNotification,
  setSortResourcesSolGen,
  setEventResizingCurrently,
  setPasteEventsLoading,
  setDeleteEventsLoading,
  setUndeleteEventsLoading,
  setRequestedVisibleResources,
  resetExpandedResources,
  resetStatistics,
  updateFilter,
  updateAllFilters,
  updateFilterLocations,
  updateAllFiltersLocations,
  appendVisibleResource,
  filterOutVisibleResource,
  setLazyResources,
  setLazyResourcesFetchStatus,
  setLazyResourcesFetchCount,
  updateLazyResourceFetchStatus,
  updateLazyResourceFetchStatuses,
  updateLazyResourceFetchCount,
  updateLazyResourceFetchCounts,
  setActivityResources,
  setLocationResources,
  setBlockResources,
  resetEvents,
  resetAvailabilities,
} = calendarSlice.actions;

export default calendarSlice.reducer;
