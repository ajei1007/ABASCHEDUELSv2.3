import { useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { selectSolutionGeneratorJobs } from 'store/slices/solutionGenerator';
import ReactDOMServer from 'react-dom/server';
import TAGS_TYPES_WITH_ICONS from '../../utils/tagsWithIcons';

// Function to show tooltip
function showTooltip(event: Event) {
  const tooltip = document.querySelector('.customTooltip') as HTMLElement;
  const target = event.currentTarget as HTMLElement;
  if (!target || !tooltip) {
    return;
  }

  const tooltipText = target.getAttribute('data-tooltip');
  tooltip.innerHTML = tooltipText ?? '';

  // Add broken constraints to tooltip
  const tooltipTextBrokenConstraints = target.getAttribute(
    'data-tooltip-broken-constraints',
  );
  if (tooltipTextBrokenConstraints) {
    tooltip.innerHTML += `<br/> ${tooltipTextBrokenConstraints}`;
  }

  // Calculate position
  const { top, left } = target.getBoundingClientRect();
  const tooltipHeight = tooltip.offsetHeight;

  // Position the tooltip above the element if it has space or below if not
  const tooltipTop = top - tooltipHeight - 8; // 8px for a little spacing from the element
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${tooltipTop}px`;

  tooltip.classList.add('show');
}

// Function to hide tooltip
function hideTooltip() {
  const tooltip = document.querySelector('.customTooltip') as HTMLElement;
  tooltip?.classList.remove('show');
}

export function useFullcalendarConfigEventDidMount() {
  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const storeExpandedResources = useAppSelector(
    (state) => state.calendar.expandedResources,
  );
  const storeSolutionGeneratorJobs = useAppSelector(
    selectSolutionGeneratorJobs,
  );
  const storeLazyResources = useAppSelector(
    (state) => state.calendar.lazyResources,
  );

  const eventDidMount = useLatestCallback((info: any) => {
    if (info?.event?.display === 'background') {
      info?.el?.setAttribute('data-qa', 'calendar-availability');
    } else {
      info?.el?.setAttribute('data-qa', 'calendar-event');
    }

    const resourceIds = Array.from<string>(
      info?.event?._def?.resourceIds || [],
    );
    const currentBranchId = storeCurrentBranches[0]?.value;

    const expandedResourceFcElement = (() => {
      if (
        storeExpandedResources.length === 0 ||
        info?.event?.display !== 'background'
      ) {
        return null;
      }

      if (
        !storeExpandedResources.some(({ id }) => resourceIds.includes(`${id}a`))
      ) {
        return null;
      }

      return document
        .querySelector(`.event-id-${info?.event?.id}`)
        ?.closest('.fc-resource');
    })();

    if (expandedResourceFcElement) {
      const runningSolutionGeneratorJob = (() => {
        for (const resourceId of resourceIds) {
          const rId = `${resourceId}`.slice(0, 36);
          const jobKey = `${rId}__${currentBranchId}`;
          const job = storeSolutionGeneratorJobs[jobKey];
          if (job && job.status !== 'success') {
            return job;
          }
        }
        return null;
      })();

      if (!runningSolutionGeneratorJob) {
        expandedResourceFcElement.classList.remove(
          'sol-gen-loading',
          'sol-gen-failed',
        );
      } else if (runningSolutionGeneratorJob.status === 'loading') {
        expandedResourceFcElement.classList.add('sol-gen-loading');
        expandedResourceFcElement.classList.remove('sol-gen-failed');
      } else if (runningSolutionGeneratorJob.status === 'failed') {
        expandedResourceFcElement.classList.add('sol-gen-failed');
        expandedResourceFcElement.classList.remove('sol-gen-loading');
      }
    }

    if (!info.isDragging && info?.timeText && info) {
      let tooltipText = '';
      if (info.event.extendedProps.av) {
        tooltipText = info.event?.title
          ? `${info.timeText} | ${info.event.title}`
          : '';
        if (info.event.extendedProps.reasons) {
          tooltipText = `${tooltipText} | Conflict Reasons: ${info.event.extendedProps.reasons.map(
            (t: any) => t.reason,
          )}`;
        }
        tooltipText += ` | Priority: ${
          info.event.extendedProps.priority >= 100
            ? '-'
            : info.event.extendedProps.priority
        }`;
      } else {
        tooltipText = `${info.timeText} ${info?.event?.extendedProps.titleTooltip}`;
      }
      const targetElements = document.querySelectorAll(
        `.event-id-${info?.event?.id}`,
      );
      const brokenConstraintsList =
        info.event.extendedProps.brokenConstraintsList;
      targetElements.forEach((targetElement) => {
        targetElement.setAttribute('data-tooltip', tooltipText);

        if (brokenConstraintsList) {
          targetElement.setAttribute(
            'data-tooltip-broken-constraints',
            brokenConstraintsList,
          );
        }

        if (info?.event?.id) {
          targetElement.setAttribute('data-event-id', info?.event?.id);
        }
        // targetElement.addEventListener('mouseenter', showTooltip);
        targetElement.addEventListener('mousemove', showTooltip);
        targetElement.addEventListener('mouseleave', hideTooltip);

        if (info.isDragging) return;
        const closest = targetElement.closest('.fc-resource');
        const ttt = targetElement.querySelector('.fc-event-title');
        const eventTime = targetElement.querySelector('.fc-event-time');

        let colorName = info?.event?._def?.extendedProps?.newColor ?? 'black';
        if (colorName && colorName[0] === '#') {
          colorName = colorName.slice(1);
        }
        let cancellationClassName = `canceledRed-${colorName}`;

        if (closest) {
          const resourceId = closest.getAttribute('data-resource-id');
          const resourceTitle = closest.getAttribute('data-resource-title');
          const resourceType = closest.getAttribute('data-resource-type');

          info?.el?.setAttribute('data-resource-id', resourceId || '');
          info?.el?.setAttribute('data-resource-title', resourceTitle || '');
          info?.el?.setAttribute('data-resource-type', resourceType || '');

          const [startTime, endTime] = (info?.timeText || '')
            ?.split(' - ')
            .map((t: string) => t.trim())
            .filter(Boolean) as string[];

          if (startTime && endTime) {
            info?.el?.setAttribute(
              'data-start-time',
              startTime.endsWith('m') ? startTime : `${startTime}m`,
            );
            info?.el?.setAttribute(
              'data-end-time',
              endTime.endsWith('m') ? endTime : `${endTime}m`,
            );
          }

          const eventActivity = info?.event?.extendedProps?.activity;
          if (eventActivity) {
            info?.el?.setAttribute('data-activity', eventActivity);
          }

          const eventActivityId = info?.event?.extendedProps?.activity0Id;
          if (eventActivityId) {
            info?.el?.setAttribute('data-activity-id', eventActivityId);
          }

          // Updating classnames
          if (resourceId !== info?.event?.extendedProps?.user_canceled) {
            cancellationClassName = `canceled-${colorName}`;
          }

          // Making Event Title
          let names: any[] = [];
          let IconHTML = '';

          const eventUsers = info?.event?.extendedProps?.users;
          let iconNames: any[] = [];
          if (eventUsers) {
            eventUsers.forEach((id: any, index: number) => {
              if (id !== resourceId) {
                const user = storeLazyResources.find((e) => e.id === id);
                if (user && user !== -1) {
                  iconNames = [
                    ...iconNames,
                    ...user?.subgroup_icons?.map((t: any) => t[1]),
                  ];
                }
                if (info.event.extendedProps.users_names[index]) {
                  names.push(info.event.extendedProps.users_names[index]);
                }
              }
            });
          }
          if (iconNames.length > 0) {
            IconHTML = ReactDOMServer.renderToStaticMarkup(
              TAGS_TYPES_WITH_ICONS.find((e) => e.label === iconNames[0])?.icon,
            );
          }
          let title_new = names.join(' - ');

          title_new = `${title_new}`;
          const notes = info.event?.extendedProps?.notes;

          if (notes) {
            title_new = `${title_new} NOTES: ${notes}`;
          }

          if (info.event.extendedProps.av) {
            ttt!.textContent = info.event?.title ?? '';
          } else {
            ttt!.textContent = title_new;
          }
          const eventTimeTextContent = eventTime?.textContent;
          if (IconHTML !== '') {
            eventTime!.innerHTML = `${IconHTML} ${eventTimeTextContent}`;
          }
        } else {
          ttt!.textContent = info?.event?.title;
        }

        if (
          info?.event?.extendedProps?.user_canceled ||
          info?.event?.extendedProps?.reason_canceled
        ) {
          targetElement.classList.add(cancellationClassName);
          info?.el?.setAttribute('data-qa', 'calendar-event-canceled');
          info?.el?.setAttribute('data-event-status', 'canceled');
        }
      });
    }
  });

  return eventDidMount;
}
