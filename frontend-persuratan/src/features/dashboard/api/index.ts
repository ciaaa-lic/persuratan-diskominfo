import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface DashboardStats {
  workingDayIndex: number;
  numberRange: string;
  stokSummary: {
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
    details: {
      id: number;
      urutan: number;
      suffix: string;
      nomorFullStok: string;
      status: string;
    }[];
  };
  hariIni: {
    pengajuan: number;
    menunggu: number;
    selesai: number;
  };
  bulanIni: {
    masuk: number;
    keluar: number;
    terpakai: number;
  };
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/dashboard/stats');
      return response.data;
    },
    refetchInterval: 5000, // refresh stats every 5 seconds
  });
};
