export interface IQuery {
  page: number;
  size: number;
  search?: string;
  order?: "ascending" | "descending";
  sortBy?: "date";
}

//if change anything in here need change in getUsers in UserController
