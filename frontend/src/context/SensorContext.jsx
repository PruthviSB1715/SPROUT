import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sensorService } from '../services/sensorService';
import { getRoverStatus } from '../api/roverApi';

const SensorContext = createContext();

export function SensorProvider({ children }) {
  const [sensorState, setSensorState] = useState(sensorService.getCurrentState());

  const [rover, setRover] = useState({
    rover_id: 'Rover-R-Alpha',
    connection: 'online',
    simulation: true,
    battery: 88,
    mode: 'Autonomous Inspection',
    location: {
      name: 'North Field, Sector 4B',
      latitude: 34.0522,
      longitude: -118.2437,
      simulated: true
    },
    signal_strength: 'Excellent'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRover = useCallback(async () => {
    try {
      const roverRes = await getRoverStatus();
      if (roverRes && roverRes.data) {
        setRover(roverRes.data);
      }
    } catch (err) {
      console.warn('[SensorContext] Rover status fetch error:', err);
    }
  }, []);

  useEffect(() => {
    // Start sensor polling via sensorService
    sensorService.startPolling();

    // Subscribe to sensorService updates
    const unsubscribe = sensorService.subscribe((state) => {
      setSensorState(state);
    });

    fetchRover();
    const roverInterval = setInterval(fetchRover, 10000);

    return () => {
      unsubscribe();
      clearInterval(roverInterval);
    };
  }, [fetchRover]);

  const handleRefresh = useCallback(() => {
    sensorService.poll();
    fetchRover();
  }, [fetchRover]);

  return (
    <SensorContext.Provider
      value={{
        sensors: sensorState.sensors,
        history: sensorState.history,
        connectionStatus: sensorState.connectionStatus,
        rover,
        loading,
        error,
        isSimulated: sensorState.isSimulated,
        lastSync: sensorState.lastSync,
        refresh: handleRefresh
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensors() {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensors must be used within a SensorProvider');
  }
  return context;
}

