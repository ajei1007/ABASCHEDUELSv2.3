import { PaginatedResponse } from './common-responses';

export interface UserDto {
  /** @format uuid */
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  email1?: string;
  email2?: string;
  titleCustom?: string;
  codeCustom?: string;
  role?: string;
  disabled: boolean;
  /** @format date-time */
  disabledAt?: string;
  needroom: boolean;
  needseat: boolean;
  clientReq: boolean;
  locReq: boolean;
  empNotReq: boolean;
  overlap: boolean;
  emailVerified: boolean;
  gender?: 'M' | 'F';
  alias?: string;
  /** @format uuid */
  customAddressId?: string;
  /** @format uuid */
  customPayorClientId?: string;
  otherPhones?: string;
  otherEmails?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  active: boolean;
  minHours?: number;
  maxHours?: number;
  color?: string;
  borderColor?: string;
  birthday?: string;
  address2?: string;
  address2Default: boolean;
  billable: boolean;
  notWorking: boolean;
  auth: boolean;
  allBranches: boolean;
  paid: boolean;
  idCustom?: string;
  idCustom2?: string;
  calendarhide: boolean;
  waitlisted: boolean;
  priority?: number;
  employeeratio?: number;
  clientratio?: number;
  hourlyrate?: number;
  salary?: number;
  hourlyrevenue?: number;
  supervision: boolean;
  productivityInclude: boolean;
  productivityExclude: boolean;
  supervisionRateInclude: boolean;
  immutable: boolean;
  notes?: string;
  defaultDuration?: number;
  capacity?: number;
  importHash?: string;

  // Relations
  company?: {
    /** @format uuid */
    id: string;
  };

  /**
   * @items.type string
   * @items.format uuid
   */
  rooms?: Array<{
    /** @format uuid */
    id: string;
    firstName: string;
    capacity: number;
  }>;
  /** @format uuid */
  siblingGroupId?: string;
  subgroups?: Array<{
    /** @format uuid */
    id: string;
    name: string;
    groupId: string;
    iconName: string;
  }>;
  roles?: Array<{
    /** @format uuid */
    id: string;
    name: string;
  }>;
  branches?: Array<{
    /** @format uuid */
    id: string;
    name: string;
  }>;
}

export interface ResourceDto {
  /** @format uuid */
  id: string;
  name: string;
  type: string;
}

export interface CompanyDto {
  /** @format uuid */
  id: string;
  name: string;
  membership: string;
  disabled: boolean;
  stripeId: string;
  importHash: string;
  onboarded: boolean;
  /** @format date-time */
  createdAt: string;
  /** @format uuid */
  deletedAt?: string;
  /** @format date-time */
  updatedAt: string;
  /** @format uuid */
  industryId: string;
  /** @format uuid */
  createdById: string;
  /** @format uuid */
  updatedById?: string;
}

export interface LocationTypeDto {
  /** @format uuid */
  id: string;
  name: string;
  description?: string;
}

export interface AddressRelationshipDto {
  /** @format uuid */
  id: string;
  type: string;
  address: string;
}

export interface FunderDto {
  /** @format uuid */
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface RoleDto {
  /** @format uuid */
  id: string;
  name: string;
  description?: string;
}

export interface LocationDto {
  /** @format uuid */
  id: string;
  name: string;
  address?: string;
}

export interface MobileTokenDto {
  /** @format uuid */
  id: string;
  token: string;
  device?: string;
}

export interface AvailabilityDto {
  /** @format uuid */
  id: string;
  /** @format date-time */
  startTime: string;
  /** @format date-time */
  endTime: string;
  days: string[];
  available: boolean;
}

export interface TimeConstraintDto {
  /** @format uuid */
  id: string;
  min: number;
  max: number;
  unit: string;
  frequency: string;
}

export interface ConstraintDto {
  /** @format uuid */
  id: string;
  type: string;
  description: string;
  min?: number;
  max?: number;
}

export interface UsersListResponse extends PaginatedResponse<UserDto> {}

export interface UserCoordinateResponse {
  name?: string;
  latitude?: number;
  longitude?: number;
  clientratio?: number;
  employeeratio?: number;
}

export interface UserAutocompleteResponse {
  /** @format uuid */
  id: string;
  label: string;
  firstName: string;
  email: string;
  address?: string;
  roles?: Array<{
    name: string;
  }>;
}

export interface UserView extends Omit<UserDto, 'siblingGroupId'> {
  /** @format uuid */
  createdById: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format uuid */
  deletedAt?: string;
  /** @format uuid */
  updatedById?: string;
  /** @format uuid */
  companyId: string;
  /** @format uuid */
  parentId?: string;
  /** @format uuid */
  resourceId?: string;
  /** @format uuid */
  locationTypeId?: string;
  /** @format uuid */
  address1RelationshipId?: string;
  /** @format uuid */
  address2RelationshipId?: string;
  siblingGroupId?: {
    /** @format uuid */
    id: string;
    label: string;
  };
  company?: CompanyDto;
  parent?: {
    /** @format uuid */
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  resource?: ResourceDto;
  locationType?: LocationTypeDto;
  address1Relationship?: AddressRelationshipDto;
  address2Relationship?: AddressRelationshipDto;
  /**
   * @items.type string
   * @items.format uuid
   */
  roomparent?: string[];
  mobiletokens?: MobileTokenDto[];
  credentialFunders?: Array<{
    /** @format uuid */
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  availabilities?: AvailabilityDto[];
  timeconstraints?: TimeConstraintDto[];
  constraints?: ConstraintDto[];
  role_mobile?: string;
  matchingGroup?: {
    users: Array<{
      /** @format uuid */
      id: string;
      firstName: string;
      lastName: string;
    }>;
    soft?: boolean;
  };
}

export interface CreateUserRequest {
  data: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    email: string;
    email1?: string;
    email2?: string;
    titleCustom?: string;
    codeCustom?: string;
    role?: string;
    disabled?: boolean;
    needroom?: boolean;
    needseat?: boolean;
    clientReq?: boolean;
    locReq?: boolean;
    empNotReq?: boolean;
    overlap?: boolean;
    emailVerified?: boolean;
    gender?: 'M' | 'F';
    alias?: string;
    /** @format uuid */
    customAddressId?: string;
    /** @format uuid */
    customPayorClientId?: string;
    otherPhones?: string;
    otherEmails?: string;
    address?: string;
    longitude?: number;
    latitude?: number;
    active?: boolean;
    minHours?: number;
    maxHours?: number;
    color?: string;
    borderColor?: string;
    /** @format date-time */
    birthday?: string;
    address2?: string;
    address2Default?: boolean;
    billable?: boolean;
    notWorking?: boolean;
    auth?: boolean;
    allBranches?: boolean;
    paid?: boolean;
    idCustom?: string;
    idCustom2?: string;
    calendarhide?: boolean;
    waitlisted?: boolean;
    priority?: number;
    employeeratio?: number;
    clientratio?: number;
    hourlyrate?: number;
    salary?: number;
    hourlyrevenue?: number;
    supervision?: boolean;
    productivityInclude?: boolean;
    productivityExclude?: boolean;
    supervisionRateInclude?: boolean;
    notes?: string;
    defaultDuration?: number;
    capacity?: number;
    password?: string;
    /** @format uuid */
    parent?: string;
    /** @format uuid */
    resource?: string;
    /** @format uuid */
    company?: string;
    /** @format uuid */
    locationType?: string;
    /** @format uuid */
    address1Relationship?: string;
    /** @format uuid */
    address2Relationship?: string;

    /**
     * @items.type string
     * @items.format uuid
     */
    roomparent?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    rooms?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    funders?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    subgroups?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    roles?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    branches?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    tags?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */

    relationshipUsers?: string[];
    /**
     * @items.type string
     * @items.format uuid
     */

    relationships?: string[];
    /**
     * @items.type string
     * @items.format uuid
     */

    primarylocation?: string[];
    /**
     * @items.type string
     * @items.format uuid
     */
    userdefaultlocation?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    userdefaultactivity?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    mobiletokens?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    credential?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    roster?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    credentialFunders?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    totals?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    availabilities?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    constraints?: string[];

    /**
     * @items.type string
     * @items.format uuid
     */
    matchingUsers?: string[];

    matchingSoft?: boolean;
    deleteEvents?: boolean;
    /** @format date-time */
    deleteEventsFromDate?: string;
    resourceName?:
      | 'Activity'
      | 'Block'
      | 'Funder'
      | 'Employee'
      | 'Client'
      | 'Location';
  };
}

export interface UpdateUserRequest {
  /** @format uuid */
  id: string;
  data: CreateUserRequest['data'];
}

export interface UpdateUserDynamicRequest {
  /** @format uuid */
  id: string;
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    longitude?: number;
    latitude?: number;
    idCustom2?: string;
    disabled?: boolean;
  };
}

export interface ConstraintGapFlagRequest {
  userIds?: string;
  hard?: string;
  highPriority?: string;
  onlyOverbooking?: boolean;
  sandboxMode?: boolean;
  timezone?: string;
  /** @format date-time */
  start?: string;
  /** @format date-time */
  end?: string;
  /** @format date-time */
  date?: string;
}

export interface ConstraintFlagDetail {
  /** @format uuid */
  id: string;
  constraintType:
    | 'time'
    | 'matching'
    | 'unmatching'
    | 'usertouser'
    | 'usertosession'
    | 'gaps'
    | 'backToBack'
    | 'grouping'
    | 'breakQuantity'
    | 'drive'
    | 'distance'
    | 'authorization'
    | 'supervisionrate'
    | 'sessionlength';
  description: string;
  frequency?: 'day' | 'week' | 'month' | 'custom';
  min?: number;
  max?: number;
  minSeconds?: number;
  maxSeconds?: number;
  unit?:
    | 'unit'
    | 'minutes'
    | 'hours'
    | 'days'
    | 'weeks'
    | 'months'
    | 'miles'
    | 'kilometers';
  consequenceTypeEachOrAll?: 'each' | 'all';
  each?: {
    consequenceUsers: UserConstraintRelation[];
  };
  all?: {
    actual?: number;
    users?: UserConstraintRelation[];
  };
  brokenSessions?: BrokenSession[];
  broken: boolean;
}

export interface UserConstraintRelation {
  /** @format uuid */
  userId: string;
  firstName: string;
  lastName: string;
  actual: number;
}

export interface BrokenSession {
  /** @format uuid */
  eventId: string;
  actual: number;
  users?: Array<{
    /** @format uuid */
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export interface TimeSlot {
  /** @format time */
  startTime: string;
  /** @format time */
  endTime: string;
}

export interface EventDto {
  /** @format uuid */
  id: string;
  title: string;
  /** @format date-time */
  startTime: string;
  /** @format date-time */
  endTime: string;
  users: Array<{
    /** @format uuid */
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export interface ConstraintGapFlags {
  /** @format uuid */
  userId: string;
  firstName: string;
  lastName: string;
  /** @format date-time */
  date: string;
  constraints: ConstraintFlagDetail[];
  emptyAvailabilities: TimeSlot[];
  notAvailableBusy: Array<
    TimeSlot & {
      events: EventDto[];
    }
  >;
  overbookings: Array<{
    conflict: TimeSlot;
    events: EventDto[];
  }>;
  siblingBranchPeopleEvents: Array<{
    activity: string;
    conflictedPeople: string[];
    description: string;
  }>;
}

export interface UserSheetDataResponse {
  locationsData: LocationDto[];
  activitiesData: Array<{
    /** @format uuid */
    id: string;
    label: string;
  }>;
  users: Array<{
    /** @format uuid */
    id: string;
    label: string;
    email: string;
  }>;
  branches?: BranchDto[];
  blocksData?: Array<{
    /** @format uuid */
    id: string;
    label: string;
  }>;
  roles?: RoleDto[];
  fundersData?: FunderDto[];
  subgroups?: Array<{
    /** @format uuid */
    id: string;
    label: string;
    group: string;
  }>;
}

export interface BranchDto {
  /** @format uuid */
  id: string;
  name: string;
  address?: string;
}

export interface UserConstraintResponse {
  /** @format uuid */
  id: string;
  description: string;
  /** @format date-time */
  start: string;
  /** @format date-time */
  end: string;
}

export interface TimeConstraintUserRelations {
  consequenceTypeEachOrAll: string;
  timeconstraintFrequency: string;
  min: number;
  max: number;
  userPairsRelations: UserPairRelation[];
  totalRelation: TotalRelation[];
  sessionRelations: Array<{
    /** @format uuid */
    eventId: string;
    actual: number;
    users: Array<{
      /** @format uuid */
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    }>;
  }>;
}

export interface UserPairRelation {
  /** @format uuid */
  userId: string;
  firstName: string;
  lastName: string;
  actual: number;
}

export interface TotalRelation {
  actual: number;
  dates?: Array<{
    /** @format date-time */
    date: string;
    duration: number;
  }>;
}

export interface UserToUserFrequencyConstraintUserRelations {
  consequenceTypeEachOrAll: string;
  timeconstraintFrequency: string;
  min: number;
  max: number;
  usersWorkedWith: UserWorkedWith[];
  actualWorkedUserNumber: number;
  sessionRelations: Array<{
    /** @format uuid */
    eventId: string;
    userNumber: number;
    users: Array<{
      /** @format uuid */
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    }>;
  }>;
}

export interface UserWorkedWith {
  /** @format uuid */
  userId: string;
  firstName: string;
  lastName: string;
  count: number;
}

export interface UserToSessionFrequencyConstraintUserRelations {
  consequenceTypeEachOrAll: string;
  userToUserConstraintFrequency: number;
  min: number;
  max: number;
  userPairsRelations: Array<{
    /** @format uuid */
    userId: string;
    firstName: string;
    lastName: string;
    actual: number;
  }>;
  totalRelation: Array<{
    actual: number;
  }>;
}

export interface MatchingConstraintUserRelations {
  /** @format uuid */
  id: string;
  constraintType: string;
  description: string;
  brokenEvents: Array<{
    /** @format uuid */
    eventId: string;
  }>;
}

export interface UnmatchingConstraintUserRelations {
  /** @format uuid */
  id: string;
  constraintType: string;
  description: string;
  brokenEvents: Array<{
    /** @format uuid */
    eventId: string;
    breakingUsers: Array<{
      /** @format uuid */
      id: string;
      firstName: string;
      lastName: string;
    }>;
  }>;
}

export interface UserSiblingGroupsResponse {
  /** @format uuid */
  id: string;
  label: string;
}

export interface FormSheetRequest {
  data: {
    resources: CreateUserRequest['data'][];
    availabilities?: Array<{
      /** @format uuid */
      user: string;
      /** @format date-time */
      startTime: string;
      /** @format date-time */
      endTime: string;
      /**
       * @items.type string
       * @items.format uuid
       */
      days: string[];
      available: boolean;
    }>;
    priorities?: Array<{
      /** @format uuid */
      user1: string;
      /** @format uuid */
      user2: string;
      rank: number;
    }>;
    timeconstraints?: Array<{
      /** @format uuid */
      user1: string;
      /** @format uuid */
      user2: string;
      min: number;
      max: number;
      unit: string;
      frequency: string;
    }>;
  };
}
