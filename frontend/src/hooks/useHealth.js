import { useState, useEffect, useCallback, useRef } from 'react';
import { checkBackendHealth } from '../services/api';

export function useHealth(intervalMs = 8000) {
  const [connectionState, setConnectionState] = useState('CHECKING'); // 'CHECKING', 'ONLINE', 'OFFLINE'
  const [aiEngineAvailable, setAiEngineAvailable] = useState(false);
  const [httpStatus, setHttpStatus] = useState(0);
  const [data, setData] = useState(null);

  const isMounted = useRef(true);

  const performHealthCheck = useCallback(async () => {
    const res = await checkBackendHealth();
    if (isMounted.current) {
      setConnectionState(res.status); // 'ONLINE' or 'OFFLINE'
      setAiEngineAvailable(res.aiEngineAvailable);
      setHttpStatus(res.httpStatus);
      setData(res.data);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    performHealthCheck();

    const intervalId = setInterval(performHealthCheck, intervalMs);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [performHealthCheck, intervalMs]);

  return {
    connectionState,
    isOnline: connectionState === 'ONLINE',
    isOffline: connectionState === 'OFFLINE',
    isChecking: connectionState === 'CHECKING',
    aiEngineAvailable,
    httpStatus,
    data,
    refetch: performHealthCheck,
  };
}
