// import { MOBILE_DEVICE_WIDTH } from 'constants/devices';
import type {NavigationAction, NavigationState} from "types/redux/navigation";
import { NavigationActionTypes } from "types/redux/navigation";

const initialState: NavigationState = {
  sidebarOpened: false,
  sidebarStatic: false,
  activeItem: JSON.parse(localStorage.getItem('staticSidebar') as string) ? window.location.pathname : null,
};

export default function runtime(state = initialState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case NavigationActionTypes.OPEN_SIDEBAR:
      return Object.assign({}, state, {
        sidebarOpened: true,
      });
      case NavigationActionTypes.TOGGLE_SIDEBAR:
      return Object.assign({}, state, {
        sidebarStatic: !state.sidebarStatic,
      });
    case NavigationActionTypes.CLOSE_SIDEBAR:
      return Object.assign({}, state, {
        sidebarOpened: false,
      });
    case NavigationActionTypes.CHANGE_ACTIVE_SIDEBAR_ITEM:
      return {
        ...state,
        activeItem: action.payload,
      };
    default:
      return state;
  }
}
