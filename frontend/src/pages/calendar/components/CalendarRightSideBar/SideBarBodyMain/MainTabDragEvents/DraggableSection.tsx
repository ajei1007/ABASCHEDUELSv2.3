import { memo, type FC } from 'react';
import { Stack, Typography } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useAppSelector } from 'store/hooks';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import { intersectArrays } from '../../../../utils/intersectArrays';
import { minutesToTime } from '../../../../utils/minutesToTime';
import s from 'pages/calendar/Calendar.module.scss';

export interface IDraggableSectionProps {
  dragOptionActivity: {
    value: string;
    label: string;
  };
  dragOptionLocation: {
    value: string;
    label: string;
  };
}

export const DraggableSection: FC<IDraggableSectionProps> = ({
  dragOptionActivity,
  dragOptionLocation,
}) => {
  const storeLazyResources = useAppSelector(
    (state) => state.calendar.lazyResources,
  );
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const storeLocationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const storeFrontendRolesHierarchy = useAppSelector(
    (state) => state.calendar.frontend_roles_hierarchy,
  );

  const isolatedResources = useAppSelector(
    (state) => state.settings.settingValues.isolatedResources,
  );
  const roleFilter = useAppSelector(
    (state) => state.settings.settingValues.roleFilter,
  );
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );

  const filterResources = ({
    resources,
    resourceType,
  }: {
    resources: any[];
    resourceType: string[];
  }) => {
    return resources.filter((e) => {
      let bol1 = true;
      let bol2 = false;
      let bol3 = false;
      if (isolatedResources.length !== 0) {
        bol1 = isolatedResources.some((item) => item?.value === e.id);
      }
      for (let index = 0; index < e.roles.length; index++) {
        const element = e.roles[index];
        if (
          storeFrontendRolesHierarchy[element] &&
          intersectArrays(storeFrontendRolesHierarchy[element], resourceType)
            .length > 0
        ) {
          bol3 = true;
          break;
        }
      }
      if (roleFilter.length !== 0) {
        for (let index = 0; index < e.roles.length; index++) {
          const element = e.roles[index];
          if (
            storeFrontendRolesHierarchy[element] &&
            intersectArrays(storeFrontendRolesHierarchy[element], roleFilter)
              .length > 0
          ) {
            bol2 = true;
            break;
          }
        }
      } else {
        bol2 = true;
      }
      return bol1 && bol2 && bol3;
    });
  };

  const sections = [
    {
      resourceType: 'Activity',
      resources: filterResources({
        resources: storeActivityResources,
        resourceType: ['Activity'],
      }),
    },
    {
      resourceType: 'Client',
      resources: filterResources({
        resources: storeLazyResources,
        resourceType: ['Client'],
      }),
    },
    {
      resourceType: 'Employee',
      resources: filterResources({
        resources: storeLazyResources,
        resourceType: ['Employee'],
      }),
    },
    {
      resourceType: 'Location',
      resources: filterResources({
        resources: storeLocationResources,
        resourceType: ['Location'],
      }),
    },
  ].filter((section) => section.resources.length > 0);

  return (
    <>
      {sections.map(({ resourceType, resources }, index) => (
        <Stack key={resourceType}>
          <Typography fontSize={'0.85rem'} mt={index !== 0 ? '1rem' : '0'}>
            {resourceType}
          </Typography>
          {resources.map((event) => {
            const resourceColor =
              resourceType !== 'Activity' && resourceType !== 'Location'
                ? '#4d53e0'
                : event.color;
            const defaultDuration =
              typeof event?.defaultDuration === 'number'
                ? event?.defaultDuration
                : 60;
            return (
              <div
                id={event.id}
                data-event={JSON.stringify({
                  classNames: ['bg-gray', 'text-red'],
                  title: event.title,
                  duration: minutesToTime(defaultDuration),
                  draggableActivityId: dragOptionActivity?.value,
                  draggableLocationId: dragOptionLocation?.value,
                })}
                className={`${
                  !isOptimizerResultsPreviewMode
                    ? 'external-event draggable'
                    : ''
                } ${resourceType}`}
                key={`${event.id}-${resourceType}`}
              >
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing='0.5rem'
                  className={s.customExternalEvent}
                  key={event.id}
                >
                  <FiberManualRecordIcon
                    style={{ color: resourceColor }}
                    id='maketea1'
                    fontSize='small'
                  />
                  <span>{event.title}</span>
                </Stack>
              </div>
            );
          })}
        </Stack>
      ))}
    </>
  );
};

DraggableSection.displayName = 'DraggableSection';

export default memo(DraggableSection);
