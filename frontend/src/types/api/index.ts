export interface IApiCalendarEventItem extends Record<string, any> {
  id: string;
  startRecur: string;
  endRecur: string;
  start: string;
  end: string;
  startActual: string;
  endActual: string;
  startDatetime: string;
  endDatetime: string;
  integratedAt: any;
  address: any;
  eventIdCustom: any;
  longitude: any;
  latitude: any;
  frequency: 'Weekly';
  interval: 1;
  distance: any;
  driveDuration: any;
  background: any;
  border: any;
  notes: any;
  secondary: boolean;
  allDay: boolean;
  converted: boolean;
  visible: boolean;
  M: boolean;
  T: boolean;
  W: boolean;
  R: boolean;
  F: boolean;
  S: boolean;
  U: boolean;
  bysetpos: any;
  sandboxMode: boolean;
  importHash: any;
  isCancelled: boolean;
  supervisionId: any;
  timezone: string;
  eventGroupId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  eventConnectId: string | null;
  activity0Id: string;
  location0Id: string | null;
  createdById: string;
  updatedById: string;
  cancelledByUserId: any;
  cancellationReasonId: any;
  users: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  activity0: {
    id: string;
    firstName: string;
  } | null;
  location0: any;
}

export interface IApiCalendarEventGroupItem {
  eventGroupId: string;
  events: IApiCalendarEventItem[];
  count: number;
}

export type TApiEventUpdateLevel = 'RRULE' | 'SIMPLE';
export type TApiEventUpdateType = 'ONLY' | 'PARTLY' | 'ALL' | 'FUTURE';
export type TApiEventDeleteType = TApiEventUpdateType;

export interface IApiChatAvailableUserItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  mmUserId: string;
  email: string;
  createdAt: string;
}

export interface IApiSurveyDataItem {
  id: string;
  userId: string;
  feedback: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface IApiSurveyQuestionItem {
  id: string;
  question: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IApiNpsStatisticsResponseItem {
  id: string;
  company: {
    id: string;
    name: string;
  };
  userType: 'client' | 'employee';
  roles: {
    id: string;
    name: string;
    standardRoles: string;
  }[];
  firstName: string;
  lastName: string;
  email: string;
  rating: number;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

export interface IApiNpsStatisticsData {
  npsTotalResponses: number;
  npsResponseRate: number;
  npsScore: {
    quarter: string;
    score: number;
  }[];
  npsRatingStatistics: {
    mean: number;
    median: number;
    deviation: number;
  };
  npsRatingDistribution: {
    detractors: {
      count: number;
      percentage: number;
    };
    passives: {
      count: number;
      percentage: number;
    };
    promoters: {
      count: number;
      percentage: number;
    };
  };
  npsDistributionByRole: Record<
    string,
    {
      npsScore: number;
      totalResponses: number;
    }
  >;
  npsResponseTrends: {
    quarter: string;
    totalResponses: number;
  }[];
}

export interface IApiCompanyItem {
  id: string;
  name: string;
  membership: string;
  disabled: boolean;
  stripeId: string | null;
  importHash: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  industryId: string | null;
  createdById: string;
  updatedById: string;
  industry: Record<string, any> | null;
}

export interface IApiOptimizerActionLogItem {
  id: string;
  startTime: string;
  endTime: string;
  status: 'success' | 'failed';
  requestPayload: Record<string, any>;
  responsePayload: Record<string, any> | null;
  triggerBy: string;
  triggerByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface IApiOnboardingChecklistItem {
  id: string;
  title: string;
  content: string;
  order: number;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface IApiOnboardingChecklistPhaseItem {
  id: string;
  title: string;
  description: string;
  order: number;
  items: IApiOnboardingChecklistItem[];
}
