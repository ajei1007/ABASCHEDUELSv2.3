import { type NotificationsActions, NotificationsActionTypes, type NotificationsState } from "types/redux/notifications";

const initialState: NotificationsState = {
  notifications: [],
  isNotificationsMenuOpen: false,
  notificationsLoading: false,
  error: null,
};

export default function notificationsReducer(
  state = initialState,
  action: NotificationsActions,
): NotificationsState {
  switch (action.type) {
    case NotificationsActionTypes.SET_NOTIFICATIONS_LOADING:
      return { ...state, notificationsLoading: !state.notificationsLoading };
    case NotificationsActionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    case NotificationsActionTypes.UPDATE_NOTIFICATION: {
      const updatedNotif = action.payload;
      const updatedNotifications = state.notifications.map((notif) =>
        notif.id === updatedNotif.id ? updatedNotif : notif,
      );
      return { ...state, notifications: updatedNotifications };
    }
    case NotificationsActionTypes.GET_NOTIFICATIONS_PENDING:
      return { ...state, notificationsLoading: true };

    case NotificationsActionTypes.GET_NOTIFICATIONS_FULFILLED:
      return {
        ...state,
        notifications: action.payload,
        notificationsLoading: false,
      };

    case NotificationsActionTypes.GET_NOTIFICATIONS_REJECTED:
      return { ...state, notificationsLoading: false, error: action.payload };

    case NotificationsActionTypes.TOGGLE_IS_NOTIFICATIONS_MENU_OPEN:
      return {
        ...state,
        isNotificationsMenuOpen: action.payload,
      };
    default:
      return state;
  }
}
