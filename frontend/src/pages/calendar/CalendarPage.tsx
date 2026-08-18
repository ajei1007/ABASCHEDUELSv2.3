import ComposeProviders from 'components/ComposeProviders';
import Calendar from './Calendar';
import { FullcalendarApiContextProvider } from './context/FullcalendarApiContext';
import { CalendarViewContextProvider } from './context/CalendarViewContext';
import { CalendarCopyModeContextProvider } from './context/CalendarCopyModeContext';
import { CalendarSelectedEventsContextProvider } from './context/CalendarSelectedEventsContext';
import { CalendarSelectedResourcesContextProvider } from './context/CalendarSelectedResourcesContext';
import { CalendarOptimizerJobUtilsContextProvider } from './context/CalendarOptimizerJobUtilsContext';

const providers = [
  FullcalendarApiContextProvider,
  CalendarCopyModeContextProvider,
  CalendarSelectedEventsContextProvider,
  CalendarSelectedResourcesContextProvider,
  CalendarViewContextProvider,
  CalendarOptimizerJobUtilsContextProvider,
];

const CalendarPage = () => {
  return (
    <ComposeProviders providers={providers}>
      <Calendar />
    </ComposeProviders>
  );
};

export default CalendarPage;
