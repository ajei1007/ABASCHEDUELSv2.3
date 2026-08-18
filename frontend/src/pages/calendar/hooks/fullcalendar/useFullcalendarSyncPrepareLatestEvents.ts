import { useEffect, useMemo } from 'react';
import moment from 'moment';
import { useAppSelector } from 'store/hooks';
import {
  optimizerDeletingEventsSelector,
  isOptimizerResultsPreviewModeSelector,
  optimizerCreatingUpdatingEventsSelector,
  optimizerUpdatingEventsIdsSetSelector,
  optimizerDeletingEventsIdsSetSelector,
  optimizerResultsSelectedIdsMapSelector,
} from 'store/selectors/optimizerSelectors';
import { selectSolutionGeneratorJobs } from 'store/slices/solutionGenerator';
import role_permissions from 'helpers/role_permissions';
import daysOfWeek from 'constants/daysOfWeek';
import {
  solutionGeneratorSortOptions,
  PERSON_RESOURCE_TYPES,
  highlightRecentlyChangedTimeWindowOptions,
} from '../../constants';
import { isDateRangeRecurring } from 'utils/isDateRangeRecurring';
import { intersectArrays } from '../../utils/intersectArrays';
import {
  parseTimeWindowValueToMinutes,
  validateTimeWindowValue,
} from '../../utils/highlightRecentlyChangedTimeWindow';
import { useFullcalendarApiContext } from '../../context/FullcalendarApiContext';
import { useCalendarViewContext } from '../../context/CalendarViewContext';
import { useCalendarCopyModeContext } from '../../context/CalendarCopyModeContext';
import { useCalendarSelectedEventsContext } from '../../context/CalendarSelectedEventsContext';
import { useCalendarOptimizerJobUtilsContext } from '../../context/CalendarOptimizerJobUtilsContext';
import { useCurrentDaysOptimizerJob } from '../../hooks/useCurrentDaysOptimizerJob';
import { useSolGenPossibleEvents } from '../../hooks/useSolGenPossibleEvents';
import { constraintMessage } from '../../constants/constraintMessage';

export function useFullcalendarSyncPrepareLatestEvents({
  currentBranchTeamsHierarchy,
  nextCalendarEvents,
  syncCalendar,
}: {
  currentBranchTeamsHierarchy: Record<string, any>;
  nextCalendarEvents: React.MutableRefObject<any[] | null>;
  syncCalendar: () => void;
}) {
  const storeEvents = useAppSelector((state) => state.calendar.events);
  const storeExpandedResources = useAppSelector(
    (state) => state.calendar.expandedResources,
  );
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

  const storeSelectedCalendars = useAppSelector(
    (state) => state.calendar.selectedCalendars,
  );
  const storeAvailabilities = useAppSelector(
    (state) => state.calendar.availabilities,
  );

  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );

  const calendarIncludeDeleted = useAppSelector(
    (state) => state.calendar.includeDeleted,
  );

  const storeSettingsValuesHideCancelations = useAppSelector(
    (state) => state.settings.settingValues.hideCancelations,
  );

  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );

  const settingsHighlightRecentlyChanged = useAppSelector(
    (state) => state.settings.settingValues.highlightRecentlyChanged,
  );
  const settingsHighlightRecentlyChangedHideOtherEvents = useAppSelector(
    (state) =>
      state.settings.settingValues.highlightRecentlyChangedHideOtherEvents,
  );
  const settingsHighlightRecentlyChangedTimeWindow = useAppSelector(
    (state) =>
      state.settings.settingValues?.highlightRecentlyChangedTimeWindow ??
      highlightRecentlyChangedTimeWindowOptions[0].value,
  );

  const isolatedResources = useAppSelector(
    (state) => state.settings.settingValues.isolatedResources,
  );

  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const isFlaggingEnabled = useAppSelector(
    (state) => state.flagging.flaggingEnabled,
  );

  const activeCheckbox = useAppSelector((state) => state.calendar.active);

  const flaggingDataConstraints = useAppSelector(
    (state) => state.flagging?.flaggingData?.constraints,
  );

  const storeOptimizerDeletingEvents = useAppSelector(
    optimizerDeletingEventsSelector,
  );
  const storeOptimizerCreatingUpdatingEvents = useAppSelector(
    optimizerCreatingUpdatingEventsSelector,
  );
  const storeOptimizerUpdatingEventsIdsSet = useAppSelector(
    optimizerUpdatingEventsIdsSetSelector,
  );
  const storeOptimizerDeletingEventsIdsSet = useAppSelector(
    optimizerDeletingEventsIdsSetSelector,
  );
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );
  const storeOptimizerResultsSelectedIdsMap = useAppSelector(
    optimizerResultsSelectedIdsMapSelector,
  );

  const storeSolutionGeneratorJobs = useAppSelector(
    selectSolutionGeneratorJobs,
  );

  // Context for FullCalendar API
  const { calendarApi } = useFullcalendarApiContext();

  // Context for active day and view
  const { activeDay, activeView } = useCalendarViewContext();

  // Context for copy mode
  const { copyModeActive } = useCalendarCopyModeContext();

  const { selectedEvents } = useCalendarSelectedEventsContext();

  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  const { hasCurrentDayHaveOptimizerJob } = useCurrentDaysOptimizerJob();

  const highlightRecentlyChangedTimeWindow = useMemo(
    () =>
      parseTimeWindowValueToMinutes(
        validateTimeWindowValue(settingsHighlightRecentlyChangedTimeWindow)
          ? settingsHighlightRecentlyChangedTimeWindow
          : highlightRecentlyChangedTimeWindowOptions[0].value,
        storeSettingsValuesTimezone,
      ),
    [settingsHighlightRecentlyChangedTimeWindow, storeSettingsValuesTimezone],
  );

  const { solGenPossibleEvents, possibleEventsBgColors } =
    useSolGenPossibleEvents({
      sortOption: solutionGeneratorSortOptions[0].value,
    });

  const eventGroupMemberCountsMap = useMemo(
    () =>
      storeEvents.reduce((acc, event) => {
        let oldCount = 0;
        if (acc.has(event.eventGroupId)) {
          oldCount = acc.get(event.eventGroupId);
        }
        acc.set(event.eventGroupId, oldCount + 1);
        return acc;
      }, new Map<string, number>()) as Map<string, number>,
    [storeEvents],
  );

  const optimizerToBeDeletedEvents = useMemo(
    () =>
      storeEvents.filter(
        (e) =>
          storeOptimizerUpdatingEventsIdsSet.has(e.id) ||
          storeOptimizerDeletingEventsIdsSet.has(e.id),
      ),
    [
      storeEvents,
      storeOptimizerUpdatingEventsIdsSet,
      storeOptimizerDeletingEventsIdsSet,
    ],
  );

  // TODO refactor
  useEffect(() => {
    if (calendarApi === null) {
      return;
    }

    const events = (() => {
      const view_type = calendarApi.view.type;
      const events_not = Object.values(storeSelectedCalendars).flatMap((e) =>
        e.map((t) => t.id),
      );
      const events_not_a = [...events_not].map((r) => `${r}a`);

      let events = window
        .structuredClone(storeEvents)
        .filter((e: any) => {
          if (isolatedResources?.length > 0) {
            const isolatedResourceIds = isolatedResources.map((r) => r.value);
            return (
              intersectArrays(e?.resourceIds, isolatedResourceIds)?.length !== 0
            );
          }
          return (
            intersectArrays(e.resourceIds, events_not).length === 0 &&
            !e.status &&
            e.status !== 'Declined'
          );
        })
        .filter((event: any) => {
          // Exclude optimizer result events for further processing
          if (
            storeOptimizerUpdatingEventsIdsSet.has(event.id) ||
            storeOptimizerDeletingEventsIdsSet.has(event.id)
          ) {
            return false;
          }

          // Handle deleted events filtering
          if (event.deletedAt) {
            // If include deleted is disabled, only show recently deleted events when highlight feature is active
            if (!calendarIncludeDeleted) {
              // When highlight recently changed is enabled, show deleted events within the time window
              if (settingsHighlightRecentlyChanged) {
                const timeWindowStart = moment
                  .utc()
                  .subtract(highlightRecentlyChangedTimeWindow, 'minutes');

                return moment
                  .utc(event.deletedAt)
                  .isSameOrAfter(timeWindowStart);
              }

              // Otherwise, hide all deleted events
              return false;
            }
          }

          // Filter events based on "highlight recently changed" settings
          if (
            settingsHighlightRecentlyChanged &&
            settingsHighlightRecentlyChangedHideOtherEvents
          ) {
            const timeWindowStart = moment
              .utc()
              .subtract(highlightRecentlyChangedTimeWindow, 'minutes');

            // Check if the event has recent activity within the time window
            const hasRecentActivity = [
              event.createdAt,
              event.updatedAt,
              event.deletedAt,
            ]
              .filter(Boolean)
              .some((timestamp) =>
                moment.utc(timestamp).isSameOrAfter(timeWindowStart),
              );

            // Hide events without recent activity when "hide other events" is enabled
            if (!hasRecentActivity) {
              return false;
            }
          }

          return true;
        })
        .flatMap((e: any) => {
          const supervisionActivities = storeActivityResources.filter(
            (item) => item.supervision,
          );
          const hasNotEventActivitySupervision =
            supervisionActivities.findIndex((r) => r.id === e.activity0Id) ===
            -1;
          let constraint = null;
          let parentId = null;
          if (!hasNotEventActivitySupervision) {
            const parent = storeEvents.find((p) => p?.supervisionId === e.id);
            if (parent) {
              parentId = parent.id;

              // Disabling drag&drop possibility for supervision events (maybe temporarily until appropriate behavior is found)
              constraint = {
                startTime: moment(e.startUTC).format('HH:mm'),
                endTime: moment(e.endUTC).format('HH:mm'),
              };
              e.durationEditable = false;
              e.editable = false;
              e.startEditable = false;
              e.resourceEditable = false;
              e.interactive = false;
            }
          }

          if (
            isOptimizerResultsPreviewMode ||
            hasCurrentDayHaveOptimizerJob ||
            hasOptimizerJobRunning(e, {
              getStartDate: (e) => e.startRecur,
              getEndDate: (e) => e.endRecur,
            })
          ) {
            e.durationEditable = false;
            e.editable = false;
            e.startEditable = false;
            e.resourceEditable = false;
            e.interactive = false;
          }

          let supervisionEvent = null;
          if (e?.supervisionId) {
            const sEvent = storeEvents.find((p) => p.id === e.supervisionId);
            if (sEvent) {
              supervisionEvent = {
                supervisionActivity: sEvent.activity0Id,
                supervisionUsers: sEvent.users,
                supervisionStartTime: sEvent.startUTC,
                supervisionEndTime: sEvent.endUTC,
                supervisionEvent_canceled: sEvent.canceled,
                supervisionEvent_reasonCanceled: sEvent.reason_canceled,
                supervisionEvent_userCanceled: sEvent.user_canceled,
              };
            }
          }

          let className = [];
          if (
            copyModeActive &&
            selectedEvents.filter(
              (p) =>
                p &&
                (p.id === e.id ||
                  // Hightlight supervision when supervised event is selected
                  p?.extendedProps?.supervisionId === e.id),
            ).length > 0
          ) {
            className.push('selectedEvent');
            e.borderColor = 'orange';
            e.groupId = '1';
          } else {
            delete e.groupId;
            e.borderColor = e.sandboxMode ? 'white' : e.borderLocationColor;
          }

          const startTime = moment(e.start_real)
            .tz(storeSettingsValuesTimezone)
            .format('HH:mm');

          const dtstart = `${moment(e.startRecur).format(
            `YYYY-MM-DD`,
          )} ${startTime}`;

          if (isOptimizerResultsPreviewMode) {
            className.push('eventDimmed');
          }

          if (e.sandboxMode) {
            className.push('sandboxedEvent');
          }

          if (isFlaggingEnabled) {
            const allBrokenSessions = flaggingDataConstraints
              ?.filter((c) => c.broken && c?.brokenSessions)
              ?.filter((c) => {
                const isEventBroken = c?.brokenSessions.find(
                  (constraint: any) => constraint.eventId === e.id,
                );
                return isEventBroken;
              });
            if (allBrokenSessions?.length) {
              className.push('eventBroken');
              const messages = allBrokenSessions.map((c) =>
                constraintMessage(c),
              );
              e.brokenConstraintsList = messages.join('<br/>');
            }
          }

          if (e.deletedAt) {
            className.push('includeDelete');
            e.durationEditable = false;
            e.editable = false;
            e.startEditable = false;
            e.resourceEditable = false;
            e.interactive = false;
          }

          const eventGroupMemberCount =
            eventGroupMemberCountsMap.get(e.eventGroupId) || 1;

          if (
            !['Day_Timeline', 'resourceTimeGridDay'].includes(view_type) &&
            (isDateRangeRecurring(e.endRecur1, e.startRecur1) ||
              eventGroupMemberCount > 1)
          ) {
            e.durationEditable = false;
            e.editable = false;
            e.startEditable = false;
            e.resourceEditable = false;
            e.interactive = false;
          }

          if (settingsHighlightRecentlyChanged) {
            // Calculate the time window threshold based on the configured time window
            const timeWindowStart = moment
              .utc()
              .subtract(highlightRecentlyChangedTimeWindow, 'minutes');

            // Helper function to check if a timestamp is within the recent activity window
            const isWithinTimeWindow = (timestamp: string) =>
              timestamp && moment.utc(timestamp).isSameOrAfter(timeWindowStart);

            // Highlight events based on recent activity within the configured time window
            // Priority order: deleted (highest) > updated > created (lowest)
            // This ensures the most significant recent change is visually represented

            // Check if event was recently deleted - highest priority highlighting
            if (e.deletedAt && isWithinTimeWindow(e.deletedAt)) {
              className.push('eventHighlightRecentlyDeleted');
            }
            // Check if event was recently updated - only if updated after creation
            else if (
              e.updatedAt &&
              isWithinTimeWindow(e.updatedAt) &&
              // Ensure the update timestamp is actually after creation to avoid false positives
              moment.utc(e.updatedAt).isAfter(moment.utc(e.createdAt))
            ) {
              className.push('eventHighlightRecentlyUpdated');
            }
            // Check if event was recently created - lowest priority highlighting
            else if (e.createdAt && isWithinTimeWindow(e.createdAt)) {
              className.push('eventHighlightRecentlyCreated');
            } else {
              className.push('eventHighlightRecentlyUnchanged');
            }
          }

          let obj_now = {
            // title: 'my recurring event',
            backgroundColor: e.newColor,
            className,
            ...e,
            titleTooltip: e.title,
            rrule: {
              freq: 'weekly',
              interval: 1,
              byweekday: [
                ...new Set([
                  ...e.daysOfWeek_real.map((t: number) =>
                    t === 0 ? 6 : t - 1,
                  ),
                ]),
              ],
              dtstart,
              until: moment(e.endRecur).format('YYYY-MM-DD'),
            },
            parentId,
            supervisionId: e.supervisionId,
            ...supervisionEvent,
          };

          if (view_type === 'listDay') {
            return {
              ...obj_now,
              resourceIds: e.resourceIds,
            };
          }

          return [
            {
              ...obj_now,
              ...(constraint && {
                constraint: {
                  ...constraint,
                },
              }),
            },
          ];
        });

      // If Active False -> Hide Non Deleted , Non Canceled events
      if (!activeCheckbox) {
        events = events.filter((t: any) => {
          if (!t.reason_canceled && !t.deletedAt) {
            return false;
          } else {
            return true;
          }
        });
      }

      if (storeSettingsValuesHideCancelations) {
        events = events.filter((t: any) => {
          if (t.reason_canceled && t.reason_canceled.length > 0) {
            return false;
          } else {
            return true;
          }
        });
      }

      let selected_resource_ids: any[] = [];
      if (view_type === 'Day_Timeline' || view_type === 'Week_Timeline') {
        const nonPersonResources = [
          ...storeActivityResources,
          ...storeLocationResources,
          ...storeBlockResources,
        ];

        selectedEvents
          .filter((t) => t)
          .forEach((s: any) => {
            const userIds = s._def.resourceIds.map((o: any) => o.slice(0, -1));
            selected_resource_ids = [
              ...new Set([
                ...selected_resource_ids,
                // TODO: needs to be checked
                ...userIds.filter(
                  (p: any) => !!nonPersonResources.find((t) => t.id === p),
                ),
              ]),
            ];
          });

        let poss_events = solGenPossibleEvents.filter(
          (e) => intersectArrays(e.resourceIds, events_not_a).length === 0,
        );

        let poss_unposs_events = poss_events.map((e) => {
          const possibleEvent = { ...e };
          const currentBranchId = storeCurrentBranches[0]?.value;
          const resourceIds = Array.from<string>(
            possibleEvent?.resourceIds || [],
          ).map((id) => `${id}`.slice(0, 36));

          const hasRunningSolutionGeneratorJob = resourceIds.some(
            (resourceId) => {
              const jobKey = `${resourceId}__${currentBranchId}`;
              const job = storeSolutionGeneratorJobs[jobKey];
              return job && job.status !== 'success';
            },
          );

          if (hasRunningSolutionGeneratorJob) {
            possibleEvent.className = [
              'eventDimmed',
              'eventSolutionGeneratorRunning',
              'skeleton-wave',
            ];
          }

          const solution_bol = Object.keys(possibleEventsBgColors).includes(
            possibleEvent.id,
          );

          if (possibleEvent.matched) {
            possibleEvent.backgroundColor = solution_bol
              ? possibleEventsBgColors[e.id]
              : 'white';
            possibleEvent.backgroundColor_real = 'white';
            possibleEvent.backgroundColor2 =
              possibleEventsBgColors[possibleEvent.id];

            if (possibleEvent.ov === 't') {
              possibleEvent.backgroundColor = solution_bol
                ? possibleEventsBgColors[possibleEvent.id]
                : 'yellow';
              possibleEvent.backgroundColor_real = 'yellow';
              possibleEvent.backgroundColor2 =
                possibleEventsBgColors[possibleEvent.id];
            }

            if (
              selectedEvents
                .map((selectedEvent) => selectedEvent.id)
                .includes(possibleEvent.id)
            ) {
              possibleEvent.borderColor = 'yellow';
            } else {
              possibleEvent.borderColor = 'black';
            }
            possibleEvent.textColor = 'black';
            possibleEvent.av = 't';

            if (possibleEvent.possible_replacements_ids) {
              possibleEvent.backgroundColor = 'violet';
            }
            possibleEvent.editable = false;
            possibleEvent.startEditable = false;
            possibleEvent.durationEditable = false;
            possibleEvent.resourceEditable = false;
            possibleEvent.interactive = false;
          } else {
            possibleEvent.backgroundColor = solution_bol
              ? possibleEventsBgColors[possibleEvent.id]
              : 'orange';
            possibleEvent.backgroundColor_real = 'orange';
            possibleEvent.backgroundColor2 =
              possibleEventsBgColors[possibleEvent.id];

            possibleEvent.borderColor = 'black';
            possibleEvent.textColor = 'black';
            possibleEvent.av = 'n';
            if (possibleEvent?.reasons?.length === 0) {
              possibleEvent.av = 't';
              possibleEvent.backgroundColor = 'white';
            }

            if (possibleEvent.ov === 't') {
              possibleEvent.backgroundColor = 'yellow';
              possibleEvent.backgroundColor_real = 'yellow';
              possibleEvent.borderColor = 'orange';
              possibleEvent.av = 't';
            }
          }
          return possibleEvent;
        });

        if (selected_resource_ids.length > 0) {
          poss_unposs_events = poss_unposs_events.filter((o) => {
            if (
              intersectArrays(
                o.resourceIds.map((l: any) => l.slice(0, -1)),
                selected_resource_ids,
              ).length === selected_resource_ids.length
            ) {
              return true;
            }
            return false;
          });
        }

        // Add Possible Events
        events = events.concat(poss_unposs_events);
      }

      if (
        storeOptimizerCreatingUpdatingEvents.length > 0 ||
        storeOptimizerDeletingEvents.length > 0
      ) {
        const optimizerEvents = storeOptimizerCreatingUpdatingEvents.map(
          (e) => {
            const title = [e.employee, e.client, e.activity, e.location]
              .filter((x) => x)
              .join(' - ');
            const startTime = moment(e.start)
              .tz(storeSettingsValuesTimezone)
              .format('HH:mm');
            const dtstart = `${moment(e.startRecur).format(
              `YYYY-MM-DD`,
            )} ${startTime}`;

            const className: string[] = [
              e.type === 'create'
                ? 'eventOptimizerToCreated'
                : 'eventOptimizerToUpdated',
            ];

            if (!storeOptimizerResultsSelectedIdsMap[e.id]) {
              className.push('eventOptimizerExcluded');
            }

            const users = [
              ...e.resourceIds,
              e.activity0Id,
              e.location0Id,
            ].filter((x) => x);

            const users_names = [
              e.employee,
              e.client,
              e.activity,
              e.location,
            ].filter((x) => x);

            const employeeResource =
              e?.employee &&
              storeLazyResources.find(
                (r) => `${r.title}`.trim() === `${e.employee}`.trim(),
              );
            const clientResource =
              e?.client &&
              storeLazyResources.find(
                (r) => `${r.title}`.trim() === `${e.client}`.trim(),
              );

            if (
              (employeeResource || clientResource) &&
              users_names.length >= 2
            ) {
              const shouldSwap =
                (clientResource && clientResource?.id === users[0]) ||
                (employeeResource && employeeResource?.id === users[1]);

              if (shouldSwap) {
                [users_names[0], users_names[1]] = [
                  users_names[1],
                  users_names[0],
                ];
              }
            }

            return {
              id: e.type === 'update' ? `${e.id}__u` : e.id,
              eventGroupId: e.type === 'update' ? `${e.id}__u` : e.id,
              start: e.start,
              end: e.end,
              title,
              opResult: true,
              titleTooltip: `${title} (To be ${
                e.type === 'update' ? 'updated' : 'created'
              })`,
              backgroundColor: storeActivityResources.find(
                (r) => r.id === e.activity0Id,
              )?.color,
              className,
              rrule: {
                freq: 'weekly',
                interval: 1,
                byweekday: [
                  ...new Set([
                    ...e.daysOfWeek.reduce((acc: any[], t: string) => {
                      const index = daysOfWeek.findIndex((d) => d.value === t);
                      if (index !== -1) {
                        acc.push(index === 0 ? 6 : index - 1);
                      }
                      return acc;
                    }, [] as any[]),
                  ]),
                ],
                dtstart,
                until: moment(e.endRecur).format('YYYY-MM-DD'),
              },
              resourceIds: users,
              users,
              users_names,
              duration: {
                seconds: moment(e.end).diff(moment(e.start), 'seconds'),
              },
              activity0Id: e.activity0Id,
              location0Id: e.location0Id,
              activity: e.activity,
              client: e.client,
              location: e.location,
              employee: e.employee,
              durationEditable: false,
              editable: false,
              startEditable: false,
              resourceEditable: false,
              interactive: false,
            };
          },
        );

        const optimizerDeletingEvents = optimizerToBeDeletedEvents.map((e) => {
          const startTime = moment(e.start_real)
            .tz(storeSettingsValuesTimezone)
            .format('HH:mm');
          const dtstart = `${moment(e.startRecur).format(
            `YYYY-MM-DD`,
          )} ${startTime}`;
          const className = ['eventOptimizerToDeleted'];
          if (!storeOptimizerResultsSelectedIdsMap[e.id]) {
            className.push('eventOptimizerExcluded');
          }

          return {
            backgroundColor: e.newColor,
            className,
            ...e,
            opResult: true,
            titleTooltip: `${e.title} (To be deleted)`,
            rrule: {
              freq: 'weekly',
              interval: 1,
              byweekday: [
                ...new Set([
                  ...e.daysOfWeek_real.map((t: number) =>
                    t === 0 ? 6 : t - 1,
                  ),
                ]),
              ],
              dtstart,
              until: moment(e.endRecur).format('YYYY-MM-DD'),
            },
            durationEditable: false,
            editable: false,
            startEditable: false,
            resourceEditable: false,
            interactive: false,
          };
        });
        events = [...events, ...optimizerEvents, ...optimizerDeletingEvents];
      }

      const resourceIds = [
        ...storeLazyResources
          .filter((r) => ['Employee', 'Client'].includes(r.type))
          .map((t) => t.id),
        ...storeActivityResources.map((t) => t.id),
        ...storeLocationResources.map((t) => t.id),
        ...storeBlockResources.map((t) => t.id),
        ...storeExpandedResources.map((t) => `${t.id}a`),
      ];

      /* Availabilities bg color */
      if (
        view_type === 'Day_Timeline' ||
        view_type === 'resourceTimeGridDay' ||
        view_type === 'resourceTimeGridWeek' ||
        view_type === 'Week_Timeline'
      ) {
        events = [
          ...events,
          ...resourceIds.map((id) => ({
            id: `${id}a`,
            display: 'background',
            start: new Date('2000-01-01'),
            end: new Date('2300-01-01'),
            resourceIds: [id],
            backgroundColor: 'transparent',
          })),
          ...storeAvailabilities.map((e) => {
            const updatedObj = {
              ...e,
              display: 'background',
              backgroundColor: e.av ? (e.color ?? 'yellow') : 'red',
            };
            return updatedObj;
          }),
        ];
      }

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
      const blankResourceIds = [
        ...super_teams_hierarchy.flatMap((t) => {
          if (level_obj[t] > current_branch_level - 1) {
            return [];
          }
          return PERSON_RESOURCE_TYPES.flatMap((type) => [
            `${t}_${type}`,
            `${t}_${type}_blank`,
          ]);
        }),
        ...PERSON_RESOURCE_TYPES.map((type) => `${type}_blank`),
      ];

      // TODO Why do we need  @ABAschedules ?
      events.push({
        display: 'none',
        start: new Date('2000-01-01'),
        end: new Date('2300-01-01'),
        resourceIds: [
          ...blankResourceIds,
          ...resourceIds,
          ...storeExpandedResources.map((t) => `${t.id}a`),
        ],
      });

      // Make Uneditable If user does not permission to edit event and the calendar is in a week view.
      if (activeDay === 'Week') {
        events = events.map((e: any) => {
          e.durationEditable =
            activeView !== 'Timeline' &&
            role_permissions(currentUser, 'editEvent');
          return e;
        });
      }

      return events;
    })();

    nextCalendarEvents.current = events;
    syncCalendar();
  }, [
    activeDay,
    activeView,
    calendarApi,
    selectedEvents,
    copyModeActive,
    storeOptimizerCreatingUpdatingEvents,
    storeOptimizerUpdatingEventsIdsSet,
    storeOptimizerDeletingEventsIdsSet,
    storeOptimizerDeletingEvents,
    storeOptimizerResultsSelectedIdsMap,
    hasCurrentDayHaveOptimizerJob,
    isOptimizerResultsPreviewMode,
    optimizerToBeDeletedEvents,
    currentUser,
    storeEvents,
    storeCurrentBranches,
    storeSelectedCalendars,
    storeLazyResources,
    storeActivityResources,
    storeLocationResources,
    storeBlockResources,
    storeExpandedResources,
    possibleEventsBgColors,
    solGenPossibleEvents,
    storeAvailabilities,
    isolatedResources,
    storeSettingsValuesTimezone,
    storeSettingsValuesHideCancelations,
    syncCalendar,
    activeCheckbox,
    flaggingDataConstraints,
    isFlaggingEnabled,
    eventGroupMemberCountsMap,
    currentBranchTeamsHierarchy,
    hasOptimizerJobRunning,
    storeSolutionGeneratorJobs,
    calendarIncludeDeleted,
    settingsHighlightRecentlyChanged,
    settingsHighlightRecentlyChangedHideOtherEvents,
    highlightRecentlyChangedTimeWindow,
  ]);
}
