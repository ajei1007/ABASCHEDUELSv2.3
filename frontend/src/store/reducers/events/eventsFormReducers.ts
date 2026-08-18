/* eslint-disable import/no-anonymous-default-export */
import {
  type EventsFormState,
  type EventsFormAction,
  EventsFormActionTypes
} from "types/redux/events/eventsForm";

const initialData: EventsFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: EventsFormAction): EventsFormState => {
  switch (action.type) {
    case EventsFormActionTypes.EVENTS_FORM_RESET:
      return {
        ...state,
      }
    case EventsFormActionTypes.EVENTS_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case EventsFormActionTypes.EVENTS_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case EventsFormActionTypes.EVENTS_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case EventsFormActionTypes.EVENTS_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case EventsFormActionTypes.EVENTS_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case EventsFormActionTypes.EVENTS_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case EventsFormActionTypes.EVENTS_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case EventsFormActionTypes.EVENTS_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case EventsFormActionTypes.EVENTS_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
