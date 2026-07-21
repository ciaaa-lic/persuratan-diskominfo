import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export interface NomorTerpakai {
  id: number;
  kodeKlasifikasi: string;
  nomorSurat: string;
  assignedAt: string;
}

export interface PengajuanSurat {
  id: number;
  tanggalPengajuan: string;
  bidang: string;
  perihal: string;
  pengirim: string;
  keterangan?: string;
  klasifikasi?: string;
  kodeKlasifikasi?: string;
  lampiran?: string;
  status: string;
  nomorSurat?: string | null;
  tanggalSurat?: string | null;
  nomorTerpakai?: NomorTerpakai | null;
  statusHistory?: {
    id: number;
    status: string;
    keterangan?: string;
    createdAt: string;
  }[];
}

export interface CreateSuratItemDto {
  bidang: string;
  perihal: string;
  pengirim: string;
  tanggalSurat: string;
  klasifikasi?: string;
  kodeKlasifikasi?: string;
  lampiran?: string;
}

export const useSuratList = (filters?: { bidang?: string; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['surat-list', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.bidang) params.bidang = filters.bidang;
      if (filters?.status) params.status = filters.status;
      if (filters?.search) params.search = filters.search;
      const response = await api.get<PengajuanSurat[]>('/surat', { params });
      return response.data;
    },
    refetchInterval: 5000,
  });
};

export const useCreateSurat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSuratItemDto) => {
      const response = await api.post<PengajuanSurat>('/surat', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useCreateSuratBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batchList: CreateSuratItemDto[]) => {
      const response = await api.post<PengajuanSurat[]>('/surat/batch', { batchList });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useGenerateNomor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, kodeKlasifikasi }: { id: number; kodeKlasifikasi: string }) => {
      const response = await api.post<PengajuanSurat>(`/surat/${id}/generate-nomor`, {
        kodeKlasifikasi,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ url: string | null; filename: string | null }>(
        '/surat/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    },
  });
};

export const useDeleteSurat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/surat/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'pengajuan' | 'nomor';
  read: boolean;
  link: string;
}

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get<NotificationItem[]>('/surat/notifications');
      const resData = response.data as any;
      return (resData?.data || resData || []) as NotificationItem[];
    },
    refetchInterval: 5000,
  });
};

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch('/surat/notifications/read');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
