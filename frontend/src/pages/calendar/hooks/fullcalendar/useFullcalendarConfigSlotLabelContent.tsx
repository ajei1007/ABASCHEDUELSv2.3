import SlotLabelContent from '../../components/fullcalendar/SlotLabelContent';

const slotLabelContent = (arg: any) => (
  <>
    <SlotLabelContent
      calendarViewType={arg?.view?.type}
      text={arg.text}
      level={arg.level}
      timestamp={new Date(arg.date).getTime()}
    />
  </>
);

export function useFullcalendarConfigSlotLabelContent() {
  return slotLabelContent;
}
