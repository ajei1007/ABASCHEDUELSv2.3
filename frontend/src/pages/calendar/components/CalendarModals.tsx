import type { FC } from 'react';
import ApprovalsModal from '../components/modals/ApprovalsModal/ApprovalsModal';
import ConstraintsModal from '../components/modals/ConstraintsModal/ConstraintsModal';
import DistanceModal from '../components/modals/DistanceModal/DistanceModal';
import FiltersModal from '../components/modals/FiltersModal/FiltersModal';
import FlaggingModal from '../components/modals/FlaggingModal/FlaggingModal';
import MailsModal from '../components/modals/MailsModal/MailsModal';
import OptimizerModal from '../components/modals/OptimizerModal/OptimizerModal';
import OptimizerResultsDisabledConstraintsModal from '../components/modals/OptimizerResultsDisabledConstraintsModal/OptimizerResultsDisabledConstraintsModal';
import OptimizerResultsEmptyModal from '../components/modals/OptimizerResultsEmptyModal/OptimizerResultsEmptyModal';
import OptimizerResultsModal from '../components/modals/OptimizerResultsModal/OptimizerResultsModal';
import RequestsModal from '../components/modals/RequestsModal/RequestsModal';
import SettingsModal from '../components/modals/SettingsModal/SettingsModal';
import SolutionGeneratorConflictingEventsModal from '../components/modals/SolutionGeneratorConflictingEventsModal/SolutionGeneratorConflictingEventsModal';
import SolutionGeneratorReplaceEventsModal from '../components/modals/SolutionGeneratorReplaceEventsModal/SolutionGeneratorReplaceEventsModal';
import DownloadPdfModal from './modals/DownloadPdfModal/DownloadPdfModal';
import ExportCalendarModal from './modals/ExportCalendarModal/ExportCalendarModal';
import IntegrationModal from '../components/integrations/IntegrationLoginModal';
import NewIntegrationLoginModal from '../components/new-integrations/NewIntegrationLoginModal';
import NewIntegrationModal from '../components/new-integrations/NewIntegrationModal';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';

const CalendarModals: FC = () => {
  const { resetAnySelected } = useCalendarSelectedResourcesContext();

  return (
    <>
      {/* Settings Modal */}
      <SettingsModal />

      {/* Filters Modal */}
      <FiltersModal />

      {/* Constraints Modal */}
      <ConstraintsModal />

      {/* Optimizer Modal */}
      <OptimizerModal />

      {/* Optimizer Results Modals */}
      <OptimizerResultsModal />
      <OptimizerResultsEmptyModal />
      <OptimizerResultsDisabledConstraintsModal />

      {/* Solution Generator Modals */}
      <SolutionGeneratorReplaceEventsModal onSuccess={resetAnySelected} />
      <SolutionGeneratorConflictingEventsModal onSuccess={resetAnySelected} />

      {/* Request and Approvals Modals */}
      <RequestsModal />
      <ApprovalsModal />

      {/* Communication Modals */}
      <MailsModal />
      <FlaggingModal />

      {/* Utility Modals */}
      <DistanceModal />

      {/* Event Export Modals */}
      <DownloadPdfModal />
      <ExportCalendarModal />

      {/* Integration Modals */}
      <IntegrationModal />
      <NewIntegrationLoginModal />
      <NewIntegrationModal />
    </>
  );
};

CalendarModals.displayName = 'CalendarModals';

export default CalendarModals;
