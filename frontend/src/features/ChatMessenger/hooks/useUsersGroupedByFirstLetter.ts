import { useMemo } from 'react';
import type { IApiChatAvailableUserItem } from 'types/api';

export const useUsersGroupedByFirstLetter = (
  users: IApiChatAvailableUserItem[],
) => {
  const usersGroupedByFirstLetter = useMemo(() => {
    const groups: Record<string, IApiChatAvailableUserItem[]> = {};
    users.forEach((user) => {
      const firstLetter =
        user.fullName?.trim()?.charAt(0).toUpperCase() || 'Other';
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(user);
    });
    return groups;
  }, [users]);

  return usersGroupedByFirstLetter;
};
