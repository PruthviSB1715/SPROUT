import { apiRequest } from './client';
import { ENDPOINTS } from './endpoints';

export async function getRoverStatus() {
  try {
    const res = await apiRequest(ENDPOINTS.ROVER_STATUS);
    return res.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[rover API error]', error);
    }
    return {
      status: 'error',
      offline: true,
      source: 'simulated_fallback',
      message: 'Rover status system offline',
      data: {
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
      }
    };
  }
}
