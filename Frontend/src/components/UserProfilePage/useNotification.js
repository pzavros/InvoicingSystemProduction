// src/components/UserProfilePage/useNotification.js
import { useState, useCallback } from 'react';

const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
};

export default useNotification;
