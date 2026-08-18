import { useCallback, useRef } from 'react';
import resizingNum from '../../classes/ResizingNum';

export function useFullcalendarConfigEventChange({
  handleReplaceEvents,
}: {
  handleReplaceEvents: (eventInfo: any) => void;
}) {
  const isEventDragging = useRef(false);
  const isEventDraggingStopped = useRef(false);

  const eventDragStart = useCallback(() => {
    resizingNum.increment();
    isEventDragging.current = true;
    isEventDraggingStopped.current = false;
  }, []);

  const eventDragStop = useCallback(() => {
    resizingNum.decrement();
    isEventDragging.current = true;
    isEventDraggingStopped.current = true;
  }, []);

  const eventChange = useCallback(
    (eventInfo: any) => {
      if (isEventDragging.current && isEventDraggingStopped.current) {
        isEventDragging.current = false;
        return handleReplaceEvents(eventInfo);
      }
      isEventDragging.current = false;
    },
    [handleReplaceEvents],
  );

  return {
    eventDragStart,
    eventDragStop,
    eventChange,
  };
}
