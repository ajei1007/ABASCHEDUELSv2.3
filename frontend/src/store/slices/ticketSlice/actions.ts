// src/slices/ticketSlice/actions.ts
import { createAction } from '@reduxjs/toolkit';

export const clearTicketState = createAction('ticket/clearTicketState');

export const saveTicketDraft = createAction<any>('ticket/saveTicketDraft');
export const startLoomRecording = createAction<void>(
  'ticket/startLoomRecording',
);
export const finishLoomRecording = createAction<any>(
  'ticket/finishLoomRecording',
);
export const clearTicketDraft = createAction('ticket/clearTicketDraft');
