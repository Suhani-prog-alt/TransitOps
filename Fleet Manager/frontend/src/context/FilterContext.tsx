import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from './AuthContext';

interface AlertItem {
  _id: string;
  vehicle: {
    _id: string;
    name: string;
    registrationNumber: string;
  };
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isResolved: boolean;
  createdAt: string;
}

interface FilterContextType {
  region: string;
  setRegion: (region: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  alerts: AlertItem[];
  fetchAlerts: () => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  triggerScan: () => Promise<void>;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [region, setRegion] = useState<string>('All Regions');
  const [dateRange, setDateRange] = useState<string>('12 May 2025 - 18 May 2025'); // Matches image placeholder text
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Sync user's default region from profile
  useEffect(() => {
    if (user && user.region !== 'All Regions') {
      setRegion(user.region);
    }
  }, [user]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const fetchAlerts = async () => {
    try {
      if (!user) return;
      const response = await API.get('/alerts?isResolved=false');
      setAlerts(response.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await API.put(`/alerts/${alertId}/resolve`);
      setAlerts(prev => prev.filter(a => a._id !== alertId));
      triggerRefresh();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const triggerScan = async () => {
    try {
      await API.post('/alerts/scan');
      await fetchAlerts();
      triggerRefresh();
    } catch (err) {
      console.error('Error scanning for alerts:', err);
    }
  };

  // Poll for alerts every 60 seconds if logged in
  useEffect(() => {
    if (user) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 60000);
      return () => clearInterval(interval);
    }
  }, [user, refreshTrigger]);

  return (
    <FilterContext.Provider value={{
      region,
      setRegion,
      dateRange,
      setDateRange,
      globalSearch,
      setGlobalSearch,
      alerts,
      fetchAlerts,
      resolveAlert,
      triggerScan,
      refreshTrigger,
      triggerRefresh
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
