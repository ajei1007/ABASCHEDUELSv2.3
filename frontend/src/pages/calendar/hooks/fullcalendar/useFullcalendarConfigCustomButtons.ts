import { useState, useMemo } from 'react';
import { duration_interval } from '../../constants';
import { useFullcalendarApiContext } from '../../context/FullcalendarApiContext';

export function useFullcalendarConfigCustomButtons() {
  const [duration, setDuration] = useState(3);

  const { calendarApi } = useFullcalendarApiContext();

  const customButtons = useMemo(() => {
    return {
      Decrease: {
        text: '-',
        click: function () {
          const new_duration =
            duration + 1 >= duration_interval.length ? 0 : duration + 1;
          if (new_duration !== 0) {
            setDuration(new_duration);
            calendarApi?.setOption(
              'slotLabelInterval',
              duration_interval[new_duration][1],
            );
          }
        },
      },
      Increase: {
        text: '+',
        click: function () {
          const new_duration =
            duration - 1 < 0 ? duration_interval.length - 1 : duration - 1;
          if (new_duration !== duration_interval.length - 1) {
            setDuration(new_duration);
            calendarApi?.setOption(
              'slotLabelInterval',
              duration_interval[new_duration][1],
            );
          }
        },
      },
    };
  }, [duration, calendarApi]);

  return {
    customButtons,
    duration,
  };
}
