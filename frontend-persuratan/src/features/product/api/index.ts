import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { PaginatedResponse, Product } from '../types';

interface GetProductsParams {
  page?: number;
  limit?: number;
}

// Hook to get products with pagination
export const useGetProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Product>>('/product', {
        params,
      });
      return response.data;
    },
  });
};
