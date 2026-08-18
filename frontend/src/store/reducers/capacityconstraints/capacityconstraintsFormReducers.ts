/* eslint-disable import/no-anonymous-default-export */
import {
  type CapacityconstraintsFormState,
  type CapacityconstraintsFormAction,
  CapacityconstraintsFormActionTypes
} from "types/redux/capacityconstraints/capacityconstraintsForm";

const initialData: CapacityconstraintsFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: CapacityconstraintsFormAction): CapacityconstraintsFormState => {
  switch (action.type) {
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_RESET:
      return {
        ...state,
      }
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
