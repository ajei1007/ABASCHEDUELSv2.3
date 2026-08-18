import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setRequestedVisibleResources } from 'store/slices/calendar/actions';
import {
  fetchEvents,
  fetchResourceAvailabilities,
  fetchStatistics,
} from 'store/slices/calendar/thunks';
import { fetchFlaggingData } from 'store/slices/flagging/actions';
import { useLatestCallback } from 'hooks/useLatestCallback';
import role_permissions from 'helpers/role_permissions';
import checkCompanyPlanFeature from 'utils/checkCompanyPlanFeature';
import { useFullcalendarApiContext } from '../context/FullcalendarApiContext';

export function useCalendarDataFetchForVisibleResources() {
  const dispatch = useAppDispatch();
  const storeVisibleResources = useAppSelector(
    (state) => state.calendar.visibleResources,
  );
  const storeVisibleResourcesCount = useAppSelector(
    (state) => state.calendar.visibleResourcesCount,
  );
  const storeRequestedVisibleResources = useAppSelector(
    (state) => state.calendar.requestedVisibleResources,
  );
  const membership = useAppSelector(
    (state) => state.settings.settingsCompany.company.membership,
  );
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const isFlaggingEnabled = useAppSelector(
    (state) => state.flagging.flaggingEnabled,
  );
  const isOverbookingEnabled = useAppSelector(
    (state) => state.settings.settingValues.overbooking,
  );
  const statsViewEnabled = useAppSelector(
    (state) => state.settings.settingValues.statsViewEnabled,
  );
  const storeCalendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const storeCalendarEnd = useAppSelector(
    (state) => state.calendar.calendar_end,
  );

  // Context for FullCalendar API
  const { calendarApi } = useFullcalendarApiContext();

  const fetchData = useLatestCallback(() => {
    const visibleResourceIds = storeVisibleResources.map(({ id }) => id);
    const requestedVisibleResourceIdsMap =
      storeRequestedVisibleResources.reduce((acc, item) => {
        acc.set(item.id, true);
        return acc;
      }, new Map<string, boolean>());

    const visiblePersonResourceIds = storeVisibleResources.reduce(
      (acc, item) => {
        if (item.person) {
          acc.push(item.id);
        }
        return acc;
      },
      [] as string[],
    );
    const requestedVisiblePersonResourceIdsMap =
      storeRequestedVisibleResources.reduce((acc, item) => {
        if (item.person) {
          acc.set(item.id, true);
        }
        return acc;
      }, new Map<string, boolean>());

    const toBeRequestedResourceIds = visibleResourceIds.filter(
      (id) => !requestedVisibleResourceIdsMap.has(id),
    );
    const toBeRequestedPersonResourceIds = visiblePersonResourceIds.filter(
      (id) => !requestedVisiblePersonResourceIdsMap.has(id),
    );

    if (toBeRequestedResourceIds.length > 0) {
      dispatch(
        fetchResourceAvailabilities({
          lazyLoadingResourceIds: toBeRequestedResourceIds,
        }),
      );
    }

    if (toBeRequestedPersonResourceIds.length > 0) {
      dispatch(
        fetchEvents({
          bol: false,
          lazyLoadingResourceIds: toBeRequestedPersonResourceIds,
        }),
      );
    }

    if (
      checkCompanyPlanFeature(membership, 'flagging') &&
      role_permissions(currentUser, 'flaggingFeature') &&
      toBeRequestedPersonResourceIds.length > 0 &&
      (isFlaggingEnabled || isOverbookingEnabled)
    ) {
      dispatch(
        fetchFlaggingData({
          ids: toBeRequestedPersonResourceIds,
          updateIds: toBeRequestedPersonResourceIds,
        }),
      );
    }

    if (statsViewEnabled) {
      dispatch(
        fetchStatistics({
          start: storeCalendarStart,
          end: storeCalendarEnd,
        }),
      );
    }

    dispatch(setRequestedVisibleResources(storeVisibleResources));
    if (calendarApi) {
      calendarApi.updateSize();
    }
  });

  const loadDataTimer = useRef(-1);

  const debounceLoadData = useLatestCallback(() => {
    window.clearTimeout(loadDataTimer.current);
    loadDataTimer.current = window.setTimeout(() => fetchData(), 500);
  });

  // Lazy Loading Events
  useEffect(() => {
    debounceLoadData();
  }, [storeVisibleResourcesCount, debounceLoadData]);
}
