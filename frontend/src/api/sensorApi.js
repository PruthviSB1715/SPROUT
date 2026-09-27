import { sensorService } from '../services/sensorService';

/**
 * Fetch latest sensor readings normalized via sensorService
 */
export async function getSensorData() {
  const state = sensorService.getCurrentState();
  return {
    status: 'success',
    source: state.sensors.source,
    data: state.sensors,
  };
}

