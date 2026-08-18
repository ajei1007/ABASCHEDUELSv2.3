import { useAppSelector } from 'store/hooks';
import { useLoadResourceOptions } from './useLoadResourceOptions';

export function useLoadLocationOptions({
  resources = [],
  branches = [],
  limit = 50,
  debounceTime = 300,
  includeRooms = false,
  postLoadFilter = (resources: any[]) => resources,
}: {
  resources?: any[];
  branches?: any[];
  limit?: number;
  debounceTime?: number;
  includeRooms?: boolean;
  postLoadFilter?: (resources: any[]) => any[];
} = {}) {
  const locationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );

  return useLoadResourceOptions({
    branches,
    resourceTypes: ['Location'],
    resources: [...locationResources, ...resources],
    resourcesLoaded: true,
    excludeRooms: !includeRooms,
    debounceTime,
    limit,
    postLoadFilter: (resources: any[]) =>
      postLoadFilter(
        includeRooms
          ? resources
          : resources.filter((item) => !item?.roles?.includes('Room')),
      ),
  });
}
