/* eslint-disable import/no-anonymous-default-export */
import {
  type DistanceMatrixFormState,
  type DistanceMatrixFormAction,
  DistanceMatrixFormActionTypes
} from "types/redux/distanceMatrix/distanceMatrixForm";

const initialData: DistanceMatrixFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: DistanceMatrixFormAction): DistanceMatrixFormState => {
  switch (action.type) {
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_RESET:
      return {
        ...state,
      }
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
