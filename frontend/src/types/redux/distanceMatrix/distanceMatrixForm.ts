export interface DistanceMatrixFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}
interface userState {
  birthday?: null | any,
  id?: string,
  capacity?: null | any,
  firstName?: string,
  lastName?: string,
  phoneNumber?: null | any,
  email?: string,
  email1?: null | any,
  email2?: null | any,
  titleCustom?: null | any,
  codeCustom?: null,
  role?: string,
  disabled?: boolean,
  needroom?: boolean,
  needseat?: boolean,
  overlap?: boolean,
  password?: string,
  emailVerified?: true,
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
  address?: null | any,
  longitude?: null | any,
  latitude?: null | any,
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
  address1RelationshipId?: null | any,
  address2RelationshipId?: null | any,
  createdById?: string,
  updatedById?: string
}
export interface distanceMatrixFormRecordState {
  id: string,
  address1?: null | any,
  address2?: null | any,
  distance?: null | any,
  duration?: null | any,
  duration_early?: null | any,
  duration_late?: null | any,
  importHash?: null | any,
  createdAt?: string,
  updatedAt?: string,
  deletedAt?: null | any,
  addy1Id?: null | any,
  addy2Id?: null | any,
  user1Id?: string,
  user2Id?: string,
  createdById?: string,
  updatedById?: string,
  addy1?: null | any,
  addy2?: null | any,
  user1?: userState,
  user2?: userState
}

export enum DistanceMatrixFormActionTypes {
DISTANCEMATRIX_FORM_RESET = "DISTANCEMATRIX_FORM_RESET",
  DISTANCEMATRIX_FORM_FIND_STARTED = "DISTANCEMATRIX_FORM_FIND_STARTED",
    DISTANCEMATRIX_FORM_FIND_SUCCESS = "DISTANCEMATRIX_FORM_FIND_SUCCESS",
      DISTANCEMATRIX_FORM_FIND_ERROR = "DISTANCEMATRIX_FORM_FIND_ERROR",
        DISTANCEMATRIX_FORM_CREATE_STARTED = "DISTANCEMATRIX_FORM_CREATE_STARTED",
          DISTANCEMATRIX_FORM_CREATE_SUCCESS = "DISTANCEMATRIX_FORM_CREATE_SUCCESS",
            DISTANCEMATRIX_FORM_CREATE_ERROR = "DISTANCEMATRIX_FORM_CREATE_ERROR",
              DISTANCEMATRIX_FORM_UPDATE_STARTED = "DISTANCEMATRIX_FORM_UPDATE_STARTED",
                DISTANCEMATRIX_FORM_UPDATE_SUCCESS = "DISTANCEMATRIX_FORM_UPDATE_SUCCESS",
                  DISTANCEMATRIX_FORM_UPDATE_ERROR = "DISTANCEMATRIX_FORM_UPDATE_ERROR",
}

interface DistanceMatrixFormReset {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_RESET;
}

interface DistanceMatrixFormFindStarted {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_FIND_STARTED;
}

interface DistanceMatrixFormFindSuccess {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_FIND_SUCCESS;
  payload: distanceMatrixFormRecordState;
}

interface DistanceMatrixFormFindError {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_FIND_ERROR;
}

interface DistanceMatrixFormCreateStarted {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_CREATE_STARTED;
}

interface DistanceMatrixFormCreateSuccess {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_CREATE_SUCCESS;
}

interface DistanceMatrixFormCreateError {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_CREATE_ERROR;
}

interface DistanceMatrixFormUpdateStarted {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_UPDATE_STARTED;
}

interface DistanceMatrixFormUpdateSuccess {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_UPDATE_SUCCESS;
}

interface DistanceMatrixFormUpdateError {
  type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_UPDATE_ERROR;
}

export type DistanceMatrixFormAction =
  DistanceMatrixFormReset
  | DistanceMatrixFormFindStarted
  | DistanceMatrixFormFindSuccess
  | DistanceMatrixFormFindError
  | DistanceMatrixFormCreateStarted
  | DistanceMatrixFormCreateSuccess
  | DistanceMatrixFormCreateError
  | DistanceMatrixFormUpdateStarted
  | DistanceMatrixFormUpdateSuccess
  | DistanceMatrixFormUpdateError
