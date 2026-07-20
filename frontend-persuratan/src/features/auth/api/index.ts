import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { AuthResponse, User } from '../types';
import { useAuthStore } from '@/store/useAuthStore';

// Hooks for Login
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: Record<string, unknown>) => {
      console.log('Payload login:', credentials);
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('Response login:', response.data);
      return response.data;
    },
    onSuccess: (data: any) => {
      const payload = data?.user ? data : data?.data || data;
      const { user, access_token } = payload || {};
      if (user && access_token) {
        setAuth(user, access_token);
        console.log('Token yang tersimpan:', useAuthStore.getState().token);
      }
    },
  });
};

// Hooks for Register
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: Record<string, unknown>) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
  });
};

// Hooks to get user profile
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<{ status: string; message: string; data: User }>('/user/profile');
      const resData = response.data as any;
      return resData?.data || resData;
    },
  });
};

