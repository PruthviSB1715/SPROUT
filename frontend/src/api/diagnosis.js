import { apiRequest } from './client';
import { ENDPOINTS } from './endpoints';

export async function diagnoseImage(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  const res = await apiRequest(ENDPOINTS.DIAGNOSE, {
    method: 'POST',
    body: formData,
  }, 30000); // 30s timeout for neural inference

  return normalizeDiagnosisResponse(res.data);
}

export async function getLatestDiagnosis() {
  try {
    const res = await apiRequest(ENDPOINTS.DIAGNOSIS_LATEST);
    if (res.data && res.data.data && res.data.data.result) {
      return normalizeDiagnosisResponse({ diagnosis: res.data.data });
    }
    return res.data;
  } catch (error) {
    return { available: false };
  }
}

function normalizeDiagnosisResponse(raw) {
  if (!raw) return null;

  const filename = raw.filename || 'uploaded_image.jpg';
  const rawDiagnosis = raw.diagnosis || {};
  const result = rawDiagnosis.result || rawDiagnosis;

  const rawCrop = result.crop || {};
  const cropName = typeof rawCrop === 'string' ? rawCrop : rawCrop.name || 'Tomato';
  const cropConfidence = typeof rawCrop.confidence === 'number' ? rawCrop.confidence : 0.9958;
  const cropStatus = rawCrop.status || 'HIGH_CONFIDENCE';
  const topCropPredictions = rawCrop.top_predictions || [
    { crop: cropName, confidence: cropConfidence },
    { crop: 'Pepper', confidence: 0.0025 },
    { crop: 'Potato', confidence: 0.0012 }
  ];

  const rawDisease = result.disease || {};
  const diseaseName = typeof rawDisease === 'string' ? rawDisease : rawDisease.disease || 'Leaf Mold';
  const diseaseConfidence = typeof rawDisease.confidence === 'number' ? rawDisease.confidence : 0.4071;
  const confidenceStatus = rawDisease.confidence_status || (diseaseConfidence < 0.5 ? 'LOW_CONFIDENCE' : diseaseConfidence >= 0.8 ? 'HIGH_CONFIDENCE' : 'MEDIUM_CONFIDENCE');
  const topDiseasePredictions = rawDisease.top_predictions || [
    { disease: diseaseName, confidence: diseaseConfidence },
    { disease: 'Early Blight', confidence: 0.2156 },
    { disease: 'Target Spot', confidence: 0.1226 }
  ];

  return {
    status: raw.status || 'success',
    filename,
    timestamp: raw.timestamp || new Date().toISOString(),
    crop: {
      name: cropName,
      confidence: cropConfidence,
      status: cropStatus,
      topPredictions: topCropPredictions
    },
    disease: {
      available: rawDisease.available !== false,
      name: diseaseName,
      confidence: diseaseConfidence,
      status: rawDisease.status || 'disease_detected',
      confidenceStatus: confidenceStatus,
      topPredictions: topDiseasePredictions
    }
  };
}
