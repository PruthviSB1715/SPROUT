import { useState, useEffect, useCallback } from 'react';
import { getRoverStatus } from '../api/rover';

/**
 * Custom hook to poll rover status at a configurable interval (default 5000ms).
 * @param {boolean} pollingEnabled - Easily disable/enable polling
 * @param {number} intervalMs - Polling interval in milliseconds
 */
export function useRoverStatus(pollingEnabled = true, intervalMs = 5000) {
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
    signal_strength: 'Excellent',
    last_sync: new Date().toISOString()
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRover = useCallback(async () => {
    try {
      const res = await getRoverStatus();
      if (res && res.data) {
        setRover(res.data);
        setError(res.offline ? 'Rover status system offline' : null);
      }
    } catch (err) {
      setError(err.message || 'Rover status unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRover();

    if (!pollingEnabled) return;

    const timer = setInterval(fetchRover, intervalMs);
    return () => clearInterval(timer);
  }, [fetchRover, pollingEnabled, intervalMs]);

  return { rover, loading, error, refetch: fetchRover };
}
