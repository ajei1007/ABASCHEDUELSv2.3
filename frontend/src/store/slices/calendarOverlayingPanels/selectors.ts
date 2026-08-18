import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'store';

// ==============================
// BASE SELECTORS
// ==============================

/**
 * Base selector to get the entire calendar modals state
 */
const selectCalendarOverlayingPanelsState = (state: RootState) =>
  state.calendarOverlayingPanels;

// ==============================
// INDIVIDUAL MODAL SELECTORS
// ==============================

/**
 * Selector to get the visibility state of the requests modal.
 *
 * The requests modal is used for viewing and managing schedule requests,
 * allowing users to see pending requests and take appropriate actions.
 *
 * @returns Boolean indicating if the requests modal is open
 */
export const selectRequestsModalOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.requestsModalOpen,
);

/**
 * Selector to get the visibility state of the approvals modal.
 *
 * The approvals modal is used for reviewing and approving schedule changes,
 * providing supervisors and managers with a dedicated interface to approve
 * or reject proposed schedule modifications.
 *
 * @returns Boolean indicating if the approvals modal is open
 */
export const selectApprovalsModalOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.approvalsModalOpen,
);

/**
 * Selector to get the visibility state of the settings modal.
 *
 * The settings modal provides access to calendar configuration options,
 * user preferences, and system settings that affect how the calendar
 * interface behaves and displays information.
 *
 * @returns Boolean indicating if the settings modal is open
 */
export const selectSettingsModalOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.settingsModalOpen,
);

/**
 * Selector to get the visibility state of the filters modal.
 *
 * The filters modal allows users to configure filters for the calendar view,
 * including date ranges, resource types, status filters, and other criteria
 * to customize what events and information are displayed.
 *
 * @returns Boolean indicating if the filters modal is open
 */
export const selectFiltersModalOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.filtersModalOpen,
);

/**
 * Selector to get the visibility state of the mails modal.
 *
 * The mails modal manages email notifications and communications related
 * to calendar events, allowing users to configure notification preferences
 * and view email-related activities.
 *
 * @returns Boolean indicating if the mails modal is open
 */
export const selectMailsModalOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.mailsModalOpen,
);

/**
 * Selector to get the visibility state of the distance modal.
 *
 * The distance modal provides functionality for calculating and displaying
 * travel distances between different locations in the calendar, helping
 * with scheduling and logistics planning.
 *
 * @returns Boolean indicating if the distance modal is open
 */
export const selectDistanceModalOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.distanceModalOpen,
);

/**
 * Selector to get the visibility state of the constraints modal.
 *
 * The constraints modal provides functionality for configuring and managing
 * scheduling constraints such as resource availability, time restrictions,
 * conflict rules, and business logic that affects event scheduling.
 *
 * @returns Boolean indicating if the constraints modal is open
 */
export const selectConstraintsModalOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.constraintsModalOpen,
);

/**
 * Selector to get the visibility state of the PDF modal.
 *
 * The PDF modal provides functionality for displaying PDF documents,
 * generating calendar reports, and managing PDF-based content related
 * to schedule exports and documentation.
 *
 * @returns Boolean indicating if the PDF modal is open
 */
export const selectPdfModalOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.pdfModalOpen,
);

/**
 * Selector to get the visibility state of the export calendar modal.
 *
 * The export calendar modal provides functionality for configuring and
 * executing calendar data export operations in various formats such as
 * CSV, Excel, PDF, or other supported formats.
 *
 * @returns Boolean indicating if the export calendar modal is open
 */
export const selectExportCalendarModalOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) =>
    calendarOverlayingPanels.exportCalendarModalOpen,
);

/**
 * Selector to get the visibility state of the right sidebar.
 *
 * The right sidebar typically contains supplementary information, quick actions,
 * event details, or navigation options that complement the main calendar view.
 * It provides additional functionality without cluttering the main interface.
 *
 * @returns Boolean indicating if the right sidebar is open
 */
export const selectRightSidebarOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.rightSidebarOpen,
);

/**
 * Selector to get the visibility state of the event form drawer.
 *
 * The event form drawer provides a dedicated interface for creating new events,
 * editing existing events, and managing event properties and settings.
 * It offers a focused workspace for event management operations.
 *
 * @returns Boolean indicating if the event form drawer is open
 */
export const selectEventFormDrawerOpen = createSelector(
  [selectCalendarOverlayingPanelsState],
  (calendarOverlayingPanels) => calendarOverlayingPanels.eventFormDrawerOpen,
);
