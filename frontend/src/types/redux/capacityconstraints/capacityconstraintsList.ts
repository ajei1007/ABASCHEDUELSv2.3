
export interface CapacityconstraintsListState {
  rows: {
    [key: string]: CapacityconstraintsRowState;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

interface CapacityconstraintsRowState {
  id: string;
  min1?: number;
  max1?: number;
  min2?: null | any;
  max2?: null | any;
  min3?: null | any;
  max3?: null | any;
  min4?: null | any;
  max4?: null | any;
  priority?: null;
  min5?: null | any;
  max5?: null | any;
  locationDisabled?: boolean;
  disabled?: boolean;
  rooms?: boolean;
  importHash?: null | any;
  createdAt?: Date | number | any;
  updatedAt?: Date | number | any;
  deletedAt?: null;
  user1Id?: string;
  user2Id?: null;
  role1Id?: string;
  role2Id?: null;
  role3Id?: null;
  role4Id?: null;
  subgroup1Id?: null;
  subgroup2Id?: null;
  subgroup3Id?: null;
  subgroup4Id?: null;
  role5Id?: null;
  subgroup5Id?: null;
  createdById?: string;
  updatedById?: string;
  user1?: null,
  user2?: null,
  createdBy?: null,
  role1?: null,
  role2?: null,
  role3?: null,
  role4?: null,
  subgroup1?: null,
  subgroup2?: null,
  subgroup3?: null,
  subgroup4?: null,
  role5?: null,
  subgroup5?: null
}

export enum CapacityconstraintsListActionTypes {
    CAPACITYCONSTRAINTS_LIST_FETCH_STARTED = "CAPACITYCONSTRAINTS_LIST_FETCH_STARTED",
      CAPACITYCONSTRAINTS_LIST_FETCH_SUCCESS = "CAPACITYCONSTRAINTS_LIST_FETCH_SUCCESS",
        CAPACITYCONSTRAINTS_LIST_FETCH_ERROR = "CAPACITYCONSTRAINTS_LIST_FETCH_ERROR",
          CAPACITYCONSTRAINTS_LIST_DELETE_STARTED = "CAPACITYCONSTRAINTS_LIST_DELETE_STARTED",
            CAPACITYCONSTRAINTS_LIST_DELETE_SUCCESS = "CAPACITYCONSTRAINTS_LIST_DELETE_SUCCESS",
              CAPACITYCONSTRAINTS_LIST_DELETE_ERROR = "CAPACITYCONSTRAINTS_LIST_DELETE_ERROR",
                CAPACITYCONSTRAINTS_LIST_OPEN_CONFIRM = "CAPACITYCONSTRAINTS_LIST_OPEN_CONFIRM",
                  CAPACITYCONSTRAINTS_LIST_CLOSE_CONFIRM = "CAPACITYCONSTRAINTS_LIST_CLOSE_CONFIRM",
}

interface CapacityconstraintsListFetchStarted {
  type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_STARTED;
}

interface CapacityconstraintsListFetchSuccess {
  type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: CapacityconstraintsRowState;
    }[];
    count: number
  };
}

interface CapacityconstraintsListFetchError {
  type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_ERROR;
}

interface CapacityconstraintsListDeleteStarted {
  type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_DELETE_STARTED;
}

interface CapacityconstraintsListDeleteSuccess {
  type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_DELETE_SUCCESS;
}

interface CapacityconstraintsListDeleteError {
  type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_DELETE_ERROR;
}

interface CapacityconstraintsListOpenConfirm {
  type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface CapacityconstraintsListCloseConfirm {
  type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_CLOSE_CONFIRM;
}

export type CapacityconstraintsListAction =
  CapacityconstraintsListFetchStarted
  | CapacityconstraintsListFetchSuccess
  | CapacityconstraintsListFetchError
  | CapacityconstraintsListDeleteStarted
  | CapacityconstraintsListDeleteSuccess
  | CapacityconstraintsListDeleteError
  | CapacityconstraintsListOpenConfirm
  | CapacityconstraintsListCloseConfirm
