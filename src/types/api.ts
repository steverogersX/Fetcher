export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
