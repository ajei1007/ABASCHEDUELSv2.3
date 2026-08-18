import { useMemo, createElement } from 'react';
import { Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { formatNameInitial } from '../utils';
import { generateColorsForName } from '../utils/colors';
import type { ServerChannel } from '@mattermost/types/channels';

export type ChannelType = 'D' | 'P' | 'other';

export function useChannelDetails(channel: ServerChannel | null | undefined) {
  const channelName = channel?.display_name ?? '';

  const channelType = useMemo((): ChannelType => {
    const type = channel?.type;
    return type === 'D' || type === 'P' ? type : 'other';
  }, [channel?.type]);

  const channelTitle = useMemo(() => {
    if (!channelName) {
      return channelType === 'P' ? 'Unknown Group' : 'Unknown User';
    }
    return channelName;
  }, [channelName, channelType]);

  const channelColor = useMemo(
    () => generateColorsForName(channelTitle),
    [channelTitle],
  );

  const channelAvatar = useMemo(() => {
    const iconProps = { sx: { fontSize: '1.75rem' } };
    const textProps = {
      letterSpacing: '1px',
      fontSize: '1.15rem!important',
      fontWeight: 'bold',
    };

    switch (channelType) {
      case 'other':
        return createElement(QuestionMarkIcon, iconProps);

      case 'P':
        return createElement(GroupIcon, iconProps);

      case 'D':
        return channelName
          ? createElement(Typography, {
              ...textProps,
              children: formatNameInitial(channelName),
            })
          : createElement(CloseIcon, iconProps);

      default:
        return createElement(Typography, {
          ...textProps,
          children: formatNameInitial(channelName || ''),
        });
    }
  }, [channelType, channelName]);

  return {
    channelName,
    channelType,
    channelAvatar,
    channelTitle,
    channelColor,
  };
}
