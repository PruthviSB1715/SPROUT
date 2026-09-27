// Krishi Adhikari Expert Validation Queue API & State Store

const initialQueue = [
  {
    id: 'CASE-892-A',
    crop: 'Tomato',
    disease: 'Late Blight',
    aiConfidence: 0.94,
    riskLevel: 'Critical',
    status: 'PENDING_REVIEW',
    location: 'Sector 4, Plot B',
    timestamp: '2h ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA77yKKQldfuoZfYIjcdUwZJ61-HQaHjnjWeSzemZFvMyI4pGOJOBfc07gEuccImeowWH05bZwnxjO7SQAjnYvgwyRV12Rzw2aMyfR01cQSU5XRGrTH5HdDpzPoKkSmFTbnlQLyVN96aAAEAwNloAPNDIK87t4Rg1cRO7_ISRnJqF94tsVwwlYMPMt_AxvBXCgM_UmHDDJCN28KPxuDfYTJRHJ-EOeM6ltcNk2CuRhZhaHiinBgvW-k',
    indicators: [
      'Necrotic lesions on leaf margins',
      'White sporulation visible',
      'High humidity trend (88% over 72h)'
    ],
    sensors: { temperature: 18.0, humidity: 88.0, soilMoisture: 42.0 },
    expertDecision: null,
    expertNotes: null,
    validatedBy: null,
    validatedAt: null
  },
  {
    id: 'CASE-890-C',
    crop: 'Tomato',
    disease: 'Early Blight',
    aiConfidence: 0.68,
    riskLevel: 'Medium',
    status: 'PENDING_REVIEW',
    location: 'North Field, Row 4',
    timestamp: '12m ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Cc9bLei4aQe5esABD2PNGvAdCbCn_xZ3jzlMHr3xY6K8KZPs7ExRIfCBRpA5cmHONlPQLbYOMigc2eHG0GrVoReQSgZ70xRkp4kf0gEhosGhi2-9so6sMxHLrHaEYJgNF11_yfID05l5gpGguukjZp61-eKP30fGXcHqaQ7N22QmwerqY7pwJfeqgnKRm-DWp3tjZ3U6VcPGlLTXs4prVyQPMDx4nsxcWoV4aMlKnlVEg3JA4Ne8',
    indicators: [
      'Concentric ring spots detected',
      'Lower foliage affected',
      'Moderate temp & humidity'
    ],
    sensors: { temperature: 31.4, humidity: 63.0, soilMoisture: 40.5 },
    expertDecision: null,
    expertNotes: null,
    validatedBy: null,
    validatedAt: null
  },
  {
    id: 'CASE-885-B',
    crop: 'Potato',
    disease: 'Leaf Mold',
    aiConfidence: 0.407,
    riskLevel: 'Low Confidence',
    status: 'REQUIRES_FIELD_VERIFICATION',
    location: 'Sector 2, Plot A',
    timestamp: '5h ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCco9HbbANzJN3DtdcWOIs7Vgsnn8ANOjevqCe1CZyqdUfJ-ievG2YDBbOKLAOITL4BUcw_2G3KvZF90Y2KtZrJpqH4pi96xZiU8yT4nahsGUnVcmGdAzuBTj7Z-y3-naUQ9T74M2OLih4CSY-A-A7sYdhNT3takIIBBIGm7PlRIcaaDUcEklOBJx6YIJ-kudtn4rmWZjm0HkewvU7jSXFLS2tHT6UWUR45Vyny0LGy--oeKtijmbal',
    indicators: [
      'Faint chlorotic spots',
      'Low AI confidence (40.7%)',
      'Field inspection recommended'
    ],
    sensors: { temperature: 29.0, humidity: 55.0, soilMoisture: 38.0 },
    expertDecision: null,
    expertNotes: null,
    validatedBy: null,
    validatedAt: null
  }
];

let validationQueue = [...initialQueue];

export async function getValidationQueue() {
  return [...validationQueue];
}

export async function submitValidation(caseId, decisionData) {
  const itemIndex = validationQueue.findIndex(item => item.id === caseId);
  
  if (itemIndex !== -1) {
    validationQueue[itemIndex] = {
      ...validationQueue[itemIndex],
      status: decisionData.decision === 'CONFIRMED' ? 'VALIDATED' : decisionData.decision === 'REJECTED' ? 'REJECTED' : 'INCONCLUSIVE',
      expertDecision: decisionData.decision,
      intervention: decisionData.intervention,
      expertNotes: decisionData.notes,
      validatedBy: decisionData.adhikariName || 'Krishi Adhikari Dr. Sharma',
      validatedAt: new Date().toISOString()
    };
    return validationQueue[itemIndex];
  }
  
  throw new Error(`Case ${caseId} not found`);
}

export async function addCaseToQueue(newCase) {
  const created = {
    id: `CASE-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-2)}`,
    status: 'PENDING_REVIEW',
    timestamp: 'Just now',
    sensors: { temperature: 31.4, humidity: 63.0, soilMoisture: 40.5 },
    indicators: ['Automated AI detection', 'Pending expert review'],
    ...newCase
  };
  validationQueue.unshift(created);
  return created;
}
