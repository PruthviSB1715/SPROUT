import { apiClient } from './apiClient';

export async function checkHealth() {
  try {
    return await apiClient.get('/api/health');
  } catch (error) {
    return {
      status: 'offline',
      services: {
        ai_engine: 'unavailable',
        sensor_system: 'unavailable',
      },
      error: error.message,
    };
  }
}
