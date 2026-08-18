import { useAppSelector } from 'store/hooks';
import { useLoadResourceOptions } from './useLoadResourceOptions';

export function useLoadBlockOptions({
  resources = [],
  branches = [],
  limit = 50,
  debounceTime = 300,
  postLoadFilter = (resources: any[]) => resources,
}: {
  resources?: any[];
  branches?: any[];
  limit?: number;
  debounceTime?: number;
  postLoadFilter?: (resources: any[]) => any[];
} = {}) {
  const blockResources = useAppSelector(
    (state) => state.calendar.blockResources,
  );

  return useLoadResourceOptions({
    branches,
    resourceTypes: ['Block'],
    resources: [...blockResources, ...resources],
    resourcesLoaded: true,
    debounceTime,
    limit,
    postLoadFilter,
  });
}
