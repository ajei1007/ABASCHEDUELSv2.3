/* eslint-disable import/no-anonymous-default-export */
import {
  type DrivetimelocationListState,
  type DrivetimelocationListAction,
  DrivetimelocationListActionTypes
} from "types/redux/drivetimelocation/drivetimelocationList";

const initialData: DrivetimelocationListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: DrivetimelocationListAction): DrivetimelocationListState => {
  switch (action.type) {
    case DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case DrivetimelocationListActionTypes.DRIVETIMELOCATION_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
