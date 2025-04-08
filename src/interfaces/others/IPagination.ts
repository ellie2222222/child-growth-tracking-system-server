// interfaces/IPagination.ts
export interface IPagination {
  page: number;
  total: number;
  totalPages: number;
  data: any[];
}
