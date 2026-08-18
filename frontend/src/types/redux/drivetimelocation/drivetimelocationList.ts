
export interface DrivetimelocationListState {
  rows: {
    [key: string]: drivetimelocationRowsState;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}
interface locationState{
  birthday?: null,
  id?: string,
  capacity?: number,
  firstName?: string,
  lastName?: null,
  phoneNumber?: string,
  email?: string | null,
  email1?: string |null,
  email2?: string |null,
  titleCustom?: string |null,
  codeCustom?: string |null,
  role?: string | null,
  disabled?: boolean,
  needroom?: boolean,
  needseat?: boolean,
  overlap?: boolean,
  password?: string,
  emailVerified?: boolean,
  emailVerificationToken?: null | any,
  emailVerificationTokenExpiresAt?: null | any,
  disabledAt?: null | any,
  passwordResetToken?: null | any,
  passwordResetTokenExpiresAt?: null | any,
  provider?: null | any,
  gender?: null | any,
  alias?: null | any,
  customAddressId?: null | any,
  customPayorClientId?: null | any,
  otherPhones?: null | any,
  otherEmails?: null | any,
  address?: string,
  longitude?: number,
  latitude?: number,
  active?: boolean,
  minHours?: null | any,
  maxHours?: null | any,
  color?: null | any,
  borderColor?: null | any,
  mobiletoken?: null | any,
  address2?: null | any,
  address2Default?: boolean,
  billable?: boolean,
  notWorking?: boolean,
  auth?: boolean,
  allBranches: boolean,
  paid?: boolean,
  idCustom?: null | any,
  idCustom2?: null | any,
  calendarhide?: boolean,
  waitlisted?: boolean,
  priority?: null | any,
  employeeratio?: null | any,
  clientratio?: null | any,
  hourlyrate?: null | any,
  salary?: null | any,
  hourlyrevenue?: null | any,
  supervision?: boolean,
  productivityInclude?: boolean,
  productivityExclude?: boolean,
  importHash?: null | any,
  siblingGroupId?: string,
  supervisionRateInclude?: boolean,
  createdAt?: Date | any,
  updatedAt?: Date | any,
  deletedAt?: null | any,
  parentId?: null | any,
  colorsId?: string,
  resourceId?: null |any,
  companyId?: string,
  locationTypeId?: null | any,
  siblingUserId: null | any,
  address1RelationshipId: null | any,
  address2RelationshipId?: null | any,
  createdById?: string,
  updatedById: string
}
export interface drivetimelocationRowsState {
    id?: string,
    time?: null,
    importHash?: null,
    createdAt?: Date | any,
    updatedAt?: Date | any,
    deletedAt?: null,
    location1Id?: string,
    location2Id?: string,
    createdById?: string,
    updatedById?: string,
    location1?: locationState,
    location2: locationState
}

export enum DrivetimelocationListActionTypes {
    DRIVETIMELOCATION_LIST_FETCH_STARTED = "DRIVETIMELOCATION_LIST_FETCH_STARTED",
      DRIVETIMELOCATION_LIST_FETCH_SUCCESS = "DRIVETIMELOCATION_LIST_FETCH_SUCCESS",
        DRIVETIMELOCATION_LIST_FETCH_ERROR = "DRIVETIMELOCATION_LIST_FETCH_ERROR",
          DRIVETIMELOCATION_LIST_DELETE_STARTED = "DRIVETIMELOCATION_LIST_DELETE_STARTED",
            DRIVETIMELOCATION_LIST_DELETE_SUCCESS = "DRIVETIMELOCATION_LIST_DELETE_SUCCESS",
              DRIVETIMELOCATION_LIST_DELETE_ERROR = "DRIVETIMELOCATION_LIST_DELETE_ERROR",
                DRIVETIMELOCATION_LIST_OPEN_CONFIRM = "DRIVETIMELOCATION_LIST_OPEN_CONFIRM",
                  DRIVETIMELOCATION_LIST_CLOSE_CONFIRM = "DRIVETIMELOCATION_LIST_CLOSE_CONFIRM",
}

interface DrivetimelocationListFetchStarted {
  type: DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_FETCH_STARTED;
}

interface DrivetimelocationListFetchSuccess {
  type: DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: drivetimelocationRowsState;
    }[];
    count: number
  };
}

interface DrivetimelocationListFetchError {
  type: DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_FETCH_ERROR;
}

interface DrivetimelocationListDeleteStarted {
  type: DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_DELETE_STARTED;
}

interface DrivetimelocationListDeleteSuccess {
  type: DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_DELETE_SUCCESS;
}

interface DrivetimelocationListDeleteError {
  type: DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_DELETE_ERROR;
}

interface DrivetimelocationListOpenConfirm {
  type: DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface DrivetimelocationListCloseConfirm {
  type: DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_CLOSE_CONFIRM;
}

export type DrivetimelocationListAction =
  DrivetimelocationListFetchStarted
  | DrivetimelocationListFetchSuccess
  | DrivetimelocationListFetchError
  | DrivetimelocationListDeleteStarted
  | DrivetimelocationListDeleteSuccess
  | DrivetimelocationListDeleteError
  | DrivetimelocationListOpenConfirm
  | DrivetimelocationListCloseConfirm
