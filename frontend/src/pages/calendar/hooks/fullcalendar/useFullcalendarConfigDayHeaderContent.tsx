import CalendarDayHeaderContent from '../../components/CalendarDayHeaderContent';

const dayHeaderContent = (arg: any) => (
  <CalendarDayHeaderContent
    calendarViewType={arg?.view?.type}
    text={arg.text}
    timestamp={new Date(arg.date).getTime()}
  />
);

export function useFullcalendarConfigDayHeaderContent() {
  return dayHeaderContent;
}
