export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
}

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  meta: PaginationMeta;
}
