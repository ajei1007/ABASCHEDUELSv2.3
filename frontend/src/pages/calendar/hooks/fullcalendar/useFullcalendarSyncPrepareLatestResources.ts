import { useEffect, useMemo } from 'react';
import { useAppSelector } from 'store/hooks';
import role_permissions from 'helpers/role_permissions';
import { RESOURCE_TYPES, PERSON_RESOURCE_TYPES } from '../../constants';
import { useFullcalendarApiContext } from '../../context/FullcalendarApiContext';
import { intersectArrays } from '../../utils/intersectArrays';

const DEFAULT_EVENT_CONSTRAINT = { startTime: '00:00', endTime: '00:00' };

export function useFullcalendarSyncPrepareLatestResources({
  currentBranchTeamsHierarchy,
  nextCalendarResources,
  syncCalendar,
}: {
  currentBranchTeamsHierarchy: Record<string, any>;
  nextCalendarResources: React.MutableRefObject<any[] | null>;
  syncCalendar: () => void;
}) {
  const storeEvents = useAppSelector((state) => state.calendar.events);
  const storeExpandedResources = useAppSelector(
    (state) => state.calendar.expandedResources,
  );
  const lazyResources = useAppSelector((state) => state.calendar.lazyResources);
  const lazyResourcesFetchStatus = useAppSelector(
    (state) => state.calendar.lazyResourcesFetchStatus,
  );
  const lazyResourcesFetchCount = useAppSelector(
    (state) => state.calendar.lazyResourcesFetchCount,
  );
  const activityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const locationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const blockResources = useAppSelector(
    (state) => state.calendar.blockResources,
  );

  const storeFrontendRolesHierarchy = useAppSelector(
    (state) => state.calendar.frontend_roles_hierarchy,
  );
  const storeStatisticsIndividualUsers = useAppSelector(
    (state) => state.calendar.statistics.individual.users,
  );
  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const storeSelectedCalendarsActivity = useAppSelector(
    (state) => state.calendar.selectedCalendars.activity,
  );

  const storeSettingsValuesTeamSeparation = useAppSelector(
    (state) => state.settings.settingValues.teamSeparation,
  );

  const hasStoreSettingsValues = useAppSelector(
    (state) => !!state.settings.settingValues,
  );

  const subgroupsFilter = useAppSelector(
    (state) => state.settings.settingValues.subgroupsFilter,
  );
  const isolatedResources = useAppSelector(
    (state) => state.settings.settingValues.isolatedResources,
  );
  const roleFilter = useAppSelector(
    (state) => state.settings.settingValues.roleFilter,
  );
  const storeGroupResourcesByRole = useAppSelector(
    (state) => state.settings.settingValues.groupResourcesByRole,
  );

  const groupedResourcesByRole = useMemo(() => {
    const groupedRoles: Record<string, string[]> = {};
    RESOURCE_TYPES.forEach((type) => {
      let roles_list: string[] = [];
      Object.entries(storeFrontendRolesHierarchy).map((t) => {
        const [key, value] = t;
        if (value.includes(type) && key !== type) {
          roles_list.push(key);
        }
      });
      groupedRoles[type] = roles_list;
    });

    return groupedRoles;
  }, [storeFrontendRolesHierarchy]);

  const isOnboarding = useAppSelector(
    (state) => state.settings.settingValues.isOnboarding,
  );
  const onboardingSelection = useAppSelector(
    (state) => state.settings.settingValues.onboardingSelection,
  );
  const availabilities = useAppSelector(
    (state) => state.calendar.availabilities,
  );
  const availabilitiesFetchedResourceIds = useAppSelector(
    (state) => state.calendar.availabilitiesFetchedResourceIds,
  );
  const hideUsersWithNoAvailability = useAppSelector(
    (state) => state.settings.settingValues.hideUsersWithNoAvailability,
  );

  const currentUser = useAppSelector((store) => store.auth.currentUser);

  // Context for FullCalendar API
  const { calendarApi } = useFullcalendarApiContext();

  const filteredResources = useMemo(() => {
    const personResources = lazyResources.filter((r: any) =>
      ['Employee', 'Client'].includes(r.type),
    );

    const allResources = [
      ...personResources,
      ...activityResources,
      ...locationResources,
      ...blockResources,
    ];

    if (!hideUsersWithNoAvailability) {
      return allResources;
    }
    const availableResources = availabilities
      .filter((a) => a.av)
      .map((a) => a?.resourceIds?.[0]);

    const mapByAvailability = (resource: any) => {
      if (
        availabilitiesFetchedResourceIds[resource.id] &&
        !availableResources.includes(resource.id)
      ) {
        return { ...resource, hidden: true };
      }
      return { ...resource, hidden: false };
    };

    return allResources.map(mapByAvailability);
  }, [
    lazyResources,
    availabilities,
    availabilitiesFetchedResourceIds,
    activityResources,
    locationResources,
    blockResources,
    hideUsersWithNoAvailability,
  ]);

  // TODO refactor
  useEffect(() => {
    if (calendarApi === null) {
      return;
    }

    const calendarResources = (() => {
      if (calendarApi === null) {
        return [];
      }

      const view_type = calendarApi.view.type;
      let resources = window
        .structuredClone(filteredResources)
        .filter((e: any) => {
          if (e.calendarhide) {
            return false;
          }

          // TODO: why do we need this?
          let bol1 = true;
          let bol2 = false;
          if (isolatedResources.length !== 0) {
            bol1 = isolatedResources.some((item) => item?.value === e.id);
          }
          if (subgroupsFilter.length !== 0) {
            bol1 =
              intersectArrays(subgroupsFilter, e.actual_subgroups).length > 0;
          }
          if (roleFilter.length !== 0) {
            for (let index = 0; index < e.roles.length; index++) {
              const element = e.roles[index];
              if (
                storeFrontendRolesHierarchy[element] &&
                intersectArrays(
                  storeFrontendRolesHierarchy[element],
                  roleFilter,
                ).length > 0
              ) {
                bol2 = true;
                break;
              }
            }
          } else {
            bol2 = true;
          }
          return bol1 && bol2;
        })
        .map((resource: any) => {
          const branchId = storeCurrentBranches[0]?.value;
          const resourceType = resource.type;

          resource = {
            ...resource,
            groupId: `${resourceType}|${branchId}`,
          };
          //Actual Statistics
          if (storeStatisticsIndividualUsers[resource.id]) {
            let stats = {};
            Object.keys(
              storeStatisticsIndividualUsers[resource.id].activities,
            ).forEach((t) => {
              stats = {
                ...stats,
                [t]: (
                  storeStatisticsIndividualUsers[resource.id].activities[t] /
                  3600000
                ).toFixed(1),
              };
            });

            resource = {
              ...resource,
              ...stats,
              total: (
                storeStatisticsIndividualUsers[resource.id].total / 3600000
              ).toFixed(1),
              efficiency:
                storeStatisticsIndividualUsers[resource.id].efficiency.toFixed(
                  0,
                ),
              converted:
                storeStatisticsIndividualUsers[resource.id].converted.toFixed(
                  1,
                ),
            };
          }
          return resource;
        });

      if (!storeSettingsValuesTeamSeparation && storeCurrentBranches[0].bol) {
        resources.forEach((o: any) => {
          delete o['parentId'];
        });
      }
      const currentBranchId = storeCurrentBranches[0]?.value;
      if (view_type === 'Day_Timeline' || view_type === 'Week_Timeline') {
        resources = resources.map((y: any) => {
          if (y.parentId && currentBranchTeamsHierarchy[y.parentId]) {
            y = {
              ...y,
              parentId: `${y.parentId}_${y.type}`,
            };
          } else {
            delete y['parentId'];
          }
          return y;
        });

        let level_obj: Record<string, any> = {};
        Object.values(currentBranchTeamsHierarchy).forEach((t) => {
          level_obj = {
            ...level_obj,
            [t.label]: t.level,
            [t.keylabel]: t.level - 1,
          };
        });

        const current_branch_level = level_obj[storeCurrentBranches[0].label];
        const super_teams_hierarchy = [
          ...new Set(Object.keys(currentBranchTeamsHierarchy)),
        ];

        const subResourceLabels = super_teams_hierarchy.flatMap((title) => {
          if (level_obj[title] > current_branch_level - 1) {
            return [];
          }

          const branchId = currentBranchTeamsHierarchy[title]
            ? currentBranchTeamsHierarchy[title]['keyid']
            : null;

          return RESOURCE_TYPES.flatMap((type) => {
            const fetchStatusKey = `${branchId}:${type}`;
            const fetchStatus = lazyResourcesFetchStatus[fetchStatusKey];
            const fetchCount = lazyResourcesFetchCount[fetchStatusKey];

            const resourceLabels: any[] = [
              {
                id: `${title}_${type}`,
                parentId: currentBranchTeamsHierarchy[title]
                  ? `${currentBranchTeamsHierarchy[title].label}_${type}`
                  : '',
                groupId: `${type}|${currentBranchId}`,
                title,
                type,
                branchId,
                branch: true,
                viewType: view_type,
                eventConstraint: DEFAULT_EVENT_CONSTRAINT,
              },
            ];

            if (PERSON_RESOURCE_TYPES.includes(type)) {
              if (fetchStatus !== 'success') {
                resourceLabels.push({
                  id: `${title}_${type}_blank`,
                  parentId: `${title}_${type}`,
                  groupId: `${type}|${currentBranchId}`,
                  // append zzz to the title to make it appear at the end of the list
                  title: `zzz${type}_${title}_blank`,
                  type,
                  branchId,
                  loader: true,
                  viewType: view_type,
                  eventConstraint: DEFAULT_EVENT_CONSTRAINT,
                });
              }

              if (
                fetchStatus === 'success' &&
                fetchCount === 0 &&
                level_obj[title] === 0 &&
                role_permissions(currentUser, 'dataAccess') !== 'User'
              ) {
                resourceLabels.push({
                  id: `${title}_${type}_blank`,
                  parentId: `${title}_${type}`,
                  groupId: `${type}|${currentBranchId}`,
                  // append zzz to the title to make it appear at the end of the list
                  title: `zzz${type}_${title}_blank`,
                  type,
                  branchId,
                  empty: true,
                  viewType: view_type,
                  eventConstraint: DEFAULT_EVENT_CONSTRAINT,
                });
              }
            }
            return resourceLabels;
          });
        });

        const resourceLabels = PERSON_RESOURCE_TYPES.reduce((acc, type) => {
          const fetchStatusKey = `${currentBranchId}:${type}`;
          const fetchStatus = lazyResourcesFetchStatus[fetchStatusKey];
          const fetchCount = lazyResourcesFetchCount[fetchStatusKey];
          if (fetchStatus !== 'success') {
            acc.push({
              id: `${type}_blank`,
              groupId: `${type}|${currentBranchId}`,
              // append zzz to the title to make it appear at the end of the list
              title: `zzz${type}_blank`,
              type: type,
              branchId: currentBranchId || null,
              loader: true,
              viewType: view_type,
              eventConstraint: DEFAULT_EVENT_CONSTRAINT,
            });
          }
          if (
            fetchStatus === 'success' &&
            fetchCount === 0 &&
            super_teams_hierarchy.length === 0 &&
            role_permissions(currentUser, 'dataAccess') !== 'User'
          ) {
            acc.push({
              id: `${type}_blank`,
              groupId: `${type}|${currentBranchId}`,
              // append zzz to the title to make it appear at the end of the list
              title: `zzz${type}_blank`,
              type: type,
              branchId: currentBranchId || null,
              empty: true,
              viewType: view_type,
              eventConstraint: DEFAULT_EVENT_CONSTRAINT,
            });
          }
          return acc;
        }, [] as any[]);

        let roleGroupLabels: any[] = [];
        if (storeGroupResourcesByRole && subResourceLabels.length === 0) {
          roleGroupLabels = RESOURCE_TYPES.flatMap((type) =>
            (groupedResourcesByRole[type] || []).map((role) => ({
              id: `${role}_${type}`,
              groupId: `${type}|${currentBranchId}`,
              title: role,
              type,
              branchId: currentBranchId || null,
              viewType: view_type,
              branch: true,
              eventConstraint: DEFAULT_EVENT_CONSTRAINT,
            })),
          );

          resources = resources.map((res: any) => {
            if (!res.roles) {
              return res;
            }
            const matchedRole = res.roles.find((r: any) =>
              (groupedResourcesByRole[res.type] || []).includes(r),
            );
            if (matchedRole) {
              return { ...res, parentId: `${matchedRole}_${res.type}` };
            }
            return res;
          });
        }

        resources = [
          ...resources,
          ...(subResourceLabels.length > 0
            ? subResourceLabels
            : roleGroupLabels),
          ...resourceLabels,
        ].sort(
          (a, b) =>
            RESOURCE_TYPES.indexOf(a.type) - RESOURCE_TYPES.indexOf(b.type),
        );
        // eslint-disable-next-line array-callback-return
        resources.filter((res: any) => {
          if (
            res['parentId'] &&
            level_obj[res['parentId'].split('_')[0]] + 1 > current_branch_level
          ) {
            delete res['parentId'];
          }
        });
      } else {
        resources.forEach((res: any) => {
          delete res['parentId'];
        });
        resources = resources.filter((res: any) => {
          if (res.roles && res.roles.includes('Person')) {
            return true;
          }
          return false;
        });
        resources = [
          ...resources,
          ...PERSON_RESOURCE_TYPES.map((type) => ({
            id: `${type}_blank`,
            groupId: `${type}|${currentBranchId}`,
            title: `${type}_blank`,
            type: type,
            branchId: currentBranchId || null,
            loader: true,
            viewType: view_type,
            eventConstraint: DEFAULT_EVENT_CONSTRAINT,
          })).filter((item) => {
            const fetchStatusKey = `${currentBranchId}:${item.type}`;
            const fetchStatus = lazyResourcesFetchStatus[fetchStatusKey];
            return fetchStatus !== 'success';
          }),
        ].sort(
          (a, b) =>
            RESOURCE_TYPES.indexOf(a.type) - RESOURCE_TYPES.indexOf(b.type),
        );
      }
      if (
        ['Day_Timeline', 'Week_Timeline'].includes(view_type) &&
        storeExpandedResources.length > 0
      ) {
        storeExpandedResources.forEach((expandedResource) => {
          if (!expandedResource.id) {
            return;
          }

          const foundResource = resources.find(
            (e: any) => e.id === expandedResource.id,
          );
          const title = foundResource ? foundResource.title : '';
          const parentId = foundResource?.parentId
            ? foundResource.parentId
            : '';

          resources.push({
            id: `${expandedResource.id}a`,
            parentId: parentId,
            groupId: `${foundResource?.type}|${currentBranchId}`,
            title: `${title}`,
            firstName: foundResource?.firstName || '',
            lastName: foundResource?.lastName || '',
            type: foundResource?.type,
            resourceId: foundResource?.id,
            eventConstraint: DEFAULT_EVENT_CONSTRAINT,
            a: 1,
          });
        });
      }

      // TODO: what is this?
      let my_obj: Record<string, any> = {};
      const selectedCalendarsIds = storeSelectedCalendarsActivity.map(
        (t) => t.id,
      );
      resources.forEach((t: any) => (my_obj = { ...my_obj, [t.id]: 'b' }));
      storeEvents.forEach((event: any) => {
        if (!selectedCalendarsIds.includes(event.activity0Id)) {
          event.resourceIds.forEach((r: any) => (my_obj[r] = 'a'));
        }
      });
      resources = resources.map((r: any) => ({ ...r, td: my_obj[r.id] }));

      if (hasStoreSettingsValues && !isOnboarding) {
        resources = resources.filter((res: any) => !res.waitlisted);
      } else {
        resources = resources.filter(
          (res: any) =>
            onboardingSelection.some((item) => item?.value === res.id) ||
            !res.waitlisted,
        );
      }

      return resources;
    })();

    nextCalendarResources.current = calendarResources;
    syncCalendar();
  }, [
    calendarApi,
    isolatedResources,
    subgroupsFilter,
    roleFilter,
    storeEvents,
    storeFrontendRolesHierarchy,
    filteredResources,
    lazyResourcesFetchStatus,
    lazyResourcesFetchCount,
    activityResources,
    locationResources,
    blockResources,
    currentBranchTeamsHierarchy,
    storeCurrentBranches,
    storeExpandedResources,
    storeSelectedCalendarsActivity,
    storeSettingsValuesTeamSeparation,
    storeStatisticsIndividualUsers,
    hasStoreSettingsValues,
    isOnboarding,
    onboardingSelection,
    currentUser,
    syncCalendar,
    storeGroupResourcesByRole,
  ]);
}
