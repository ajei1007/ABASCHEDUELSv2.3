import { useState, useEffect, useCallback, memo, type FC } from 'react';
import { Stack } from '@mui/material';
import { Draggable } from '@fullcalendar/interaction';
import { useAppSelector } from 'store/hooks';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import role_permissions from 'helpers/role_permissions';
import { useFilterResources } from '../../../../hooks/useFilterResources';
import DraggableSection from './DraggableSection';

const MainTabDragEvents: FC = () => {
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const storeLocationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const storeFrontendRolesHierarchy = useAppSelector(
    (state) => state.calendar.frontend_roles_hierarchy,
  );

  const currentUser = useAppSelector((store) => store.auth.currentUser);

  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );

  const [dragOptionActivity, setDragOptionActivity] = useState({
    label: 'Activity',
    value: 'Default',
  });
  const [dragOptionLocation, setDragOptionLocation] = useState({
    label: 'Location',
    value: 'Default',
  });

  const handleDragOptionActivityChange = useCallback((e: any) => {
    setDragOptionActivity(e);
  }, []);

  const handleDragOptionLocationChange = useCallback((e: any) => {
    setDragOptionLocation(e);
  }, []);

  const filterLocationResources = useFilterResources({
    resources: storeLocationResources,
    frontendRolesHierarchy: storeFrontendRolesHierarchy,
  });

  useEffect(() => {
    if (!role_permissions(currentUser, 'createEvent')) {
      return;
    }
    const externalEvents = document.getElementById('calendar-external-events');

    if (!externalEvents) {
      return;
    }

    const _draggable = new Draggable(externalEvents, {
      itemSelector: '.external-event',
    });

    return () => {
      _draggable.destroy();
    };
  }, [currentUser]);

  return (
    <Stack spacing='1rem'>
      <Stack spacing='0.5rem'>
        <CustomSelect
          classNamePrefix='select'
          onChange={handleDragOptionActivityChange}
          value={dragOptionActivity}
          isDisabled={isOptimizerResultsPreviewMode}
          options={storeActivityResources.map((resource) => {
            return {
              value: resource.id,
              label: resource.title,
              resourceTypeId: resource.resourceTypeId,
              type: resource.type,
              color: resource.color,
            };
          })}
        />
        <CustomSelect
          classNamePrefix='select'
          onChange={handleDragOptionLocationChange}
          value={dragOptionLocation}
          isDisabled={isOptimizerResultsPreviewMode}
          options={[
            ...new Set(storeLocationResources.map((e) => e.roles[0])),
          ].map((locations_type) => {
            return {
              label: locations_type,
              options: filterLocationResources([locations_type]).map(
                (resource) => {
                  return {
                    value: resource.id,
                    resourceTypeId: resource.resourceTypeId,
                    label: resource.title,
                    locations_type: resource.location_type,
                    type: resource.type,
                    color: resource.color,
                  };
                },
              ),
            };
          })}
        />
      </Stack>
      <div id='calendar-external-events'>
        <DraggableSection
          dragOptionActivity={dragOptionActivity}
          dragOptionLocation={dragOptionLocation}
        />
      </div>
    </Stack>
  );
};

MainTabDragEvents.displayName = 'MainTabDragEvents';

export default memo(MainTabDragEvents);
