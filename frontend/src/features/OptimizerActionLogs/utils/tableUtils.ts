import moment from 'moment';
import type { IApiOptimizerActionLogItem } from 'types/api';
import { DATE_FORMAT } from '../constants/tableConstants';

/**
 * Formats a date string to a consistent format
 */
export const formatDateTime = (dateTime: string): string => {
  return moment(dateTime).format(DATE_FORMAT);
};

/**
 * Calculates and formats the duration between start and end times
 */
export const formatDuration = (startTime: string, endTime: string): string => {
  const duration = moment(endTime).diff(moment(startTime), 'seconds');
  if (duration >= 60) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes} minutes ${seconds} seconds`;
  }
  return `${duration} seconds`;
};

/**
 * Returns the appropriate chip color based on status
 */
export const getStatusChipColor = (status: string) => {
  switch (status) {
    case 'success':
      return '#4caf50!important';
    case 'failed':
      return '#f44336!important';
    default:
      return '#ff9800!important'; // default to warning color
  }
};

/**
 * Formats the user's full name from first and last name
 */
export const getUserFullName = (
  user: IApiOptimizerActionLogItem['triggerByUser'],
): string => {
  const { firstName = '', lastName = '' } = user || {};
  return [firstName, lastName].filter(Boolean).join(' ') || 'N/A';
};
