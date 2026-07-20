import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface ActivityLogItem {
  id: number;
  userId?: number;
  userName: string;
  role: string;
  action: string;
  description: string;
  createdAt: string;
}

export const useActivityLogs = (limit = 100) => {
  return useQuery({
    queryKey: ['activity-logs', limit],
    queryFn: async () => {
      const response = await api.get<ActivityLogItem[]>('/log', { params: { limit } });
      return response.data;
    },
  });
};
