import { PaginatedResponse } from './common-responses';

export interface SubgroupDto {
  id: string;
  name: string;
  iconName?: string;
  allbranches: boolean;
  noTag: boolean;
  importHash?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  groupId?: string;
  branchId?: string;
  createdById: string;
  updatedById?: string;

  group?: {
    name: string;
  };

}

export interface SubgroupsListResponse extends PaginatedResponse<SubgroupDto> {

}

export interface SubgroupGroupingsResponse extends PaginatedResponse<SubgroupGroupingItem> {

}

export interface SubgroupGroupingItem extends SubgroupDto {
  user: Array<{
    firstName: string;
    lastName: string;
  }>;

  branch?: {
    id: string;
    name: string;
  };
}

export interface BranchDto {
  id: string;
  name: string;
  replyToEmail?: string;
  timezone?: string;
  schedulerLocked: boolean;
  inactive: boolean;
  importHash?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  branchTypeId?: string;
  parentId?: string;
  createdById: string;
  updatedById?: string;
}

export interface SubgroupView extends SubgroupDto {
  group?: {
    id: string;
    name: string;
    min?: number;
    max?: number;
    active: boolean;
    noTag: boolean;
    required: boolean;
    importHash?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdById: string;
    updatedById?: string;
    roles1: Array<{
      name: string;
    }>;
  };

  user: Array<{
    id: string;
    capacity?: number;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    email: string;
    role?: string;
    disabled: boolean;
    password?: string;
    emailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationTokenExpiresAt?: string;
    passwordResetToken?: string;
    passwordResetTokenExpiresAt?: string;
    provider?: string;
    gender?: 'M' | 'F';
    alias?: string;
    customAddressId?: string;
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
    address2Default?: string;
    billable?: boolean;
    allBranches?: boolean;
    paid?: boolean;
    idCustom?: string;
    idCustom2?: string;
    importHash?: string;
    avatar?: string;
    companyId?: string;
    needseat: boolean;
    clientReq: boolean;
    locReq: boolean;
    empNotReq: boolean;
    overlap: boolean;
    disabledAt?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdById?: string;
    updatedById?: string;
    branchId?: string;
  }>;

  branch?: BranchDto;

  branches: BranchDto[];

  subgroup: SubgroupDto[];

  subgroup3: SubgroupDto[];
}

export interface SubgroupAutocompleteItem {
  id: string;
  label: string;
  group?: {
    id: string;
    name: string;
  };

  branch?: {
    id: string;
    name: string;
  };
}

export type SubgroupAutocompleteResponse = SubgroupAutocompleteItem[];

export interface CreateSubgroupRequest {
  data: {
    name: string;
    groupingName: string;
    iconName?: string;
    allbranches?: boolean;
    noTag?: boolean;
    branch?: string;
    relatedUser?: string;
  };
}

export interface UpdateSubgroupRequest extends CreateSubgroupRequest {}
