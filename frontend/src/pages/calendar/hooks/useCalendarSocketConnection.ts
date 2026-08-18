import { useEffect } from 'react';
import socket from 'services/socket';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { socketEvent } from 'store/slices/calendar/thunks';

export function useCalendarSocketConnection() {
  const dispatch = useAppDispatch();

  const storeVisibleResources = useAppSelector(
    (state) => state.calendar.visibleResources,
  );

  const handleSocketMessage = useLatestCallback((receivedData: any) => {
    if (receivedData.data) {
      dispatch(socketEvent(receivedData.data));
    }
  });

  const handleSocketReconnect = useLatestCallback(() => {
    storeVisibleResources.forEach(({ id, person }) => {
      if (person) {
        socket.emit('join_room', id);
      }
    });
  });

  useEffect(() => {
    socket.on('receive_message', handleSocketMessage);
    socket.on('connect', handleSocketReconnect);

    return () => {
      socket.off('receive_message', handleSocketMessage);
      socket.off('connect', handleSocketReconnect);
    };
  }, [handleSocketMessage, handleSocketReconnect]);
}
