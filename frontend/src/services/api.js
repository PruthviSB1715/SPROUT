export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Health check querying GET http://127.0.0.1:8000/api/health
 */
export async function checkBackendHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { status: 'OFFLINE', httpStatus: response.status, aiEngineAvailable: false };
    }

    const data = await response.json();
    const isHealthy = data.status === 'healthy';
    const aiAvailable = (data.services?.ai_engine || data.ai_engine) === 'available';

    return {
      status: isHealthy ? 'ONLINE' : 'OFFLINE',
      httpStatus: response.status,
      aiEngineAvailable: aiAvailable,
      data,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      status: 'OFFLINE',
      httpStatus: 0,
      aiEngineAvailable: false,
      error: error.message,
    };
  }
}

import { sensorService } from './sensorService';

/**
 * Fetch sensor readings querying sensorService
 */
export async function getSensorData() {
  const state = sensorService.getCurrentState();
  return {
    status: 'success',
    source: state.sensors.source,
    data: state.sensors
  };
}


/**
 * Fetch rover status querying GET http://127.0.0.1:8000/api/rover/status
 */
export async function getRoverStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rover/status`, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const res = await response.json();
    return res;
  } catch (error) {
    console.warn('[api.getRoverStatus] Error fetching rover status:', error);
    return {
      status: 'error',
      data: {
        rover_status: 'offline',
        sensor_status: 'simulated',
        sensors: {},
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Send image file to POST http://127.0.0.1:8000/api/diagnose using FormData field "file"
 * IMPORTANT: Do NOT manually set Content-Type header so the browser generates the multipart boundary.
 */
export async function diagnoseImage(imageFile) {
  if (!imageFile) {
    throw new Error('Please select an image file to upload.');
  }

  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
    method: 'POST',
    body: formData, // Browser sets multipart/form-data boundary automatically
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errorDetail;
    } catch (e) {}

    if (response.status === 400) {
      throw new Error(`Invalid Image: ${errorDetail}`);
    } else if (response.status === 500) {
      throw new Error('AI diagnosis failed. Check the FastAPI terminal for details.');
    }
    throw new Error(`Diagnosis request failed (${errorDetail})`);
  }

  const data = await response.json();
  return data;
}
