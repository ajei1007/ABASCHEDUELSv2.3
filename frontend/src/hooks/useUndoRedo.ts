import { toast } from 'react-toastify';
import axios from 'axios';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useMemo, useState } from 'react';
import {
  setOperationCurrentIndex,
  setOperations,
} from 'store/slices/calendarUndoRedo/actions';
import {
  fetchResourceAvailabilities,
  fetchEvents,
  updateCalendarEvents,
  fetchStatistics,
} from 'store/slices/calendar/thunks';
import { retriggerSolutionGeneratorJobs } from 'store/slices/solutionGenerator/actions';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { ECalendarOperationEnums } from 'types';
import type {
  ICalendarOperationItem,
  ICalendarOperationData,
  TCalendarMultiEventCreateOperationData,
  TCalendarMultiEventUpdateOperationData,
  TCalendarMultiEventDeleteOperationData,
  TCalendarMultiEventUndeleteOperationData,
} from 'types';

const useUndoRedo = () => {
  const dispatch = useAppDispatch();
  const operations = useAppSelector(
    (state) => state.calendarUndoRedo.operations,
  );
  const currentIndex = useAppSelector(
    (store) => store.calendarUndoRedo.currentIndex,
  );
  const currentBranches = useAppSelector(
    (store) => store.calendar.current_branches,
  );

  const selectedBranches = currentBranches.map((e: any) => e.value).join('|');
  const startRange = useAppSelector((store) => store.calendar.calendar_start);
  const endRange = useAppSelector((store) => store.calendar.calendar_end);
  const statsViewEnabled = useAppSelector(
    (store) => store.settings.settingValues.statsViewEnabled,
  );
  const includeDeleted = useAppSelector(
    (state) => state.calendar.includeDeleted,
  );

  // Internal Hooks
  const [undoRedoLoading, setUndoRedoLoading] = useState(false);

  const canUndo = useMemo(() => currentIndex > 0, [currentIndex]);

  const canRedo = useMemo(
    () => currentIndex <= operations.length - 1,
    [currentIndex, operations],
  );

  const undo = useLatestCallback(async () => {
    setUndoRedoLoading(true);
    // 1. Decrease currentIndex - 1;
    const updatedCurrentIndex = currentIndex - 1;
    // 2. Execute currentIndex operation of operations array;
    const operation = operations[updatedCurrentIndex];
    try {
      await executeOperationUndo(operation);
      if (currentIndex > 0) {
        dispatch(setOperationCurrentIndex(updatedCurrentIndex));
      }
    } catch (error: any) {
      const msg = error?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again!');
      }
    } finally {
      setUndoRedoLoading(false);
    }
  });

  const redo = useLatestCallback(async () => {
    setUndoRedoLoading(true);
    // 1. Increase currentIndex + 1;
    const updatedCurrentIndex = currentIndex + 1;
    // 2. Execute currentIndex operation of operations array;
    const operation = operations[currentIndex];
    try {
      await executeOperationRedo({
        operation,
        index: currentIndex,
      });
      dispatch(setOperationCurrentIndex(updatedCurrentIndex));
    } catch (error: any) {
      const msg = error?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again!');
      }
    } finally {
      setUndoRedoLoading(false);
    }
  });

  const executeOperationUndo = useLatestCallback(
    async (operation: ICalendarOperationItem) => {
      const executedOperations = operation.executedOperations;
      let affectedResourceIds: string[] = [];

      for (let i = 0; i < executedOperations.length; i++) {
        const executeOperation = executedOperations[i];
        const { type, route, data } = executeOperation;
        let collectedIds: string[] = [];
        switch (type) {
          case ECalendarOperationEnums.CREATED:
            await deleteRequest(route, data);
            break;
          case ECalendarOperationEnums.DELETED:
            await postRequest(route, data);
            break;
          case ECalendarOperationEnums.MULTI_CREATED:
            await multiDeleteRequest(route, data);
            break;
          case ECalendarOperationEnums.MULTI_DELETED:
            await multiPostRequest(route, data);
            break;

          case ECalendarOperationEnums.EVENTS_MULTI_CREATED:
          case ECalendarOperationEnums.EVENTS_MULTI_UPDATED:
          case ECalendarOperationEnums.EVENTS_MULTI_DELETED:
          case ECalendarOperationEnums.EVENTS_MULTI_UNDELETED:
            collectedIds = await multiEventUndoRequest(
              data as
                | TCalendarMultiEventCreateOperationData
                | TCalendarMultiEventUpdateOperationData
                | TCalendarMultiEventDeleteOperationData,
            );
            break;
        }
        affectedResourceIds = [...affectedResourceIds, ...collectedIds]; // Collect affected resource IDs
      }

      // If there are affected resource IDs, dispatch an action to retrigger solution generator jobs
      if (affectedResourceIds.length > 0) {
        affectedResourceIds = Array.from(new Set(affectedResourceIds)); // Remove duplicates
        // Dispatch action to retrigger solution generator jobs with affected resource IDs
        dispatch(
          retriggerSolutionGeneratorJobs({
            branchId: selectedBranches,
            resourceIds: affectedResourceIds,
          }),
        );
      }
    },
  );

  const executeOperationRedo = useLatestCallback(
    async ({
      operation,
      index,
    }: {
      operation: ICalendarOperationItem;
      index: number;
    }) => {
      const executedOperations = operation.executedOperations;
      let affectedResourceIds: string[] = [];

      for (let opIndex = 0; opIndex < executedOperations.length; opIndex++) {
        const executeOperation = executedOperations[opIndex];
        const { type, route, data } = executeOperation;
        let collectedIds: string[] = [];
        switch (type) {
          case ECalendarOperationEnums.CREATED:
            await postRequest(route, data);
            break;
          case ECalendarOperationEnums.DELETED:
            await deleteRequest(route, data);
            break;
          case ECalendarOperationEnums.MULTI_CREATED:
            await multiPostRequest(route, data);
            break;
          case ECalendarOperationEnums.MULTI_DELETED:
            await multiDeleteRequest(route, data);
            break;
          case ECalendarOperationEnums.EVENTS_MULTI_CREATED:
            collectedIds = await multiEventRedoRequest({
              method: 'post',
              route,
              data,
              stackIndex: index,
              opIndex,
            });
            break;
          case ECalendarOperationEnums.EVENTS_MULTI_UPDATED:
            collectedIds = await multiEventRedoRequest({
              method: 'put',
              route,
              data,
              stackIndex: index,
              opIndex,
            });
            break;
          case ECalendarOperationEnums.EVENTS_MULTI_DELETED:
            collectedIds = await multiEventRedoRequest({
              method: 'post',
              route,
              data,
              stackIndex: index,
              opIndex,
            });
            break;
          case ECalendarOperationEnums.EVENTS_MULTI_UNDELETED:
            collectedIds = await multiEventRedoRequest({
              method: 'post',
              route,
              data,
              stackIndex: index,
              opIndex,
            });
            break;
        }
        affectedResourceIds = [...affectedResourceIds, ...collectedIds]; // Collect affected resource IDs
      }

      // If there are affected resource IDs, dispatch an action to retrigger solution generator jobs
      if (affectedResourceIds.length > 0) {
        affectedResourceIds = Array.from(new Set(affectedResourceIds)); // Remove duplicates
        // Dispatch action to retrigger solution generator jobs with affected resource IDs
        dispatch(
          retriggerSolutionGeneratorJobs({
            branchId: selectedBranches,
            resourceIds: affectedResourceIds,
          }),
        );
      }
    },
  );

  const postRequest = useLatestCallback(
    async (route: string, data: ICalendarOperationData) => {
      await axios.post(route, data.requestData.body, {
        params: data.requestData.params,
      });
      refetchCalendarData(route);
    },
  );

  const deleteRequest = useLatestCallback(
    async (route: string, data: ICalendarOperationData) => {
      await axios.delete(`${route}/${data.requestData.body.id}`, {
        params: data.requestData.params,
      });
      refetchCalendarData(route);
    },
  );

  const multiDeleteRequest = useLatestCallback(
    async (route: string, data: ICalendarOperationData) => {
      const toBeDeletedIds = data.requestData.body?.data?.map((d: any) => d.id);
      await axios.post(
        `${route}/remove/multiple`,
        {
          toBeDeletedIds,
        },
        {
          params: data.requestData?.params,
        },
      );
      refetchCalendarData(route);
    },
  );

  const multiPostRequest = useLatestCallback(
    async (route: string, data: ICalendarOperationData) => {
      await axios.post(`${route}/create/multiple`, data.requestData.body, {
        params: data.requestData?.params,
      });
      refetchCalendarData(route);
    },
  );

  const multiEventRedoRequest = useLatestCallback(
    async ({
      method,
      route,
      data,
      stackIndex,
      opIndex,
    }: {
      method: 'post' | 'put';
      route: string;
      data: ICalendarOperationData;
      stackIndex: number;
      opIndex: number;
    }) => {
      let start: Date | string = startRange;
      let end: Date | string = endRange;
      if (route.includes('events/remove/multiple')) {
        start = moment(start).subtract(1, 'days').format();
        end = moment(end).add(1, 'days').format();
      }

      const res = await axios[method](route, data.requestData.body, {
        params: {
          ...data.requestData.params,
          start,
          end,
          branches: selectedBranches,
        },
      });

      const toBeDeleted: any[] = [];
      const toBeUpdated = (res.data?.calendar || []).reduce(
        (acc: any[], ev: any) => {
          if ((includeDeleted && ev.eventGroupId) || !ev.deletedAt) {
            acc.push(ev);
          } else {
            toBeDeleted.push(ev.id);
          }
          return acc;
        },
        [] as any[],
      );

      const updatedData = {
        ...data,
        responseData: {
          created: res.data?.created || [],
          updated: res.data?.updated || [],
          deleted: res.data?.deleted || [],
          isolated: res.data?.isolated || [],
          undeleted: res.data?.undeleted || [],
        },
      };

      const updatedOperations = [...operations];
      updatedOperations[stackIndex] = {
        ...updatedOperations[stackIndex],
        executedOperations: [
          ...updatedOperations[stackIndex].executedOperations,
        ],
      };

      updatedOperations[stackIndex].executedOperations[opIndex] = {
        ...updatedOperations[stackIndex].executedOperations[opIndex],
        data: updatedData,
      };

      const affectedResourceIds: string[] = (
        data.requestData?.body?.arr || []
      ).flatMap((item: any) => item?.data?.users || []);

      dispatch(setOperations(updatedOperations));
      dispatch(
        updateCalendarEvents({
          toBeAdded: [],
          toBeUpdated,
          toBeDeleted,
          toBeExcludedIds: [],
          toBeUndeleted: [],
        }),
      );

      return affectedResourceIds;
    },
  );

  const multiEventUndoRequest = useLatestCallback(
    async (
      data:
        | TCalendarMultiEventCreateOperationData
        | TCalendarMultiEventUpdateOperationData
        | TCalendarMultiEventDeleteOperationData
        | TCalendarMultiEventUndeleteOperationData,
    ) => {
      const res = await axios.post(
        '/events/multiple/undo',
        {
          created: data.responseData?.created || [],
          deleted: data.responseData?.deleted || [],
          updated: data.responseData?.updated || [],
          isolated: data.responseData?.isolated || [],
          undeleted: data.responseData?.undeleted || [],
        },
        {
          params: {
            start: startRange,
            end: endRange,
            branches: selectedBranches,
          },
        },
      );

      const toBeDeleted: any[] = [];
      const toBeUpdated = (res.data?.calendar || []).reduce(
        (acc: any[], ev: any) => {
          if ((includeDeleted && ev.eventGroupId) || !ev.deletedAt) {
            acc.push(ev);
          } else {
            toBeDeleted.push(ev.id);
          }
          return acc;
        },
        [] as any[],
      );

      const affectedResourceIds: string[] = (
        data.requestData?.body?.arr || []
      ).flatMap((item: any) => item?.data?.users || []);

      dispatch(
        updateCalendarEvents({
          toBeAdded: [],
          toBeUpdated,
          toBeDeleted,
          toBeExcludedIds: [],
          toBeUndeleted: [],
        }),
      );

      return affectedResourceIds;
    },
  );

  const refetchCalendarData = useLatestCallback((route: string) => {
    if (route.includes('events') || route.includes('cancellations')) {
      dispatch(fetchEvents());
      if (statsViewEnabled) {
        dispatch(
          fetchStatistics({
            start: startRange,
            end: endRange,
          }),
        );
      }
    }
    if (route.includes('availabilities')) {
      dispatch(fetchResourceAvailabilities());
    }
  });

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    undoRedoLoading,
  };
};

export default useUndoRedo;
