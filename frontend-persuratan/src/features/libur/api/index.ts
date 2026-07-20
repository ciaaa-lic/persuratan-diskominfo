import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

export interface HariLibur {
  id: number;
  tanggal: string; // ISO string
  keterangan: string;
}

// Get all holidays (optionally filter by year)
export const useGetLibur = (year?: number) => {
  return useQuery({
    queryKey: ['libur', year],
    queryFn: async () => {
      const { data } = await axios.get<HariLibur[]>('/libur', {
        params: { year },
      });
      return data;
    },
  });
};

// Add a holiday
export const useAddLibur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { tanggal: string; keterangan: string }) => {
      const { data } = await axios.post('/libur', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libur'] });
    },
  });
};

// Remove a holiday
export const useDeleteLibur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tanggal: string) => {
      const { data } = await axios.delete(`/libur/${tanggal}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libur'] });
    },
  });
};

export const useSyncLibur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (year: number) => {
      const { data } = await axios.post(`/libur/sync/${year}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libur'] });
    },
  });
};
