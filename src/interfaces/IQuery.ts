export interface IQuery {
  page: number;
  size: number;
  search?: string;
  order?: "ascending" | "descending";
  sortBy?: "date" | "name" ;
}

//if change anything in here need change in getUsers in UserController
