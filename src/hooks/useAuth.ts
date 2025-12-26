import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const useLogin = () => {
  const { setAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      const { user, token, refreshToken } = response.data.data;
      
      // Update auth context
      setAuth(user, token);
      
      // Store refresh token if provided
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Clear any cached data
      queryClient.clear();
      
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/app/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (response) => {
      const { user, token, refreshToken } = response.data.data;
      
      // Update auth context
      setAuth(user, token);
      
      // Store refresh token if provided
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Clear any cached data
      queryClient.clear();
      
      toast.success(`Welcome to Bella, ${user.name}!`);
      navigate('/app/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear auth context
      logout();
      
      // Clear all cached data
      queryClient.clear();
      
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: () => {
      // Even if API call fails, clear local auth state
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
};