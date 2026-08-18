export interface FounderServiceLinesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}
export interface founderServiceLinesRecordState {
  id: string,
  name?: string,
  importHash?: null,
  createdAt?: Date | any,
  updatedAt?: Date | any,
  deletedAt?: null,
  createdById?: string,
  updatedById?: string
}


export enum FounderServiceLinesFormActionTypes {
FOUNDER_SERVICE_LINES_FORM_RESET = "FOUNDER_SERVICE_LINES_FORM_RESET",
  FOUNDER_SERVICE_LINES_FORM_FIND_STARTED = "FOUNDER_SERVICE_LINES_FORM_FIND_STARTED",
    FOUNDER_SERVICE_LINES_FORM_FIND_SUCCESS = "FOUNDER_SERVICE_LINES_FORM_FIND_SUCCESS",
      FOUNDER_SERVICE_LINES_FORM_FIND_ERROR = "FOUNDER_SERVICE_LINES_FORM_FIND_ERROR",
        FOUNDER_SERVICE_LINES_FORM_CREATE_STARTED = "FOUNDER_SERVICE_LINES_FORM_CREATE_STARTED",
          FOUNDER_SERVICE_LINES_FORM_CREATE_SUCCESS = "FOUNDER_SERVICE_LINES_FORM_CREATE_SUCCESS",
            FOUNDER_SERVICE_LINES_FORM_CREATE_ERROR = "FOUNDER_SERVICE_LINES_FORM_CREATE_ERROR",
              FOUNDER_SERVICE_LINES_FORM_UPDATE_STARTED = "FOUNDER_SERVICE_LINES_FORM_UPDATE_STARTED",
                FOUNDER_SERVICE_LINES_FORM_UPDATE_SUCCESS = "FOUNDER_SERVICE_LINES_FORM_UPDATE_SUCCESS",
                  FOUNDER_SERVICE_LINES_FORM_UPDATE_ERROR = "FOUNDER_SERVICE_LINES_FORM_UPDATE_ERROR",
}

interface FounderServiceLinesFormReset {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_RESET;
}

interface FounderServiceLinesFormFindStarted {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_FIND_STARTED;
}

interface FounderServiceLinesFormFindSuccess {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_FIND_SUCCESS;
  payload: founderServiceLinesRecordState;
}

interface FounderServiceLinesFormFindError {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_FIND_ERROR;
}

interface FounderServiceLinesFormCreateStarted {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_CREATE_STARTED;
}

interface FounderServiceLinesFormCreateSuccess {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_CREATE_SUCCESS;
}

interface FounderServiceLinesFormCreateError {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_CREATE_ERROR;
}

interface FounderServiceLinesFormUpdateStarted {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_UPDATE_STARTED;
}

interface FounderServiceLinesFormUpdateSuccess {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_UPDATE_SUCCESS;
}

interface FounderServiceLinesFormUpdateError {
  type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_UPDATE_ERROR;
}

export type FounderServiceLinesFormAction =
  FounderServiceLinesFormReset
  | FounderServiceLinesFormFindStarted
  | FounderServiceLinesFormFindSuccess
  | FounderServiceLinesFormFindError
  | FounderServiceLinesFormCreateStarted
  | FounderServiceLinesFormCreateSuccess
  | FounderServiceLinesFormCreateError
  | FounderServiceLinesFormUpdateStarted
  | FounderServiceLinesFormUpdateSuccess
  | FounderServiceLinesFormUpdateError
