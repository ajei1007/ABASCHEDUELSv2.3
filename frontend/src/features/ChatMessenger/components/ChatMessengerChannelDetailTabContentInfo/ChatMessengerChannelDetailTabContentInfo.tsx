import { useState } from 'react';
import { useActiveChannelDetails } from '../../hooks/useActiveChannelDetails';
import InfoViewMode from './InfoViewMode';
import InfoEditMode from './InfoEditMode';

const ChatMessengerChannelDetailTabContentInfo = ({
  onChannelClosed = () => {},
}: {
  onChannelClosed?: () => void;
}) => {
  const { channelType, channelAvatar, channelColor, channelTitle } =
    useActiveChannelDetails();

  const [mode, setMode] = useState('view');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'view' ? 'edit' : 'view'));
  };

  return mode === 'edit' ? (
    <InfoEditMode toggleMode={toggleMode} />
  ) : (
    <InfoViewMode
      channelType={channelType}
      channelColor={channelColor}
      channelAvatar={channelAvatar}
      channelTitle={channelTitle}
      toggleMode={toggleMode}
      onChannelClosed={onChannelClosed}
    />
  );
};

export default ChatMessengerChannelDetailTabContentInfo;
