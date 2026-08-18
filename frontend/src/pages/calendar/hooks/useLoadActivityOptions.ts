import { useAppSelector } from 'store/hooks';
import { useLoadResourceOptions } from './useLoadResourceOptions';

export function useLoadActivityOptions({
  resources = [],
  branches = [],
  limit = 50,
  debounceTime = 300,
  includeSupervision = false,
  postLoadFilter = (resources: any[]) => resources,
}: {
  resources?: any[];
  branches?: any[];
  limit?: number;
  debounceTime?: number;
  includeSupervision?: boolean;
  postLoadFilter?: (resources: any[]) => any[];
} = {}) {
  const activityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );

  return useLoadResourceOptions({
    branches,
    resourceTypes: ['Activity'],
    resources: [...activityResources, ...resources],
    resourcesLoaded: true,
    excludeSupervision: !includeSupervision,
    debounceTime,
    limit,
    postLoadFilter: (resources: any[]) =>
      postLoadFilter(
        includeSupervision
          ? resources
          : resources.filter((item) => !item.supervision),
      ),
  });
}
