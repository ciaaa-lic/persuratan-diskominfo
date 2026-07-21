import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface DashboardStats {
  workingDayIndex: number;
  numberRange: string;
  stokSummary: {
    tanggal: string;
    workingDayIndex: number;
    numberRange: string;
    totalTerpakai: number;
    groups: {
      suffix: string;
      total: number;
      used: number;
    }[];
  };
  hariIni: {
    pengajuan: number;
    menunggu: number;
    selesai: number;
    dibatalkan: number;
  };
  bulanIni: {
    masuk: number;
    keluar: number;
    terpakai: number;
    dibatalkan: number;
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
