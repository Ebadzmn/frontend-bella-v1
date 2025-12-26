import { useEffect } from 'react';
import { NotificationService } from '../services/notificationService';

export const useNotifications = (isAuthenticated: boolean, type: 'user' | 'partner') => {
  useEffect(() => {
    if (isAuthenticated) {
      // Request permission and register token
      NotificationService.requestPermissionAndRegister(type);
      
      // Start listening for foreground messages
      NotificationService.listenForMessages();
    }
  }, [isAuthenticated, type]);
};
