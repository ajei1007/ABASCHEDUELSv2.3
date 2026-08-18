import { useEffect, useState, useCallback } from 'react';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';
import { useChatMessengerEventBusContext } from '../context/ChatMessengerEventBusContext';
import type { ServerChannel } from '@mattermost/types/channels';
import type { UserProfile } from '@mattermost/types/users';

function extractDirectChannelUserIds(
  directChannels: ServerChannel[],
): string[] {
  return directChannels.flatMap((channel) => channel.name.split('__'));
}

function getDisplayName(user: UserProfile): string {
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  return fullName || user.username;
}

export function useChatMessengerChannelsFetch() {
  const { mmUserId, mmUserTeamId, mmApiClient } =
    useChatMessengerClientContext();

  const { eventBus } = useChatMessengerEventBusContext();

  const [channels, setChannels] = useState<ServerChannel[]>([]);
  const [channelsFetchStatus, setChannelsFetchStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle');

  const fetchUsersMap = useCallback(
    async (userIds: string[]): Promise<Record<string, UserProfile>> => {
      if (userIds.length === 0) {
        return {};
      }

      const users = await mmApiClient!.makeRequest<UserProfile[]>({
        url: 'users/ids',
        method: 'post',
        data: userIds,
      });

      return users.reduce(
        (acc, user) => {
          acc[user.id] = user;
          return acc;
        },
        {} as Record<string, UserProfile>,
      );
    },
    [mmApiClient],
  );

  const enhanceDirectChannel = useCallback(
    (
      channel: ServerChannel,
      usersMap: Record<string, UserProfile>,
    ): ServerChannel => {
      const userIds = channel.name.split('__');
      const otherUserId = userIds.find((id) => id !== mmUserId);

      if (!otherUserId || !usersMap[otherUserId]) {
        return channel;
      }

      const otherUser = usersMap[otherUserId];
      const displayName = getDisplayName(otherUser);

      return {
        ...channel,
        display_name: displayName,
      };
    },
    [mmUserId],
  );

  const enhanceDirectChannelsWithUserInfo = useCallback(
    async (channels: ServerChannel[]): Promise<ServerChannel[]> => {
      const directChannels = channels.filter((channel) => channel.type === 'D');

      if (directChannels.length === 0) {
        return channels;
      }

      const userIds = extractDirectChannelUserIds(directChannels);
      const usersMap = await fetchUsersMap(userIds);

      return channels.map((channel) =>
        channel.type === 'D'
          ? enhanceDirectChannel(channel, usersMap)
          : channel,
      );
    },
    [mmApiClient, mmUserId, fetchUsersMap, enhanceDirectChannel],
  );

  const fetchChannels = useCallback(async () => {
    if (!mmApiClient || !mmUserId || !mmUserTeamId) {
      return;
    }

    setChannelsFetchStatus('loading');
    try {
      const _fetch = async () => {
        const channels = await mmApiClient!.makeRequest<ServerChannel[]>({
          url: `users/${mmUserId}/teams/${mmUserTeamId}/channels`,
          method: 'get',
        });
        return channels.filter(
          (channel) => channel.type === 'D' || channel.type === 'P',
        );
      };

      const channels = await _fetch();
      const enhancedChannels =
        await enhanceDirectChannelsWithUserInfo(channels);

      setChannels(enhancedChannels);
      setChannelsFetchStatus('idle');
    } catch (error) {
      console.error('Error fetching channels:', error);
      setChannelsFetchStatus('error');
    }
  }, [mmApiClient, mmUserId, mmUserTeamId, enhanceDirectChannelsWithUserInfo]);

  useEffect(() => {
    fetchChannels();

    eventBus.on('groupChannelCreated', fetchChannels);
    eventBus.on('groupChannelUpdated', fetchChannels);
    eventBus.on('groupChannelDeleted', fetchChannels);
    eventBus.on('groupChannelUndeleted', fetchChannels);
    eventBus.on('directChannelCreated', fetchChannels);
    eventBus.on('kickedFromGroupChannel', fetchChannels);
    eventBus.on('leftGroupChannel', fetchChannels);

    return () => {
      eventBus.off('groupChannelCreated', fetchChannels);
      eventBus.off('groupChannelUpdated', fetchChannels);
      eventBus.off('groupChannelDeleted', fetchChannels);
      eventBus.off('groupChannelUndeleted', fetchChannels);
      eventBus.off('directChannelCreated', fetchChannels);
      eventBus.off('kickedFromGroupChannel', fetchChannels);
      eventBus.off('leftGroupChannel', fetchChannels);
    };
  }, [fetchChannels, eventBus]);

  return {
    channels,
    channelsFetchStatus,
    refetchChannels: fetchChannels,
  };
}
