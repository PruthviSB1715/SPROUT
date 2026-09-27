import { apiRequest } from './client';
import { ENDPOINTS, API_BASE_URL } from './endpoints';

/**
 * Robust backend health check querying GET /api/health
 */
export async function checkBackendHealth(timeoutMs = 5000) {
  const healthUrl = `${API_BASE_URL}${ENDPOINTS.HEALTH}`;
  
  try {
    const res = await apiRequest(ENDPOINTS.HEALTH, { method: 'GET' }, timeoutMs);
    const data = res.data || {};

    const isHealthy = data.status === 'healthy';
    
    // Check both nested services.ai_engine and direct ai_engine formats
    const aiEngineStatus = data.services?.ai_engine || data.ai_engine;
    const aiAvailable = aiEngineStatus === 'available';

    const healthResult = {
      online: isHealthy,
      aiEngineAvailable: aiAvailable,
      httpStatus: res.status,
      healthUrl,
      frontendOrigin: window.location.origin,
      backendBaseUrl: API_BASE_URL,
      data,
      timestamp: new Date().toISOString(),
    };

    if (import.meta.env.DEV) {
      console.log('[Backend Health Check Success]', healthResult);
    }

    return healthResult;
  } catch (error) {
    const offlineResult = {
      online: false,
      aiEngineAvailable: false,
      httpStatus: error.status || 0,
      healthUrl,
      frontendOrigin: window.location.origin,
      backendBaseUrl: API_BASE_URL,
      error: error.message || 'Unable to reach backend',
      timestamp: new Date().toISOString(),
    };

    if (import.meta.env.DEV) {
      console.warn('[Backend Health Check Failed]', offlineResult, error);
    }

    return offlineResult;
  }
}
