import { useCallback } from 'react';
import role_permissions from 'helpers/role_permissions';
import { appendVisibleResource } from 'store/slices/calendar/actions';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import socket from 'services/socket';
import CalendarResourceLabelItem from '../../components/CalendarResourceLabelItem';
import CalendarResourceLabelSolutionGenerate from '../../components/CalendarResourceLabelSolutionGenerate';
import CalendarResourceLabelLoader from '../../components/CalendarResourceLabelLoader';
import { useFullcalendarApiContext } from '../../context/FullcalendarApiContext';
import { useCalendarViewContext } from '../../context/CalendarViewContext';
import { useCalendarSelectedResourcesContext } from '../../context/CalendarSelectedResourcesContext';

export function useFullcalendarConfigResourceLabelContent({
  hasCurrentDayHaveOptimizerJob,
  handleClickEditButton,
}: {
  hasCurrentDayHaveOptimizerJob: boolean;
  handleClickEditButton: (id: string, resourceType: string) => void;
}) {
  const dispatch = useAppDispatch();
  const storeVisibleResources = useAppSelector(
    (state) => state.calendar.visibleResources,
  );
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  const { calendarApi, updateCalendarSize } = useFullcalendarApiContext();

  // Context for selected resources
  const { selectedResources } = useCalendarSelectedResourcesContext();

  // Context for active day and view
  const { activeView } = useCalendarViewContext();

  const updateStoreVisibleResources = useLatestCallback(
    ({ resourceId, isPerson }: { resourceId: string; isPerson: boolean }) => {
      if (
        storeVisibleResources.some((resource) => resource.id === resourceId)
      ) {
        return;
      }

      if (isPerson) {
        // SOCKET CODE
        socket.emit('join_room', resourceId);
      }

      dispatch(
        appendVisibleResource({
          id: resourceId,
          person: isPerson,
        }),
      );
    },
  );

  const resourceLabelContent = useCallback(
    (arg: any) => {
      const id = arg.resource.id;
      const title = arg.resource.title;
      const resourceType = arg.resource.extendedProps.type;
      const subgroupIcons = arg.resource.extendedProps.subgroup_icons;
      const callout = arg.resource.extendedProps.callout;
      const waitlisted = arg.resource.extendedProps.waitlisted;
      const email = arg.resource.extendedProps.email;
      const email1 = arg.resource.extendedProps.email1;
      const email2 = arg.resource.extendedProps.email2;

      const calloutBranchName =
        arg.resource.extendedProps?.callout_branch?.name ?? '';
      const calloutColor = arg.resource.extendedProps.callout_green
        ? '#43bc13'
        : 'red';

      if (Array.isArray(arg.resource.extendedProps?.roles)) {
        const isPerson =
          arg.resource.extendedProps?.roles?.includes('Person') || false;
        window.queueMicrotask(() => {
          updateStoreVisibleResources({
            resourceId: arg.resource.id,
            isPerson,
          });
        });
      }

      updateCalendarSize();

      if (
        role_permissions(currentUser, 'createEvent') &&
        !arg.resource.extendedProps.a &&
        !arg.resource.extendedProps.branch &&
        !arg.resource.extendedProps.loader &&
        !arg.resource.extendedProps.empty
      ) {
        return (
          <CalendarResourceLabelItem
            key={id}
            activeView={activeView}
            id={id}
            title={title}
            email={email}
            email1={email1}
            email2={email2}
            checked={selectedResources.some((item) => item?.value === id)}
            currentUser={currentUser}
            resourceType={resourceType}
            callout={callout}
            calloutBranchName={calloutBranchName}
            calloutColor={calloutColor}
            waitlisted={waitlisted}
            hasCurrentDayHaveOptimizerJob={hasCurrentDayHaveOptimizerJob}
            subgroupIconsJson={JSON.stringify(subgroupIcons)}
            handleClickEditButton={handleClickEditButton}
          />
        );
      } else if (arg.resource.extendedProps.a) {
        const resourceId = arg.resource?.extendedProps?.resourceId;
        return (
          <CalendarResourceLabelSolutionGenerate
            key={`${id}-sol-gen`}
            resourceId={resourceId}
            updateCalendarSize={updateCalendarSize}
          />
        );
      } else if (arg.resource.extendedProps.branch) {
        return <span>{title}</span>;
      } else if (arg.resource.extendedProps.loader) {
        const currentViewType = calendarApi?.view?.type;
        const viewType = arg.resource.extendedProps.viewType;
        return (
          <CalendarResourceLabelLoader
            key={`${id}-${viewType}`}
            branchId={arg.resource.extendedProps.branchId}
            resourceType={arg.resource.extendedProps.type}
            shouldFetch={currentViewType === viewType}
            updateCalendarSize={updateCalendarSize}
          />
        );
      } else if (arg.resource.extendedProps.empty) {
        return (
          <p
            style={{
              textAlign: 'center',
              margin: 0,
              color: '#999',
              fontStyle: 'italic',
            }}
          >
            No members
          </p>
        );
      } else {
        return <span>{title}</span>;
      }
    },
    [
      calendarApi,
      activeView,
      selectedResources,
      currentUser,
      hasCurrentDayHaveOptimizerJob,
      updateStoreVisibleResources,
      updateCalendarSize,
      handleClickEditButton,
    ],
  );

  return resourceLabelContent;
}
