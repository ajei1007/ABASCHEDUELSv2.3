import { useEffect } from 'react';
import { useLatestCallback } from 'hooks/useLatestCallback';
import getDeviceAddress from 'helpers/getDeviceAddress';
import role_permissions from 'helpers/role_permissions';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { getCompanySchedulerLockedRecursively } from 'store/actions/settingsActions';
import {
  fetchBranches,
  fetchFrontendRolesHierarchy,
  fetchSubgroups,
  fetchTeamsHierarchy,
  fetchTotalTypes,
} from 'store/slices/calendar/thunks';
import { AuthActionTypes } from 'types/redux/auth';

/**
 * Custom hook for fetching initial data required for the calendar component.
 *
 * This hook orchestrates the loading of various data sources needed for the calendar
 * to function properly, including branches, roles, teams, and user permissions.
 * It only triggers the fetch operations once the settings values are initialized.
 */
export function useCalendarDataFetch() {
  const dispatch = useAppDispatch();

  // Store selectors for various calendar-related data
  const storeFrontendRolesHierarchy = useAppSelector(
    (state) => state.calendar.frontend_roles_hierarchy,
  );
  const storeSubgroups = useAppSelector((state) => state.calendar.subgroups);
  const storeTeamsHierarchy = useAppSelector(
    (state) => state.calendar.teams_hierarchy,
  );
  const storeTotalTypes = useAppSelector((state) => state.calendar.totalTypes);

  // Check if settings values have been initialized before fetching data
  const storeSettingsValuesInitialized = useAppSelector(
    (state) => state.settings?.settingValues?.initialized,
  );

  // Current user for permission checks
  // Current user for permission checks
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  /**
   * Fetches all initial data required for the calendar component in parallel.
   *
   * This function performs the following operations:
   * 1. Fetches branches and conditionally fetches subgroups based on user permissions
   * 2. Gets company scheduler lock settings recursively
   * 3. Fetches frontend roles hierarchy if not already loaded
   * 4. Fetches teams hierarchy if not already loaded
   * 5. Fetches total types if the current type is 'lk' (likely a loading state)
   * 6. Gets device address and sets it in the auth store
   */
  const fetchInitial = useLatestCallback(async () =>
    Promise.all([
      // Fetch branches and related data
      (async () => {
        await dispatch(fetchBranches());

        // Only fetch subgroups if user has permission and subgroups aren't already loaded
        if (
          role_permissions(currentUser, 'viewSubgroup') &&
          Object.keys(storeSubgroups).length === 0
        ) {
          dispatch(fetchSubgroups());
        }

        // Get company scheduler lock settings
        dispatch(getCompanySchedulerLockedRecursively());
      })(),

      // Fetch frontend roles hierarchy if not already loaded
      (() => {
        if (Object.keys(storeFrontendRolesHierarchy).length === 0) {
          return dispatch(fetchFrontendRolesHierarchy());
        }
      })(),

      // Fetch teams hierarchy if not already loaded
      (() => {
        if (Object.keys(storeTeamsHierarchy).length === 0) {
          return dispatch(fetchTeamsHierarchy());
        }
      })(),

      // Fetch total types if the current state indicates loading ('lk')
      (() => {
        if (storeTotalTypes[0] === 'lk') {
          return dispatch(fetchTotalTypes());
        }
      })(),

      // Get device address and store it in auth state
      (async () => {
        const deviceAddress = await getDeviceAddress();
        dispatch({
          type: AuthActionTypes.SET_DEVICE_ADDRESS,
          payload: deviceAddress,
        });
      })(),
    ]),
  );

  /**
   * Effect that triggers the initial data fetch when settings are initialized.
   *
   * The fetch operation is only triggered once the settings values are properly
   * initialized to ensure that all configuration is available before loading
   * calendar-specific data.
   */
  useEffect(() => {
    if (storeSettingsValuesInitialized) {
      fetchInitial();
    }
  }, [storeSettingsValuesInitialized, fetchInitial]);
}
