// src/slices/ticketSlice/index.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { submitTicket } from './thunks';
import {
  clearTicketState,
  saveTicketDraft,
  startLoomRecording,
  finishLoomRecording,
  clearTicketDraft,
} from './actions';
import {
  supportTicketUrgencyOptions,
  supportTicketTypeOptions,
} from 'components/Header/helpers/SupportTicketFormFields';

interface TicketState {
  loading: boolean;
  ticket: any | null;
  jiraIssue: any | null;
  error: string | null;

  draft: any;
  isRecording: boolean;
}

const emptyDraft = {
  firstName: '',
  lastName: '',
  urgency: supportTicketUrgencyOptions[0],
  type: supportTicketTypeOptions[0],
  subject: '',
  description: '',
  attachments: [],
  loomVideoUrl: '',
};

const initialState: TicketState = {
  loading: false,
  ticket: null,
  jiraIssue: null,
  error: null,

  draft: emptyDraft,
  isRecording: false,
};

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitTicket.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(submitTicket.fulfilled, (s, a) => {
        s.loading = false;
        s.ticket = a.payload.ticket;
        s.jiraIssue = a.payload.jiraIssue;
      })
      .addCase(submitTicket.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      .addCase(clearTicketState, () => initialState)

      .addCase(saveTicketDraft, (s, a: PayloadAction<any>) => {
        s.draft = a.payload;
      })
      .addCase(startLoomRecording, (s) => {
        s.isRecording = true;
      })
      .addCase(finishLoomRecording, (s, a: PayloadAction<string>) => {
        s.draft.loomVideoUrl = a.payload;
        s.isRecording = false;
      })
      .addCase(clearTicketDraft, (s) => {
        s.draft = emptyDraft;
        s.isRecording = false;
      });
  },
});

export default ticketSlice.reducer;
