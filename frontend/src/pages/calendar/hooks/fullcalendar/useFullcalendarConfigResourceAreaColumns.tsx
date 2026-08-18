import { useState, useCallback, useMemo } from 'react';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import { useAppSelector } from 'store/hooks';
import {
  ResourceAreaColumns,
  StatsCol,
} from '../../components/fullcalendar/ResourceAreaColumns';
import { useCalendarSelectedResourcesContext } from '../../context/CalendarSelectedResourcesContext';
import { useCalendarTotalTypeOptions } from '../../hooks/useCalendarTotalTypeOptions';

export function useFullcalendarConfigResourceAreaColumns({
  resourceLabelContent,
}: {
  resourceLabelContent: (resource: any) => React.ReactNode;
}) {
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const statsViewEnabled = useAppSelector(
    (state) => state.settings.settingValues.statsViewEnabled,
  );
  const quickStatFilter = useAppSelector(
    (state) => state.settings.settingValues.quickStatFilter,
  );
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );
  const storeSettingsValuesTotalCustom = useAppSelector(
    (state) => state.settings.settingValues.totalCustom,
  );

  const totalTypeOptions = useCalendarTotalTypeOptions();

  // Context for selected resources
  const { isAllSelected, toggleIsAllSelected } =
    useCalendarSelectedResourcesContext();

  const [eventSortOrder, setEventSortOrder] = useState('title');

  const statsActivity = useMemo(() => {
    return storeActivityResources.filter(
      (e) => statsViewEnabled && quickStatFilter.includes(e.title),
    );
  }, [statsViewEnabled, quickStatFilter, storeActivityResources]);

  const toggleSortOrder = useCallback(() => {
    setEventSortOrder((prevSortOrder) =>
      prevSortOrder === 'title' ? '-title' : 'title',
    );
  }, []);

  const toggleSortOrderLast = useCallback(() => {
    setEventSortOrder((prevSortOrder) =>
      prevSortOrder === 'lastName' ? '-lastName' : 'lastName',
    );
  }, []);

  const resourceAreaColumns = useMemo(
    () => {
      let arr = [
        {
          field: 'name',
          headerContent: (
            <ResourceAreaColumns
              nameChecked={isAllSelected}
              handleNameCheck={() => toggleIsAllSelected()}
              toggleSortOrder={toggleSortOrder}
              toggleSortOrderLast={toggleSortOrderLast}
              eventSortOrder={eventSortOrder}
              isOptimizerResultsPreviewMode={isOptimizerResultsPreviewMode}
            />
          ),
        },
        ...statsActivity.map((resource) => {
          return {
            field: resource.id,
            width: `${30 / (quickStatFilter.length + 1)}%`,
            headerContent: (
              <StatsCol
                title={resource.title}
                text={resource.title.slice(0, 2)}
                color={resource.color}
              />
            ),
            type: resource.type,
            color: resource.color,
            className: 'styled mb-1',
          };
        }),
      ];

      if (statsViewEnabled) {
        arr.splice(
          1,
          0,
          {
            field: 'total',
            width: `${20 / (quickStatFilter.length + 1)}%`,
            headerContent: (
              <StatsCol
                title={
                  totalTypeOptions.find(
                    (t) => storeSettingsValuesTotalCustom === t.value,
                  )?.label
                }
                text={'T'}
              />
            ),
          },
          {
            field: 'efficiency',
            width: `${20 / (quickStatFilter.length + 1)}%`,
            headerContent: <StatsCol title='Efficiency %' text='E' />,
          },
          {
            field: 'converted',
            width: `${20 / (quickStatFilter.length + 1)}%`,
            headerContent: <StatsCol title='Converted %' text='C' />,
          },
        );
      }

      return arr;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      eventSortOrder,
      isAllSelected,
      toggleIsAllSelected,
      quickStatFilter.length,
      statsActivity,
      storeSettingsValuesTotalCustom,
      isOptimizerResultsPreviewMode,
      toggleSortOrder,
      toggleSortOrderLast,
      totalTypeOptions,
      resourceLabelContent,
    ],
  );

  return {
    eventSortOrder,
    resourceAreaColumns,
  };
}
