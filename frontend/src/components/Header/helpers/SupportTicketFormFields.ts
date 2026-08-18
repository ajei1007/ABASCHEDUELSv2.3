export interface SupportTicketFormValues {
  firstName: string;
  lastName: string;
  urgency: { value: number; label: string };
  type: { value: string; label: string; board: string };
  subject: string;
  description: string;
  attachments: File[];
  loomVideoUrl: string;
}

export const supportTicketUrgencyOptions = [
  { value: 4, label: 'Not urgent' },
  { value: 3, label: 'Very urgent' },
  { value: 2, label: 'Somewhat urgent' },
  { value: 1, label: 'Emergency' },
];

export const supportTicketTypeOptions = [
  { value: 'featureRequested', label: 'Feature Requested', board: 'technical' },
  { value: 'bug', label: 'Bug', board: 'technical' },
  { value: 'admin', label: 'Admin', board: 'admin' },
  // { value: 'technical', label: 'Technical', board: 'tech' },
];
