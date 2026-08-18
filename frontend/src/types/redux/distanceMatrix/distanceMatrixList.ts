
export interface DistanceMatrixListState {
  rows: {
    [key: string]: distancematrixRowsState;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}
interface userState {
  birthday?: null,
  id?: string,
  capacity?: null,
  firstName?: string,
  lastName?: string,
  phoneNumber?: null,
  email?: string,
  email1?: null,
  email2?: null,
  titleCustom?: null,
  codeCustom?: null,
  role?: string,
  disabled?: boolean,
  needroom?: boolean,
  needseat?: boolean,
  overlap?: boolean,
  password?: string,
  emailVerified?: true,
  emailVerificationToken?: null,
  emailVerificationTokenExpiresAt?: null,
  disabledAt?: null,
  passwordResetToken?: null,
  passwordResetTokenExpiresAt?: null,
  provider?: null,
  gender?: null,
  alias?: null,
  customAddressId?: null,
  customPayorClientId?: null,
  otherPhones?: null,
  otherEmails?: null,
  address?: null,
  longitude?: null,
  latitude?: null,
  active?: boolean,
  minHours?: null,
  maxHours?: null,
  color?: null,
  borderColor?: null,
  mobiletoken?: null,
  address2?: null,
  address2Default?: boolean,
  billable?: boolean,
  notWorking?: boolean,
  auth?: boolean,
  allBranches?: boolean,
  paid?: boolean,
  idCustom?: null,
  idCustom2?: null,
  calendarhide?: boolean,
  waitlisted?: boolean,
  priority?: null,
  employeeratio?: null,
  clientratio?: null,
  hourlyrate?: null,
  salary?: null,
  hourlyrevenue?: null,
  supervision?: boolean,
  productivityInclude?: boolean,
  productivityExclude?: boolean,
  importHash?: null,
  siblingGroupId?: string,
  supervisionRateInclude?: boolean,
  createdAt?: string,
  updatedAt?: string,
  deletedAt?: null,
  parentId?: null,
  colorsId?: null,
  resourceId?: null,
  companyId?: string,
  locationTypeId?: null,
  siblingUserId?: null,
  address1RelationshipId?: null,
  address2RelationshipId?: null,
  createdById?: string,
  updatedById?: string
}
export interface distancematrixRowsState {
    id: string,
    address1?: null,
    address2?: null,
    distance?: null,
    duration?: null,
    duration_early?: null,
    duration_late?: null,
    importHash?: null,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: null,
    addy1Id?: null,
    addy2Id?: null,
    user1Id?: string,
    user2Id?: string,
    createdById?: string,
    updatedById?: string,
    addy1?: null,
    addy2?: null,
    user1?: userState
    user2?: userState
}
export enum DistanceMatrixListActionTypes {
    DISTANCEMATRIX_LIST_FETCH_STARTED = "DISTANCEMATRIX_LIST_FETCH_STARTED",
      DISTANCEMATRIX_LIST_FETCH_SUCCESS = "DISTANCEMATRIX_LIST_FETCH_SUCCESS",
        DISTANCEMATRIX_LIST_FETCH_ERROR = "DISTANCEMATRIX_LIST_FETCH_ERROR",
          DISTANCEMATRIX_LIST_DELETE_STARTED = "DISTANCEMATRIX_LIST_DELETE_STARTED",
            DISTANCEMATRIX_LIST_DELETE_SUCCESS = "DISTANCEMATRIX_LIST_DELETE_SUCCESS",
              DISTANCEMATRIX_LIST_DELETE_ERROR = "DISTANCEMATRIX_LIST_DELETE_ERROR",
                DISTANCEMATRIX_LIST_OPEN_CONFIRM = "DISTANCEMATRIX_LIST_OPEN_CONFIRM",
                  DISTANCEMATRIX_LIST_CLOSE_CONFIRM = "DISTANCEMATRIX_LIST_CLOSE_CONFIRM",
}

interface DistanceMatrixListFetchStarted {
  type: DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_FETCH_STARTED;
}

interface DistanceMatrixListFetchSuccess {
  type: DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: distancematrixRowsState;
    }[];
    count: number
  };
}

interface DistanceMatrixListFetchError {
  type: DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_FETCH_ERROR;
}

interface DistanceMatrixListDeleteStarted {
  type: DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_DELETE_STARTED;
}

interface DistanceMatrixListDeleteSuccess {
  type: DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_DELETE_SUCCESS;
}

interface DistanceMatrixListDeleteError {
  type: DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_DELETE_ERROR;
}

interface DistanceMatrixListOpenConfirm {
  type: DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface DistanceMatrixListCloseConfirm {
  type: DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_CLOSE_CONFIRM;
}

export type DistanceMatrixListAction =
  DistanceMatrixListFetchStarted
  | DistanceMatrixListFetchSuccess
  | DistanceMatrixListFetchError
  | DistanceMatrixListDeleteStarted
  | DistanceMatrixListDeleteSuccess
  | DistanceMatrixListDeleteError
  | DistanceMatrixListOpenConfirm
  | DistanceMatrixListCloseConfirm
