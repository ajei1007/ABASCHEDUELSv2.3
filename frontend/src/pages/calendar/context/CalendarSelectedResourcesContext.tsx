import React, {
  useMemo,
  useContext,
  createContext,
  useState,
  useCallback,
} from 'react';
import type { EventApi } from '@fullcalendar/core';
import { uniqBy } from 'lodash';
import { useAppSelector } from 'store/hooks';
import {
  selectCalendarEvents,
  selectCalendarSupervisionEventsMap,
} from 'store/slices/calendar/selectors';
import { useFullcalendarApiContext } from './FullcalendarApiContext';
import { useCalendarCopyModeContext } from './CalendarCopyModeContext';
import { useCalendarSelectedEventsContext } from './CalendarSelectedEventsContext';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { intersectArrays } from '../utils/intersectArrays';

/**
 * CalendarSelectedResourcesContext provides state and actions for managing selected resources in the calendar view.
 * It supports selection logic based on resource type, isolation, and role hierarchy filters from the Redux store.
 *
 * @module CalendarSelectedResourcesContext
 */

/**
 * Context type describing all values and actions for selected resources in calendar
 * @typedef {Object} CalendarSelectedResourcesContextType
 * @property {any[]} selectedResources - Array of currently selected resources
 * @property {Function} setSelectedResources - Function to update selected resources
 * @property {boolean} isAllSelected - Whether all resources are selected
 * @property {Function} toggleIsAllSelected - Function to toggle the "all selected" state
 * @property {(resource: { value: string; label: string; type: string; email?: string | null; email1?: string | null; email2?: string | null }) => void} selectSingleResource - Select or unselect a single resource
 * @property {() => void} selectAllResources - Select all available resources
 * @property {() => void} unselectAllResources - Unselect all currently selected resources
 * @property {() => void} resetAnySelected - Reset any selected resources and events
 */
interface CalendarSelectedResourcesContextType {
  selectedResources: any[];
  setSelectedResources: (resources: any[]) => void;

  isAllSelected: boolean;
  toggleIsAllSelected: (value?: boolean) => void;

  selectSingleResource: (resource: {
    value: string;
    label: string;
    type: string;
    email?: string | null;
    email1?: string | null;
    email2?: string | null;
  }) => void;

  selectAllResources: () => void;
  unselectAllResources: () => void;

  resetAnySelected: () => void;
}

/**
 * React Context for selected calendar resources. Default value is null.
 *
 * @type {React.Context<CalendarSelectedResourcesContextType | null>}
 */
export const CalendarSelectedResourcesContext =
  createContext<CalendarSelectedResourcesContextType | null>(null);

/**
 * Set a display name for easier debugging in React DevTools
 */
CalendarSelectedResourcesContext.displayName =
  'CalendarSelectedResourcesContext';

/**
 * Custom hook to access CalendarSelectedResourcesContext.
 * Throws an error if used outside the provider.
 *
 * @returns {CalendarSelectedResourcesContextType} The context value for selected resources
 * @throws {Error} If used outside of CalendarSelectedResourcesContextProvider
 */
export const useCalendarSelectedResourcesContext =
  (): CalendarSelectedResourcesContextType => {
    const context = useContext(CalendarSelectedResourcesContext);

    if (!context) {
      throw new Error(
        'useCalendarSelectedResourcesContext must be used within a CalendarSelectedResourcesContextProvider',
      );
    }

    return context;
  };

/**
 * Props for CalendarSelectedResourcesContextProvider
 * @typedef {Object} CalendarSelectedResourcesContextProviderProps
 * @property {React.ReactNode} children - Child components to be wrapped by the provider
 */
interface CalendarSelectedResourcesContextProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for CalendarSelectedResourcesContext.
 * Manages selected resources state and exposes selection actions to children.
 *
 * @param {CalendarSelectedResourcesContextProviderProps} props - Provider props
 * @returns {JSX.Element} Provider wrapping children with context value
 */
export const CalendarSelectedResourcesContextProvider = ({
  children,
}: CalendarSelectedResourcesContextProviderProps): JSX.Element => {
  // Selectors to fetch resource and filter data from Redux store
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
  const storeFrontendRolesHierarchy = useAppSelector(
    (state) => state.calendar.frontend_roles_hierarchy,
  );

  const storeSettingsValuesIsolatedResources = useAppSelector(
    (state) => state.settings?.settingValues?.isolatedResources,
  );

  const storeSettingsValuesRoleFilter = useAppSelector(
    (state) => state.settings.settingValues.roleFilter,
  );

  const storeSettingsValuesSubgroupsFilter = useAppSelector(
    (state) => state.settings.settingValues.subgroupsFilter,
  );

  const storeEvents = useAppSelector(selectCalendarEvents);

  const supervisionEventsMap = useAppSelector(
    selectCalendarSupervisionEventsMap,
  );

  const { calendarApi } = useFullcalendarApiContext();
  const { setCopyModeActive } = useCalendarCopyModeContext();
  const { selectedEvents, setSelectedEvents } =
    useCalendarSelectedEventsContext();

  // State for selected resources and "all selected" toggle
  const [selectedResources, setSelectedResources] = useState<any[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const selectSingleResource = useLatestCallback(
    (resource: {
      value: string;
      label: string;
      type: string;
      email?: string | null;
      email1?: string | null;
      email2?: string | null;
    }) => {
      const clickedId = resource.value;

      let newSelectedEvents = [...selectedEvents];

      const calendarEvents = calendarApi?.getEvents() || [];
      const resourceEvents = storeEvents.reduce((acc: any[], event) => {
        if (event.resourceIds.includes(clickedId)) {
          const events = calendarEvents.filter(
            (ev) => ev && ev?.id === event.id,
          );
          if (events.length > 0) {
            acc.push(...events);
          }
        }
        return acc;
      }, [] as any[]);

      if (selectedResources.some((item) => item?.value === clickedId)) {
        newSelectedEvents = newSelectedEvents.filter(
          (p) => p && !resourceEvents.some((e) => e.id === p.id),
        );
        setIsAllSelected(false);
      } else {
        newSelectedEvents = [...newSelectedEvents, ...resourceEvents];
      }

      // Exclude supervision events
      newSelectedEvents = newSelectedEvents.filter(
        (p) => p && !supervisionEventsMap.has(p.id),
      );

      newSelectedEvents = uniqBy(newSelectedEvents, 'id');
      setSelectedEvents(newSelectedEvents);
      if (selectedResources.some((item) => item?.value === clickedId)) {
        setSelectedResources(
          selectedResources.filter((item) => item?.value !== clickedId),
        );
      } else {
        setSelectedResources([...selectedResources, resource]);
      }

      if (newSelectedEvents.length > 0) {
        setCopyModeActive(true);
      } else {
        setCopyModeActive(false);
      }
    },
  );

  /**
   * Selects all resources that match type, isolation, and role filters.
   * Combines lazy, activity, and location resources, then applies filters.
   *
   * @function
   * @returns {void}
   */
  const selectAllResources = useLatestCallback((): void => {
    const allResources = [
      ...storeLazyResources.filter((r) =>
        ['Employee', 'Client'].includes(r.type),
      ),
      ...storeActivityResources,
      ...storeLocationResources,
      ...storeBlockResources,
    ];
    const updatedSelectedResources = allResources
      .filter((item) => {
        // Isolation filter: if isolatedResources is empty, allow all; else, only allow matching IDs
        const isolatedOk =
          storeSettingsValuesIsolatedResources.length === 0 ||
          storeSettingsValuesIsolatedResources.some(
            (r) => r?.value === item.id,
          );

        if (!isolatedOk) {
          return false;
        }

        const subgroupOk =
          storeSettingsValuesSubgroupsFilter.length === 0 ||
          intersectArrays(
            storeSettingsValuesSubgroupsFilter,
            item.actual_subgroups,
          ).length > 0;

        if (!subgroupOk) {
          return false;
        }

        // Role filter: if roleFilter is empty, allow all; else, only allow resources with matching roles in hierarchy
        const roleOk =
          storeSettingsValuesRoleFilter.length === 0 ||
          item.roles.some((role: any) => {
            const hierarchy = storeFrontendRolesHierarchy[role];
            return (
              hierarchy &&
              intersectArrays(hierarchy, storeSettingsValuesRoleFilter).length >
                0
            );
          });

        return roleOk;
      })
      .map((item) => ({
        value: item.id,
        label: item.title,
        type: item.type,
        email: item.email,
        email1: item.email1,
        email2: item.email2,
      }));

    setSelectedResources(updatedSelectedResources);
  });

  /**
   * Clears all selected resources.
   *
   * @function
   * @returns {void}
   */
  const unselectAllResources = useCallback((): void => {
    setSelectedResources([]);
  }, []);

  /**
   * Toggles the "all selected" state (does not affect selectedResources array).
   *
   * @function
   * @returns {void}
   */
  const toggleIsAllSelected = useLatestCallback((value?: boolean): void => {
    const newState = value !== undefined ? value : !isAllSelected;
    setIsAllSelected(newState);

    if (!newState) {
      unselectAllResources();
      setSelectedEvents([]);
    } else {
      selectAllResources();
      const resources = calendarApi?.getResources().map((res) => res.id) || [];
      const calendarEvents = calendarApi?.getEvents() || [];
      let resourceEvents = storeEvents.reduce((acc: EventApi[], event: any) => {
        if (intersectArrays(event.users, resources).length > 0) {
          const events = calendarEvents.filter(
            (ev: any) =>
              ev &&
              ev?.id === event.id &&
              // Exclude supervision events
              !supervisionEventsMap.has(ev.id),
          );
          if (events.length > 0) {
            acc.push(...events);
          }
        }
        return acc;
      }, [] as EventApi[]);

      resourceEvents = uniqBy(resourceEvents, 'id');
      setSelectedEvents(resourceEvents);
    }
    setCopyModeActive(newState);
  });

  const resetAnySelected = useCallback(() => {
    unselectAllResources();
    setSelectedEvents([]);
    setIsAllSelected(false);
    setCopyModeActive(false);
  }, [
    unselectAllResources,
    setSelectedEvents,
    setIsAllSelected,
    setCopyModeActive,
  ]);

  /**
   * Memoized context value to avoid unnecessary re-renders.
   *
   * @type {CalendarSelectedResourcesContextType}
   */
  const contextValue = useMemo(
    () => ({
      selectedResources,
      setSelectedResources,
      isAllSelected,
      toggleIsAllSelected,
      selectSingleResource,
      selectAllResources,
      unselectAllResources,
      resetAnySelected,
    }),
    [
      selectedResources,
      setSelectedResources,
      isAllSelected,
      toggleIsAllSelected,
      selectSingleResource,
      selectAllResources,
      unselectAllResources,
      resetAnySelected,
    ],
  );

  // Provide context to children
  return (
    <CalendarSelectedResourcesContext.Provider value={contextValue}>
      {children}
    </CalendarSelectedResourcesContext.Provider>
  );
};
