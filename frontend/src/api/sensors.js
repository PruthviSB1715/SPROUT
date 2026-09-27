import { sensorService } from '../services/sensorService';

export async function getSensorData() {
  const state = sensorService.getCurrentState();
  return {
    status: 'success',
    source: state.sensors.source,
    offline: state.sensors.source === 'demo',
    data: state.sensors,
  };
}

