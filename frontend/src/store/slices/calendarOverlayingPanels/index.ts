import { createSlice } from '@reduxjs/toolkit';
import {
  toggleRequestsModalOpen,
  toggleApprovalsModalOpen,
  toggleSettingsModalOpen,
  toggleFiltersModalOpen,
  toggleMailsModalOpen,
  toggleDistanceModalOpen,
  toggleConstraintsModalOpen,
  togglePdfModalOpen,
  toggleExportCalendarModalOpen,
  toggleRightSidebarOpen,
  toggleEventFormDrawerOpen,
  hideRequestsModal,
  hideApprovalsModal,
  hideSettingsModal,
  hideFiltersModal,
  hideMailsModal,
  hideDistanceModal,
  hideConstraintsModal,
  hidePdfModal,
  hideExportCalendarModal,
  hideRightSidebar,
  hideEventFormDrawer,
  showRightSidebar,
  showEventFormDrawer,
  hideAllModals,
} from './actions';
import { MOBILE_DEVICE_WIDTH } from 'constants/devices';

// ==============================
// INITIAL STATE
// ==============================

/**
 * Initial state for the calendar modals slice.
 *
 * The state contains boolean flags for managing the visibility of various modals
 * in the calendar interface:
 *
 * - requestsModalOpen: Controls the visibility of the requests modal for viewing
 *   and managing schedule requests
 * - approvalsModalOpen: Controls the visibility of the approvals modal for
 *   reviewing and approving schedule changes
 * - settingsModalOpen: Controls the visibility of the settings modal for
 *   configuring calendar preferences and options
 * - filtersModalOpen: Controls the visibility of the filters modal for
 *   setting up calendar view filters and search criteria
 * - mailsModalOpen: Controls the visibility of the mails modal for
 *   managing email notifications and communications
 * - distanceModalOpen: Controls the visibility of the distance modal for
 *   calculating and displaying travel distances between locations
 * - constraintsModalOpen: Controls the visibility of the constraints modal for
 *   configuring and managing scheduling constraints and validation rules
 * - pdfModalOpen: Controls the visibility of the PDF modal for displaying
 *   and generating PDF documents and reports
 * - exportCalendarModalOpen: Controls the visibility of the export calendar modal
 *   for configuring and executing calendar data export operations
 * - rightSidebarOpen: Controls the visibility of the right sidebar for displaying
 *   additional calendar information and quick actions
 * - eventFormDrawerOpen: Controls the visibility of the event form drawer for
 *   creating and editing calendar events
 *
 * All modals start in the closed state (false) by default.
 */
const initialState = {
  requestsModalOpen: false,
  approvalsModalOpen: false,
  settingsModalOpen: false,
  filtersModalOpen: false,
  mailsModalOpen: false,
  distanceModalOpen: false,
  constraintsModalOpen: false,
  pdfModalOpen: false,
  exportCalendarModalOpen: false,
  rightSidebarOpen: window.innerWidth > MOBILE_DEVICE_WIDTH,
  eventFormDrawerOpen: false,
};

// ==============================
// CALENDAR MODALS SLICE
// ==============================

/**
 * Redux slice for managing calendar modal states.
 *
 * This slice handles the visibility state of various modals used throughout
 * the calendar interface. Each modal can be independently toggled open or closed
 * using dedicated action creators.
 *
 * Key features:
 * - Independent state management for each modal
 * - Toggle functionality for opening/closing modals
 * - Centralized modal state management for the calendar feature
 * - Type-safe state updates using Redux Toolkit
 *
 * The slice uses extra reducers to handle actions created with createAction
 * from the actions file, providing a clean separation between action definitions
 * and reducer logic.
 */
const calendarOverlayingPanelsSlice = createSlice({
  name: 'calendarOverlayingPanels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /**
       * Toggles the visibility state of the requests modal.
       *
       * This modal is used for viewing and managing schedule requests,
       * allowing users to see pending requests and take appropriate actions.
       * The toggle action switches between open and closed states.
       */
      .addCase(toggleRequestsModalOpen, (state) => {
        state.requestsModalOpen = !state.requestsModalOpen;
      })
      /**
       * Toggles the visibility state of the approvals modal.
       *
       * This modal is used for reviewing and approving schedule changes,
       * providing supervisors and managers with a dedicated interface
       * to approve or reject proposed schedule modifications.
       */
      .addCase(toggleApprovalsModalOpen, (state) => {
        state.approvalsModalOpen = !state.approvalsModalOpen;
      })
      /**
       * Toggles the visibility state of the settings modal.
       *
       * This modal provides access to calendar configuration options,
       * user preferences, and system settings that affect how the
       * calendar interface behaves and displays information.
       */
      .addCase(toggleSettingsModalOpen, (state) => {
        state.settingsModalOpen = !state.settingsModalOpen;
      })
      /**
       * Toggles the visibility state of the filters modal.
       *
       * This modal allows users to configure filters for the calendar view,
       * including date ranges, resource types, status filters, and other
       * criteria to customize what events and information are displayed.
       */
      .addCase(toggleFiltersModalOpen, (state) => {
        state.filtersModalOpen = !state.filtersModalOpen;
      })
      /**
       * Toggles the visibility state of the mails modal.
       *
       * This modal manages email notifications and communications related
       * to calendar events, allowing users to configure notification
       * preferences and view email-related activities.
       */
      .addCase(toggleMailsModalOpen, (state) => {
        state.mailsModalOpen = !state.mailsModalOpen;
      })
      /**
       * Toggles the visibility state of the distance modal.
       *
       * This modal provides functionality for calculating and displaying
       * travel distances between different locations in the calendar,
       * helping with scheduling and logistics planning.
       */
      .addCase(toggleDistanceModalOpen, (state) => {
        state.distanceModalOpen = !state.distanceModalOpen;
      })
      /**
       * Toggles the visibility state of the constraints modal.
       *
       * This modal provides functionality for configuring and managing
       * scheduling constraints such as resource availability, time restrictions,
       * conflict rules, and business logic that affects event scheduling.
       */
      .addCase(toggleConstraintsModalOpen, (state) => {
        state.constraintsModalOpen = !state.constraintsModalOpen;
      })
      /**
       * Toggles the visibility state of the PDF modal.
       *
       * This modal provides functionality for displaying PDF documents,
       * generating calendar reports, and managing PDF-based content
       * related to schedule exports and documentation.
       */
      .addCase(togglePdfModalOpen, (state) => {
        state.pdfModalOpen = !state.pdfModalOpen;
      })
      /**
       * Toggles the visibility state of the export calendar modal.
       *
       * This modal provides functionality for configuring and executing
       * calendar data export operations in various formats such as CSV,
       * Excel, PDF, or other supported formats.
       */
      .addCase(toggleExportCalendarModalOpen, (state) => {
        state.exportCalendarModalOpen = !state.exportCalendarModalOpen;
      })
      /**
       * Toggles the visibility state of the right sidebar.
       *
       * This sidebar typically contains supplementary information, quick actions,
       * event details, or navigation options that complement the main calendar view.
       */
      .addCase(toggleRightSidebarOpen, (state) => {
        state.rightSidebarOpen = !state.rightSidebarOpen;
      })
      /**
       * Toggles the visibility state of the event form drawer.
       *
       * This drawer provides a dedicated interface for creating new events,
       * editing existing events, and managing event properties and settings.
       */
      .addCase(toggleEventFormDrawerOpen, (state) => {
        state.eventFormDrawerOpen = !state.eventFormDrawerOpen;
      })
      /**
       * Hides the requests modal by setting its visibility state to false.
       *
       * Unlike the toggle action, this always closes the modal regardless
       * of its current state, providing a clean way to ensure the modal
       * is closed after operations are completed.
       */
      .addCase(hideRequestsModal, (state) => {
        state.requestsModalOpen = false;
      })
      /**
       * Hides the approvals modal by setting its visibility state to false.
       *
       * This action ensures the modal is closed after approval operations
       * are completed, regardless of its current state.
       */
      .addCase(hideApprovalsModal, (state) => {
        state.approvalsModalOpen = false;
      })
      /**
       * Hides the settings modal by setting its visibility state to false.
       *
       * This action ensures the modal is closed after settings are saved
       * or cancelled, providing a clean way to close the modal from form
       * submission handlers.
       */
      .addCase(hideSettingsModal, (state) => {
        state.settingsModalOpen = false;
      })
      /**
       * Hides the filters modal by setting its visibility state to false.
       *
       * This action ensures the modal is closed after filters are applied
       * or cleared, providing a clean way to close the modal after filter
       * operations are completed.
       */
      .addCase(hideFiltersModal, (state) => {
        state.filtersModalOpen = false;
      })
      /**
       * Hides the mails modal by setting its visibility state to false.
       *
       * This action ensures the modal is closed after email operations
       * are completed, providing a clean way to close the modal from
       * email workflow handlers.
       */
      .addCase(hideMailsModal, (state) => {
        state.mailsModalOpen = false;
      })
      /**
       * Hides the distance modal by setting its visibility state to false.
       *
       * This action ensures the modal is closed after distance calculations
       * are completed, providing a clean way to close the modal from
       * calculation workflows.
       */
      .addCase(hideDistanceModal, (state) => {
        state.distanceModalOpen = false;
      })
      /**
       * Hides the constraints modal by setting its visibility state to false.
       *
       * This action ensures the modal is closed after constraint configurations
       * are saved, providing a clean way to close the modal from constraint
       * management workflows.
       */
      .addCase(hideConstraintsModal, (state) => {
        state.constraintsModalOpen = false;
      })
      /**
       * Hides the PDF modal by setting its visibility state to false.
       *
       * This action ensures the modal is closed after PDF viewing or generation
       * is completed, providing a clean way to close the modal from PDF
       * workflow handlers.
       */
      .addCase(hidePdfModal, (state) => {
        state.pdfModalOpen = false;
      })
      /**
       * Hides the export calendar modal by setting its visibility state to false.
       *
       * This action ensures the modal is closed after export operations are
       * completed, providing a clean way to close the modal from export
       * workflow handlers.
       */
      .addCase(hideExportCalendarModal, (state) => {
        state.exportCalendarModalOpen = false;
      })
      /**
       * Hides the right sidebar by setting its visibility state to false.
       *
       * This action ensures the sidebar is closed when maximizing calendar view
       * or when certain operations require the full screen space.
       */
      .addCase(hideRightSidebar, (state) => {
        state.rightSidebarOpen = false;
      })
      /**
       * Hides the event form drawer by setting its visibility state to false.
       *
       * This action ensures the drawer is closed after event operations are
       * completed, providing a clean way to close the drawer from event
       * management workflows.
       */
      .addCase(hideEventFormDrawer, (state) => {
        state.eventFormDrawerOpen = false;
      })
      /**
       * Shows the right sidebar by setting its visibility state to true.
       *
       * This action ensures the sidebar is shown when additional information
       * is needed, providing a clean way to open the sidebar from various
       * workflows without checking current state.
       */
      .addCase(showRightSidebar, (state) => {
        state.rightSidebarOpen = true;
      })
      /**
       * Shows the event form drawer by setting its visibility state to true.
       *
       * This action ensures the drawer is shown when event operations need
       * to be performed, providing a clean way to open the drawer from event
       * management workflows without checking current state.
       */
      .addCase(showEventFormDrawer, (state) => {
        state.eventFormDrawerOpen = true;
      })
      /**
       * Hides all calendar modals by setting all visibility states to false.
       *
       * This action closes all open modals simultaneously, which is useful
       * for cleanup operations, route changes, or when implementing global
       * keyboard shortcuts like the ESC key.
       */
      .addCase(hideAllModals, (state) => {
        state.requestsModalOpen = false;
        state.approvalsModalOpen = false;
        state.settingsModalOpen = false;
        state.filtersModalOpen = false;
        state.mailsModalOpen = false;
        state.distanceModalOpen = false;
        state.constraintsModalOpen = false;
        state.pdfModalOpen = false;
        state.exportCalendarModalOpen = false;
        state.rightSidebarOpen = false;
        state.eventFormDrawerOpen = false;
      });
  },
});

export default calendarOverlayingPanelsSlice.reducer;

// Export selectors
export * from './selectors';
