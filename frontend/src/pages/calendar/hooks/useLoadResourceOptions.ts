import { useRef, useMemo } from 'react';
import axios from 'axios';
import { useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { formatResourceToSelectOption } from '../utils/formatResourceToSelectOption';
import type { CancelTokenSource } from 'axios';

const filterResources = (resources: any[], inputValue: string) => {
  const lowerInput = `${inputValue}`.toLowerCase();
  return resources.filter((resource) =>
    resource.title.toLowerCase().includes(lowerInput),
  );
};

const uniqueResources = (resources: any[]) => {
  const seen = new Set();
  return resources.filter((resource) => {
    const duplicate = seen.has(resource.id);
    seen.add(resource.id);
    return !duplicate;
  });
};

const defaultTransformData = (data: any[]) =>
  data.map(formatResourceToSelectOption);

export function useLoadResourceOptions({
  resourceTypes = [],
  branches = [],
  resources = [],
  resourcesLoaded = false,
  limit = 50,
  excludeSupervision = false,
  excludeRooms = false,
  debounceTime = 300,
  postLoadFilter = (resources: any[]) => resources,
  transformData = defaultTransformData,
}: {
  resourceTypes?: string[];
  branches?: any[];
  resources?: any[];
  resourcesLoaded?: boolean;
  limit?: number;
  excludeSupervision?: boolean;
  excludeRooms?: boolean;
  debounceTime?: number;
  postLoadFilter?: (resources: any[]) => any[];
  transformData?: (data: any[]) => any[];
} = {}) {
  const currentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const isCurrentBranchLevelHighest = useAppSelector(
    (state) => state.calendar.isCurrentBranchLevelHighest,
  );
  const isCurrentBranchLastTwoLowest = useAppSelector(
    (state) => state.calendar.isCurrentBranchLastTwoLowest,
  );

  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);
  const timer = useRef<any>(null);

  const shouldShowDefaultOptions = useMemo(
    () =>
      (isCurrentBranchLevelHighest || isCurrentBranchLastTwoLowest) &&
      resources.length > 0,
    [isCurrentBranchLevelHighest, isCurrentBranchLastTwoLowest, resources],
  );

  const searchResources = useLatestCallback(
    async ({
      inputValue,
      callback,
      excludeCurrentBranch = false,
    }: {
      inputValue: string;
      callback: (data: any[]) => void;
      excludeCurrentBranch?: boolean;
    }) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(async () => {
        // Cancel previous request if exists
        if (cancelTokenSourceRef.current) {
          cancelTokenSourceRef.current.cancel('New request initiated');
        }

        // Create new cancel token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        if (inputValue.length < 2) {
          callback([]);
          return;
        }

        try {
          const response = await axios.post(
            `/scheduler/resources`,
            {
              resourceTypes: resourceTypes.join('|'),
              query: inputValue,
              excludeSupervision: excludeSupervision ? true : undefined,
              excludeRooms: excludeRooms ? true : undefined,
              limit,
              page: 1,
            },
            {
              params: {
                branches: [
                  ...new Set(
                    [
                      ...(!excludeCurrentBranch &&
                      Array.isArray(currentBranches)
                        ? currentBranches
                        : []),
                      ...(Array.isArray(branches) ? branches : []),
                    ].map((b) => b.value),
                  ),
                ].join('|'),
              },
              cancelToken: cancelTokenSourceRef.current.token,
            },
          );
          callback(response?.data || []);
        } catch (error) {
          if (!axios.isCancel(error)) {
            console.error('Error fetching options:', error);
            callback([]);
          }
        }
      }, debounceTime);
    },
  );

  const loadResourceOptions = useLatestCallback(
    (inputValue: string, callback: (args: any) => void) => {
      if (
        (isCurrentBranchLevelHighest || isCurrentBranchLastTwoLowest) &&
        resourcesLoaded
      ) {
        if (branches.length === 0) {
          callback(
            transformData(
              uniqueResources(
                postLoadFilter(filterResources(resources, inputValue)),
              ),
            ),
          );
          return;
        }

        searchResources({
          inputValue,
          excludeCurrentBranch: true,
          callback: (data: any[]) => {
            callback(
              transformData(
                uniqueResources(
                  postLoadFilter(
                    uniqueResources([
                      ...filterResources(resources, inputValue),
                      ...data,
                    ]),
                  ),
                ),
              ),
            );
          },
        });
        return;
      }

      searchResources({
        inputValue,
        callback: (data: any[]) => {
          callback(
            transformData(
              uniqueResources(
                postLoadFilter(
                  uniqueResources([
                    ...filterResources(resources, inputValue),
                    ...data,
                  ]),
                ),
              ),
            ),
          );
        },
      });
    },
  );

  return {
    shouldShowDefaultOptions,
    loadResourceOptions,
  };
}
