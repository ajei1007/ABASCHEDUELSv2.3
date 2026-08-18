import type { ServerChannel } from '@mattermost/types/channels';
import { useChannelDetails } from './useChannelDetails';

export function useChannelListItemDetails({
  channel,
}: {
  channel: ServerChannel;
}) {
  const { channelType, channelAvatar, channelTitle, channelColor } =
    useChannelDetails(channel);

  return {
    channelType,
    channelAvatar,
    channelTitle,
    channelColor,
  };
}
