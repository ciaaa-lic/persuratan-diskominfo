import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface StokItem {
  id: number;
  tanggal: string;
  urutan: number;
  suffix: string;
  nomorFullStok: string;
  status: string;
}

export interface StokSummaryResponse {
  today: string;
  workingDayIndex: number;
  startNum: number;
  endNum: number;
  numberRange: string;
  blockStats: {
    total: number;
    available: number;
    used: number;
  };
  lastSuffix: string;
  details: StokItem[];
}

export const useStokSummary = (dateStr?: string) => {
  return useQuery({
    queryKey: ['stok-summary', dateStr],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (dateStr) params.date = dateStr;
      const response = await api.get<StokSummaryResponse>('/stok/summary', { params });
      return response.data;
    },
    refetchInterval: 15000,
  });
};
