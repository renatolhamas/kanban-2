import { useState, useEffect, useCallback } from 'react';

export type RealtimeStatus = 'connected' | 'reconnecting' | 'offline';

export function useRealtimeStatus() {
  const [status, setStatus] = useState<RealtimeStatus>('offline');
  const [lastConnectedAt, setLastConnectedAt] = useState<string | null>(null);

  // Auto-detect browser network state
  useEffect(() => {
    const handleOnline = () => {
      // It might take a moment for Supabase to actually connect, so we set to reconnecting
      setStatus(prev => prev === 'offline' ? 'reconnecting' : prev);
    };
    
    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined') {
      setStatus(navigator.onLine ? 'reconnecting' : 'offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateStatus = useCallback((newStatus: RealtimeStatus) => {
    setStatus(newStatus);
    if (newStatus === 'connected') {
      setLastConnectedAt(new Date().toISOString());
    }
  }, []);

  return {
    status,
    lastConnectedAt,
    updateStatus
  };
}
