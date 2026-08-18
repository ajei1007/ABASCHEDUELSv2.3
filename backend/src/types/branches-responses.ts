import { PaginatedResponse } from './common-responses';

export interface BranchTypeDto {
  /**
   * @format uuid
   */
  id: string;
  name: string;
  bol: boolean;
  physical: boolean;
  importHash?: string;
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
  /**
   * @format date-time
   */
  deletedAt?: string;
  /**
   * @format uuid
   */
  parentId?: string;
  /**
   * @format uuid
   */
  createdById: string;
  /**
   * @format uuid
   */
  updatedById?: string;
}

export interface BranchDto {
  /**
   * @format uuid
   */
  id: string;
  name: string;
  timezone?: string;
  replyToEmail?: string;
  schedulerLocked: boolean;
  drivetime?: number;
  inactive: boolean;
  importHash?: string;
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
  /**
   * @format date-time
   */
  deletedAt?: string;

  /**
   * @format uuid
   */
  branchTypeId?: string;
  /**
   * @format uuid
   */
  parentId?: string;
  /**
   * @format uuid
   */
  userId?: string;
  /**
   * @format uuid
   */
  createdById: string;
  /**
   * @format uuid
   */
  updatedById?: string;

  branchType?: BranchTypeDto;

  parent?: {
    /**
     * @format uuid
     */
    id: string;
    name: string;
    timezone?: string;
    replyToEmail?: string;
    schedulerLocked: boolean;
    drivetime?: number;
    inactive: boolean;
    importHash?: string;
    /**
     * @format date-time
     */
    createdAt: string;
    /**
     * @format date-time
     */
    updatedAt: string;
    /**
     * @format date-time
     */
    deletedAt?: string;
    /**
     * @format uuid
     */
    branchTypeId?: string;
    /**
     * @format uuid
     */
    parentId?: string;
    /**
     * @format uuid
     */
    userId?: string;
    /**
     * @format uuid
     */
    createdById: string;
    /**
     * @format uuid
     */
    updatedById?: string;
  };

  user?: {
    /**
     * @format uuid
     */
    id: string;
    firstName: string;
  };

  createdBy?: {
    /**
     * @format uuid
     */
    id: string;
    firstName: string;
  };

  /**
   * @items {"type": "string", "format": "uuid"}
   */
  subordinateIds?: string[];
}

export interface BranchesListResponse extends PaginatedResponse<BranchDto> {

}

export interface BranchView extends Omit<BranchDto, 'subordinateIds'> {

}

export interface BranchAutocompleteItem {
  /**
   * @format uuid
   */
  id: string;
  label: string;
}

export type BranchAutocompleteResponse = BranchAutocompleteItem[];

export interface BranchOptimizerItem {
  /**
   * @format uuid
   */
  id: string;
  name: string;
  timezone?: string;
  replyToEmail?: string;
  schedulerLocked: boolean;
  drivetime?: number;
  inactive: boolean;
  importHash?: string;
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
  /**
   * @format date-time
   */
  deletedAt?: string;
  /**
   * @format uuid
   */
  branchTypeId?: string;
  /**
   * @format uuid
   */
  parentId?: string;
  /**
   * @format uuid
   */
  userId?: string;
  /**
   * @format uuid
   */
  createdById: string;
  /**
   * @format uuid
   */
  updatedById?: string;
  createdBy?: {
    /**
     * @format uuid
     */
    id: string;
    firstName: string;
  };
}

export interface BranchOptimizerResponse extends PaginatedResponse<BranchOptimizerItem> {

}

export interface SchedulerLockStatusResponse {
  schedulerLocked: boolean;
  lockedParents: string[];
}

export interface SchedulerLockSwitchResponse {
  /**
   * @format uuid
   */
  id: string;
  name: string;
  timezone?: string;
  replyToEmail?: string;
  schedulerLocked: boolean;
  drivetime?: number;
  inactive: boolean;
  importHash?: string;
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
  /**
   * @format date-time
   */
  deletedAt?: string;
  /**
   * @format uuid
   */
  branchTypeId?: string;
  /**
   * @format uuid
   */
  parentId?: string;
  /**
   * @format uuid
   */
  userId?: string;
  /**
   * @format uuid
   */
  createdById: string;
  /**
   * @format uuid
   */
  updatedById?: string;
}

export interface BranchSheetDataResponse {
  branchTypes: BranchAutocompleteItem[];
  parents: BranchAutocompleteItem[];
}

export interface CreateBranchRequest {
  data: {
    name: string;
    timezone?: string;
    replyToEmail?: string;
    drivetime?: number;
    inactive?: boolean;
    /**
     * @format uuid
     */
    branchType?: string;
    /**
     * @format uuid
     */
    parent?: string;
    /**
     * @format uuid
     */
    user?: string;
  };
}

export interface UpdateBranchRequest extends CreateBranchRequest {}

export interface ImportBranchesRequest {
  data: {
    branches: Array<{
      name: string;
      timezone?: string;
      replyToEmail?: string;
      drivetime?: number;
      inactive?: boolean;
      /**
       * @format uuid
       */
      branchType?: string;
      /**
       * @format uuid
       */
      parent?: string;
      /**
       * @format uuid
       */
      user?: string;
    }>;
  };
}