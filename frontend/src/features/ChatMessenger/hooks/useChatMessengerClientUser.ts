import { useAppSelector } from 'store/hooks';

export interface UseChatMessengerClientUserReturn {
  mmUserId: string | undefined;
  mmUserTeamId: string | undefined;
  hasValidUser: boolean;
}

export function useChatMessengerClientUser(): UseChatMessengerClientUserReturn {
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  const mmUserId = currentUser?.mattermostUser?.mattermostUserId;
  const mmUserTeamId = currentUser?.mattermostUser?.mattermostTeamId;

  return {
    mmUserId,
    mmUserTeamId,
    hasValidUser: !!mmUserId,
  };
}
