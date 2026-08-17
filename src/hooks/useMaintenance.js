// src/hooks/useMaintenance.js

import { useState, useEffect } from 'react';
import { settingsService } from '../services/settings';
import { useAuth } from '../contexts/AuthContext';

export function useMaintenance() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await settingsService.get();
        setMaintenanceMode(res.data?.maintenanceMode || false);
        setMaintenanceMessage(res.data?.maintenanceMessage || '');
      } catch (error) {
        console.error('Failed to check maintenance status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
  }, []);

  // Admin users bypass maintenance mode
  const isBlocked = maintenanceMode && !(isAuthenticated && user?.role === 'admin');

  return {
    maintenanceMode,
    maintenanceMessage,
    isBlocked,
    loading,
  };
}