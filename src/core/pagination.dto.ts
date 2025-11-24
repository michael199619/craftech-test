export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getPaginationParams(
  page?: string | number | any,
  limit?: string | number | any,
): PaginationParams {
  const pageNum = page ? Number(page) : 1;
  const limitNum = limit ? Number(limit) : 20;

  return {
    page: Math.max(1, isNaN(pageNum) ? 1 : pageNum),
    limit: Math.min(100, Math.max(1, isNaN(limitNum) ? 20 : limitNum)),
  };
}
