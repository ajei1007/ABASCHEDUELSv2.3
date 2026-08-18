import { useChatMessengerChannelsFetch } from './useChatMessengerChannelsFetch';
import { useChatMessengerChannelsPreferences } from './useChatMessengerChannelsPreferences';
import { useChatMessengerChannelsVisibility } from './useChatMessengerChannelsVisibility';
import { useChatMessengerChannelsSubscription } from './useChatMessengerChannelsSubscription';

export function useChatMessengerChannels() {
  // Fetch channels and handle channel-related events
  const { channels, channelsFetchStatus } = useChatMessengerChannelsFetch();

  // Manage direct channel preferences
  const { directChannelPrefs, prefFetchStatus, refetchDirectChannelPrefs } =
    useChatMessengerChannelsPreferences();

  // Calculate visible channels based on preferences
  const { visibleChannels } = useChatMessengerChannelsVisibility({
    channels,
    directChannelPrefs,
  });

  // Handle incoming messages to auto-show hidden channels
  useChatMessengerChannelsSubscription({
    directChannelPrefs,
    refetchDirectChannelPrefs,
  });

  // Compute combined loading and error states
  const channelsLoading =
    channelsFetchStatus === 'loading' || prefFetchStatus === 'loading';
  const channelsHasError =
    channelsFetchStatus === 'error' || prefFetchStatus === 'error';

  return {
    channels: visibleChannels,
    channelsLoading,
    channelsHasError,
  };
}
