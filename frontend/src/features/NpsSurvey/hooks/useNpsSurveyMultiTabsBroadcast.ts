import React, { useEffect, useCallback } from 'react';
import { useAppDispatch } from 'store/hooks';
import {
  setNpsSurveyModalShown,
  getNpsSurveyModalShown,
} from 'store/slices/npsSurvey/actions';

// Define a type for broadcast messages
interface NpsSurveyBroadcastMessage {
  type: 'update_modal_shown' | 'new_tab_opened';
  data: boolean;
}

export function useNpsSurveyMultiTabsBroadcast() {
  const dispatch = useAppDispatch();

  // Memoized handler for broadcasting modal shown state
  const channelRef = React.useRef<BroadcastChannel | null>(null);

  // Unconditionally broadcasts the modal shown state to other tabs
  const broadcastModalShownState = useCallback(
    ({ modalShown }: { modalShown: boolean }) => {
      channelRef.current?.postMessage({
        type: 'update_modal_shown',
        data: modalShown,
      });
    },
    [],
  );

  // Broadcasts the modal shown state only if it has changed
  const syncModalShownStateAcrossTabs = useCallback(
    ({ modalShown }: { modalShown: boolean }) => {
      const currentModalShown = dispatch(getNpsSurveyModalShown());
      if (currentModalShown !== modalShown) {
        dispatch(setNpsSurveyModalShown(modalShown));
        broadcastModalShownState({ modalShown });
      }
    },
    [broadcastModalShownState],
  );

  useEffect(() => {
    const channel = new BroadcastChannel('nps_survey');
    channelRef.current = channel;

    const handleMessageReceive = (
      e: MessageEvent<NpsSurveyBroadcastMessage>,
    ) => {
      const eventData = e.data;

      // get modalShown state from the store
      const modalShown = dispatch(getNpsSurveyModalShown());

      // Handle different message types
      switch (eventData.type) {
        case 'update_modal_shown': {
          const newModalShown = !!eventData.data;
          if (newModalShown !== modalShown) {
            dispatch(setNpsSurveyModalShown(newModalShown));
          }
          break;
        }
        case 'new_tab_opened': {
          if (modalShown) {
            broadcastModalShownState({ modalShown });
          }
          break;
        }
        default:
          break;
      }
    };

    channel.addEventListener('message', handleMessageReceive);
    // Notify other tabs that a new tab has been opened
    channel.postMessage({
      type: 'new_tab_opened',
      data: true,
    });

    return () => {
      channel.removeEventListener('message', handleMessageReceive);
      channel.close();
    };
  }, [dispatch]);

  return {
    syncModalShownStateAcrossTabs,
  };
}
