import axios from 'axios';
import moment from 'moment';
import { NotificationsActionTypes } from 'types/redux/notifications';

export const setNotificationsLoading = () => ({
  type: NotificationsActionTypes.SET_NOTIFICATIONS_LOADING,
});

export const setNotifications = (notifications: any[]) => ({
  type: NotificationsActionTypes.SET_NOTIFICATIONS,
  payload: notifications,
});
export const getNotificationsPending = () => ({
  type: NotificationsActionTypes.GET_NOTIFICATIONS_PENDING,
});

export const getNotificationsFulfilled = (
  notifications: any[], 
) => ({
  type: NotificationsActionTypes.GET_NOTIFICATIONS_FULFILLED,
  payload: notifications,
});

export const getNotificationsRejected = (error: string) => ({
  type: NotificationsActionTypes.GET_NOTIFICATIONS_REJECTED,
  payload: error,
});

export const updateNotificationAction = (
  notification: { id: number; checked: boolean }, 
) => ({
  type: NotificationsActionTypes.UPDATE_NOTIFICATION,
  payload: notification,
});

export const toggleIsNotificationsMenuOpen = (isNotificationsMenuOpen: boolean) => ({
  type: NotificationsActionTypes.TOGGLE_IS_NOTIFICATIONS_MENU_OPEN,
  payload: isNotificationsMenuOpen,
});

export const getNotifications = () => async (dispatch: any, getState: any) => {
  try {
    const state = getState();
    const start = moment().subtract(1, 'weeks').format(); 
    const end = moment().add(1, 'weeks').format();
    const fStart = encodeURIComponent(start);
    const fEnd = encodeURIComponent(end);
    const response = await axios.get('/pushnotifications', {
      params: {
        createdAtRange: [fStart, fEnd],
        users: state.auth.currentUser.id, 
      },
    });
    console.log('response', response);
    dispatch(getNotificationsFulfilled(response.data.rows));
  } catch (error) {
    const errorMessage =
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : (error as Error).message || 'Failed to fetch notifications';

    dispatch(getNotificationsRejected(errorMessage));
  }
};

export const updateNotifications =
  (updatedNotifications : any) =>
  async (dispatch: any) => {
    try {
      const obj = {
        data: updatedNotifications,
      }
      const response = await axios.put(`/pushnotifications/read/bulk`, obj);
      dispatch(updateNotificationAction(response.data)); 
    } catch (error) {
      console.error('Failed to update notification:', error);
    }
  };
