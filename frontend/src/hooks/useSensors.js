import { useState, useEffect, useCallback } from 'react';
import { sensorService } from '../services/sensorService';

/**
 * Custom hook to poll and consume normalized sensor data.
 * Synchronized across components via sensorService.
 */
export function useSensors(pollingEnabled = true, intervalMs = 3000) {
  const [state, setState] = useState(() => sensorService.getCurrentState());

  useEffect(() => {
    if (pollingEnabled) {
      sensorService.startPolling(intervalMs);
    }

    const unsubscribe = sensorService.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, [pollingEnabled, intervalMs]);

  const refetch = useCallback(() => {
    sensorService.poll();
  }, []);

  return {
    sensors: state.sensors,
    history: state.history,
    connectionStatus: state.connectionStatus,
    loading: false,
    error: null,
    isSimulated: state.isSimulated,
    lastSync: state.lastSync,
    refetch,
  };
}

