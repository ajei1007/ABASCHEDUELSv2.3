// src/slices/ticketSlice/thunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the payload type for ticket submission.
export interface TicketPayload {
  supportType: string;
  issueType: string;
  subject: string;
  description: string;
  firstName: string;
  company?: string;
  email?: string;
  companyId?: string;
  attachments?: any;
}
export interface TicketResponse {
  ticket: any;
  jiraIssue: any;
}

export const submitTicket = createAsyncThunk<TicketResponse, FormData>(
  'ticket/submitTicket',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response ? error.response.data : error.message,
      );
    }
  },
);
