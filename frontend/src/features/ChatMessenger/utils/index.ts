import moment from 'moment';
import type { ChannelMembership } from '@mattermost/types/channels';
import type { TChannelMember } from '../types';

// Alternative version that handles more edge cases and supports more than 2 initials
export function formatNameInitial(
  str: string,
  maxInitials: number = 2,
): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  const chunks = str
    .trim()
    .split(/\s+/)
    .filter((chunk) => chunk.length > 0);

  if (chunks.length === 0) {
    return '';
  }

  // Multiple words case
  if (chunks.length > 1) {
    return chunks
      .slice(0, maxInitials)
      .map((chunk) => chunk[0])
      .join('')
      .toUpperCase();
  }

  // Single word case
  const chunk = chunks[0];
  if (chunk.length === 1) {
    return chunk.toUpperCase();
  }

  return `${chunk[0]}${chunk[chunk.length - 1]}`.toUpperCase();
}

export function formatSmartDate(date: string | number | Date) {
  const inputDate = moment(date);
  const now = moment();

  // Check if it's today
  if (inputDate.isSame(now, 'day')) {
    return inputDate.format('HH:mm'); // 24-hour format, use 'h:mm A' for 12-hour
  }

  // Check if it's yesterday
  if (inputDate.isSame(moment().subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }

  // Check if it's within current week (Sunday to Saturday)
  const startOfWeek = moment().startOf('week');
  const endOfWeek = moment().endOf('week');

  if (inputDate.isBetween(startOfWeek, endOfWeek, 'day', '[]')) {
    return inputDate.format('dddd'); // Full day name (Monday, Tuesday, etc.)
  }

  // For all other cases, show dd.mm.yyyy
  return inputDate.format('MM/DD/YYYY');
}

export function formatDateLastSeen(
  lastSeenDate: string | Date | number,
): string {
  const lastSeen = moment(lastSeenDate);
  return `Last seen ${lastSeen.fromNow()}`;
}

export function getUserFullName(user: TChannelMember['user']) {
  return (
    `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
    user.username ||
    ''
  );
}

export function isMemberChannelAdmin(membership: ChannelMembership) {
  const roles = membership.roles.split(' ').map((role) => role.trim());
  return ['channel_admin'].some((role) => roles.includes(role));
}
