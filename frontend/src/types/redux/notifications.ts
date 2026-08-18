import type { Action } from 'redux';

export interface NotificationsState {
  notifications: any[],
  isNotificationsMenuOpen: boolean,
  notificationsLoading: boolean,
  error: any,
}

export enum NotificationsActionTypes {
  GET_NOTIFICATIONS_PENDING = 'GET_NOTIFICATIONS_PENDING',
  GET_NOTIFICATIONS_FULFILLED = 'GET_NOTIFICATIONS_FULFILLED',
  GET_NOTIFICATIONS_REJECTED = 'GET_NOTIFICATIONS_REJECTED',
  SET_NOTIFICATIONS_LOADING = 'SET_NOTIFICATIONS_LOADING',
  SET_NOTIFICATIONS = 'SET_NOTIFICATIONS',
  UPDATE_NOTIFICATION = 'UPDATE_NOTIFICATION',
  TOGGLE_IS_NOTIFICATIONS_MENU_OPEN = 'TOGGLE_IS_NOTIFICATIONS_MENU_OPEN'
}

export interface GetNotificationsPendingAction extends Action {
  type: NotificationsActionTypes.GET_NOTIFICATIONS_PENDING;
}

export interface GetNotificationsFulfilledAction extends Action {
  type: NotificationsActionTypes.GET_NOTIFICATIONS_FULFILLED;
  payload: any[];
}
export interface GetNotificationsRejectedAction extends Action {
  type: NotificationsActionTypes.GET_NOTIFICATIONS_REJECTED;
  payload: string; 
}


export interface SetNotificationsLoadingAction extends Action {
  type: NotificationsActionTypes.SET_NOTIFICATIONS_LOADING;
}

export interface SetNotificationsAction extends Action {
  type: NotificationsActionTypes.SET_NOTIFICATIONS;
  payload: any[];
}

export interface UpdateNotificationAction extends Action {
  type: NotificationsActionTypes.UPDATE_NOTIFICATION;
  payload: { id: number; message: string }; 
}

export interface ToggleIsNotificationsMenuOpen extends Action{
  type: NotificationsActionTypes.TOGGLE_IS_NOTIFICATIONS_MENU_OPEN,
  payload: boolean,
  isNotificationsMenuOpen: boolean;
};
export type NotificationsActions =
  | GetNotificationsPendingAction
  | GetNotificationsFulfilledAction
  | GetNotificationsRejectedAction
  | SetNotificationsLoadingAction
  | SetNotificationsAction
  | UpdateNotificationAction
  | ToggleIsNotificationsMenuOpen;