import type {
  TApiEventUpdateLevel,
  TApiEventUpdateType,
  TApiEventDeleteType,
} from 'types/api';
export * from 'types/api';

export interface ICalendarOperationData<
  BDT = Record<string, any>,
  PDT = Record<string, any>,
  RDT = Record<string, any>,
> {
  requestData: {
    body: BDT;
    params?: PDT;
  };
  responseData?: RDT;
}

export type TCalendarMultiEventCreateOperationData = ICalendarOperationData<
  {
    arr: any[];
  } & Record<string, any>,
  Record<string, any>,
  {
    created: any[];
    updated: any[];
    deleted: any[];
    isolated?: any[];
    undeleted?: any[];
  }
>;

export type TCalendarMultiEventUpdateOperationData = ICalendarOperationData<
  {
    arr: any[];
  } & Record<string, any>,
  {
    update_level: TApiEventUpdateLevel;
    update_type: TApiEventUpdateType;
    cancellation_update: boolean;
  } & Record<string, any>,
  {
    created: any[];
    updated: any[];
    deleted: any[];
    isolated?: any[];
    undeleted?: any[];
  }
>;

export type TCalendarMultiEventDeleteOperationData = ICalendarOperationData<
  {
    arr: any[];
  } & Record<string, any>,
  {
    delete_type: TApiEventDeleteType;
  } & Record<string, any>,
  {
    created: any[];
    updated: any[];
    deleted: any[];
    isolated: any[];
    undeleted?: any[];
  }
>;

export type TCalendarMultiEventUndeleteOperationData = ICalendarOperationData<
  {
    arr: any[];
  } & Record<string, any>,
  Record<string, any>,
  {
    created?: any[];
    updated?: any[];
    deleted?: any[];
    isolated?: any[];
    undeleted: any[];
  }
>;

export enum ECalendarOperationEnums {
  CREATED = 'created',
  DELETED = 'deleted',
  MULTI_CREATED = 'multi-created',
  MULTI_DELETED = 'multi-deleted',
  EVENTS_MULTI_CREATED = 'events-multi-created',
  EVENTS_MULTI_UPDATED = 'events-multi-updated',
  EVENTS_MULTI_DELETED = 'events-multi-deleted',
  EVENTS_MULTI_UNDELETED = 'events-multi-undeleted',
}

export interface ICalendarExecutedOperationItem<T = ICalendarOperationData> {
  data: T;
  route: string;
  type: ECalendarOperationEnums;
}

export interface ICalendarOperationItem {
  name: string;
  executedOperations: ICalendarExecutedOperationItem[];
}

export interface IOptimizerJobItem {
  id: string;
  startDate: string;
  endDate: string;
  branch: any;
  status: 'loading' | 'success' | 'failure';
  startTs: number;
  endTs: number | null;
  result: any[] | null;
  abortController?: AbortController | null;
}
export type TIntegrationSoftware = 'rethink' | 'therapypms';

export interface ISolutionGeneratorJob {
  id: string;
  startDate: string;
  endDate: string;
  resourceId: string;
  branchId: string;
  status: 'loading' | 'success' | 'failed';
  filterResourceIds: string[];
  triggeredAt: Date;
  errorMessage: string | null;
  abortController: AbortController | null;
}

export interface IFlaggingJob {
  id: string;
  startDate: string;
  endDate: string;
  branchId: string;
  resourceIds: Record<string, boolean>;
  abortController: AbortController | null;
}
