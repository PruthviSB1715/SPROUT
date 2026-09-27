import { apiClient } from './apiClient';

/**
 * Fetch rover telemetry & operational status from GET /api/rover/status
 */
export async function getRoverStatus() {
  try {
    const res = await apiClient.get('/api/rover/status');
    return res;
  } catch (error) {
    console.warn('[roverApi] Rover backend status unavailable, returning simulation status.');
    return {
      status: 'success',
      data: {
        rover_id: 'Rover-Alpha-01',
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
      }
    };
  }
}
