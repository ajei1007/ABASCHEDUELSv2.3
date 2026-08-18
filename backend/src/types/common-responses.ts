export interface PaginatedResponse<T> {
  rows: T[];
  count: number;
}