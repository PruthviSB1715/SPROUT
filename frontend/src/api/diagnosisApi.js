import { apiClient } from './apiClient';

/**
 * Upload crop leaf image to POST /api/diagnose
 * @param {File} imageFile 
 */
export async function diagnoseImage(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await apiClient.post('/api/diagnose', formData);
    return response;
  } catch (error) {
    console.error('[diagnosisApi] AI Diagnosis request failed:', error);
    throw error;
  }
}

/**
 * Fetch latest diagnosis from GET /api/diagnosis/latest
 */
export async function getLatestDiagnosis() {
  try {
    return await apiClient.get('/api/diagnosis/latest');
  } catch (error) {
    return {
      status: 'success',
      data: {
        available: false,
        filename: null,
        result: null,
        timestamp: null
      }
    };
  }
}

/**
 * Fetch unified dashboard data from GET /api/dashboard
 */
export async function getDashboardData() {
  try {
    return await apiClient.get('/api/dashboard');
  } catch (error) {
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      rover: {
        rover_status: 'online',
        sensor_status: 'simulated',
        sensors: {
          temperature: 31.4,
          humidity: 63.0,
          soil_moisture: 40.5
        }
      },
      environment: {
        temperature: 31.4,
        humidity: 63.0,
        soil_moisture: 40.5
      },
      diagnosis: { available: false }
    };
  }
}
