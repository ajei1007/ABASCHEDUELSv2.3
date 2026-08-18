export interface CancellationsListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

interface avtivityState {
  id?: string;
  firstName?: string;
}
interface eventStateInterface {
  id?: string;
  start?: Date | any;
  end?: Date | any;
  activity0?: avtivityState;
}

interface resasonStateInterface {
  id?: string;
  name?: string;
}

interface userStateInterface {
  id?: string;
  firstName?: string;
  lastName?: string;
}
interface CancellationListRowState {
  event?: eventStateInterface;
  F?: boolean;
  M?: boolean;
  R?: boolean;
  S?: boolean;
  T?: boolean;
  U?: boolean;
  W?: boolean;
  startRecur?: Date | string | any;
  endRecur?: Date | string | any;
  description?: string;
  users?: Array<any>;
  timezone?: null | any;
  date?: Date | string | any;
  reason?: resasonStateInterface;
  user?: userStateInterface;
}

export enum CancellationsListActionTypes {
  CANCELLATIONS_LIST_FETCH_STARTED = 'CANCELLATIONS_LIST_FETCH_STARTED',
  CANCELLATIONS_LIST_FETCH_SUCCESS = 'CANCELLATIONS_LIST_FETCH_SUCCESS',
  CANCELLATIONS_LIST_FETCH_ERROR = 'CANCELLATIONS_LIST_FETCH_ERROR',
  CANCELLATIONS_LIST_DELETE_STARTED = 'CANCELLATIONS_LIST_DELETE_STARTED',
  CANCELLATIONS_LIST_DELETE_SUCCESS = 'CANCELLATIONS_LIST_DELETE_SUCCESS',
  CANCELLATIONS_LIST_DELETE_ERROR = 'CANCELLATIONS_LIST_DELETE_ERROR',
  CANCELLATIONS_LIST_OPEN_CONFIRM = 'CANCELLATIONS_LIST_OPEN_CONFIRM',
  CANCELLATIONS_LIST_CLOSE_CONFIRM = 'CANCELLATIONS_LIST_CLOSE_CONFIRM',
}

interface CancellationsListFetchStarted {
  type: CancellationsListActionTypes.CANCELLATIONS_LIST_FETCH_STARTED;
}

interface CancellationsListFetchSuccess {
  type: CancellationsListActionTypes.CANCELLATIONS_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: CancellationListRowState;
    }[];
    count: number;
  };
}

interface CancellationsListFetchError {
  type: CancellationsListActionTypes.CANCELLATIONS_LIST_FETCH_ERROR;
}

interface CancellationsListDeleteStarted {
  type: CancellationsListActionTypes.CANCELLATIONS_LIST_DELETE_STARTED;
}

interface CancellationsListDeleteSuccess {
  type: CancellationsListActionTypes.CANCELLATIONS_LIST_DELETE_SUCCESS;
}

interface CancellationsListDeleteError {
  type: CancellationsListActionTypes.CANCELLATIONS_LIST_DELETE_ERROR;
}

interface CancellationsListOpenConfirm {
  type: CancellationsListActionTypes.CANCELLATIONS_LIST_OPEN_CONFIRM;
  payload: {
    id: string;
  };
}

interface CancellationsListCloseConfirm {
  type: CancellationsListActionTypes.CANCELLATIONS_LIST_CLOSE_CONFIRM;
}

export type CancellationsListAction =
  | CancellationsListFetchStarted
  | CancellationsListFetchSuccess
  | CancellationsListFetchError
  | CancellationsListDeleteStarted
  | CancellationsListDeleteSuccess
  | CancellationsListDeleteError
  | CancellationsListOpenConfirm
  | CancellationsListCloseConfirm;
