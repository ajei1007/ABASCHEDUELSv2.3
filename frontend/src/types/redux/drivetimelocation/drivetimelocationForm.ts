export interface DrivetimelocationFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
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
export interface drivetimelocationRecordState {
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

export enum DrivetimelocationFormActionTypes {
DRIVETIMELOCATION_FORM_RESET = "DRIVETIMELOCATION_FORM_RESET",
  DRIVETIMELOCATION_FORM_FIND_STARTED = "DRIVETIMELOCATION_FORM_FIND_STARTED",
    DRIVETIMELOCATION_FORM_FIND_SUCCESS = "DRIVETIMELOCATION_FORM_FIND_SUCCESS",
      DRIVETIMELOCATION_FORM_FIND_ERROR = "DRIVETIMELOCATION_FORM_FIND_ERROR",
        DRIVETIMELOCATION_FORM_CREATE_STARTED = "DRIVETIMELOCATION_FORM_CREATE_STARTED",
          DRIVETIMELOCATION_FORM_CREATE_SUCCESS = "DRIVETIMELOCATION_FORM_CREATE_SUCCESS",
            DRIVETIMELOCATION_FORM_CREATE_ERROR = "DRIVETIMELOCATION_FORM_CREATE_ERROR",
              DRIVETIMELOCATION_FORM_UPDATE_STARTED = "DRIVETIMELOCATION_FORM_UPDATE_STARTED",
                DRIVETIMELOCATION_FORM_UPDATE_SUCCESS = "DRIVETIMELOCATION_FORM_UPDATE_SUCCESS",
                  DRIVETIMELOCATION_FORM_UPDATE_ERROR = "DRIVETIMELOCATION_FORM_UPDATE_ERROR",
}

interface DrivetimelocationFormReset {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_RESET;
}

interface DrivetimelocationFormFindStarted {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_FIND_STARTED;
}

interface DrivetimelocationFormFindSuccess {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_FIND_SUCCESS;
  payload: drivetimelocationRecordState;
}

interface DrivetimelocationFormFindError {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_FIND_ERROR;
}

interface DrivetimelocationFormCreateStarted {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_CREATE_STARTED;
}

interface DrivetimelocationFormCreateSuccess {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_CREATE_SUCCESS;
}

interface DrivetimelocationFormCreateError {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_CREATE_ERROR;
}

interface DrivetimelocationFormUpdateStarted {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_UPDATE_STARTED;
}

interface DrivetimelocationFormUpdateSuccess {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_UPDATE_SUCCESS;
}

interface DrivetimelocationFormUpdateError {
  type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_UPDATE_ERROR;
}

export type DrivetimelocationFormAction =
  DrivetimelocationFormReset
  | DrivetimelocationFormFindStarted
  | DrivetimelocationFormFindSuccess
  | DrivetimelocationFormFindError
  | DrivetimelocationFormCreateStarted
  | DrivetimelocationFormCreateSuccess
  | DrivetimelocationFormCreateError
  | DrivetimelocationFormUpdateStarted
  | DrivetimelocationFormUpdateSuccess
  | DrivetimelocationFormUpdateError
