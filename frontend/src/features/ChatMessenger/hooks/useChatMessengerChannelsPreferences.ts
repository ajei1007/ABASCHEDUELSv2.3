import { useEffect, useState, useCallback } from 'react';
import { useChatMessengerClientContext } from '../context/ChatMessengerClientContext';
import { useChatMessengerEventBusContext } from '../context/ChatMessengerEventBusContext';
import type { PreferenceType } from '@mattermost/types/preferences';

export function useChatMessengerChannelsPreferences() {
  const { mmUserId, mmApiClient } = useChatMessengerClientContext();
  const { eventBus } = useChatMessengerEventBusContext();

  const [directChannelPrefs, setDirectChannelPrefs] = useState<
    PreferenceType[]
  >([]);
  const [prefFetchStatus, setPrefsFetchStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle');

  const fetchDirectChannelPrefs = useCallback(async () => {
    if (!mmApiClient || !mmUserId) {
      return;
    }

    setPrefsFetchStatus('loading');

    try {
      const prefs = await mmApiClient.makeRequest<PreferenceType[]>({
        url: `users/${mmUserId}/preferences/direct_channel_show`,
        method: 'get',
      });

      setDirectChannelPrefs(prefs || []);
      setPrefsFetchStatus('idle');
    } catch (error: any) {
      if (error?.status_code === 404) {
        console.warn('No user preferences found for direct channel show');
        setDirectChannelPrefs([]);
      } else {
        console.error('Error fetching channel preferences:', error);
        setPrefsFetchStatus('error');
      }
    }
  }, [mmApiClient, mmUserId]);

  useEffect(() => {
    if (!mmApiClient || !mmUserId) {
      return;
    }

    fetchDirectChannelPrefs();

    eventBus.on('directChannelCreated', fetchDirectChannelPrefs);
    eventBus.on('directChannelClosed', fetchDirectChannelPrefs);

    return () => {
      eventBus.off('directChannelCreated', fetchDirectChannelPrefs);
      eventBus.off('directChannelClosed', fetchDirectChannelPrefs);
    };
  }, [eventBus, fetchDirectChannelPrefs, mmApiClient, mmUserId]);

  return {
    directChannelPrefs,
    prefFetchStatus,
    refetchDirectChannelPrefs: fetchDirectChannelPrefs,
  };
}
