/**
 * Configurable Agricultural Risk Thresholds
 * Allows easy calibration without modifying UI components.
 */
export const RISK_THRESHOLDS = {
  SOIL_MOISTURE: {
    DRY_MAX: 30.0,      // Below 30% soil moisture -> Dry / Attention required
    OPTIMAL_MAX: 60.0,  // 30% to 60% -> Optimal moisture
    // Above 60% -> Excessive / Wet
  },
  TEMPERATURE: {
    LOW_MAX: 15.0,     // Below 15°C -> Heat stress (low)
    HIGH_MIN: 33.0,    // Above 33°C -> High heat warning
  },
  HUMIDITY: {
    HIGH_MIN: 75.0,    // Above 75% -> Fungal / Disease proliferation risk
  },
  DISEASE_CONFIDENCE: {
    HIGH_MIN: 0.80,    // >= 80% -> HIGH_CONFIDENCE
    MEDIUM_MIN: 0.50,  // 50% to 80% -> MEDIUM_CONFIDENCE
    // Below 50% -> LOW_CONFIDENCE (Requires Field Verification)
  }
};

/**
 * Helper to evaluate soil condition text & badge status
 */
export function getSoilStatus(soilMoisture) {
  if (soilMoisture === null || soilMoisture === undefined) {
    return { status: 'Sensor Unavailable', level: 'UNKNOWN', badge: 'badge-warning', action: 'Inspect soil sensor' };
  }
  if (soilMoisture < RISK_THRESHOLDS.SOIL_MOISTURE.DRY_MAX) {
    return { status: 'Dry', level: 'ATTENTION', badge: 'badge-warning', action: 'Irrigation attention required' };
  }
  if (soilMoisture <= RISK_THRESHOLDS.SOIL_MOISTURE.OPTIMAL_MAX) {
    return { status: 'Optimal', level: 'OPTIMAL', badge: 'badge-normal', action: 'Soil moisture acceptable' };
  }
  return { status: 'Wet / Excessive', level: 'EXCESSIVE', badge: 'badge-normal', action: 'Avoid unnecessary irrigation' };
}

/**
 * Helper to evaluate AI confidence UX copy
 */
export function getConfidenceUX(confidence, statusFromBackend) {
  const confVal = typeof confidence === 'number' ? confidence : parseFloat(confidence || 0);

  if (statusFromBackend === 'HIGH_CONFIDENCE' || confVal >= RISK_THRESHOLDS.DISEASE_CONFIDENCE.HIGH_MIN) {
    return {
      status: 'HIGH_CONFIDENCE',
      label: 'High Confidence',
      badgeClass: 'badge-normal',
      copy: 'AI strongly indicates early symptoms of this condition.',
      isLow: false,
    };
  }

  if (statusFromBackend === 'MEDIUM_CONFIDENCE' || confVal >= RISK_THRESHOLDS.DISEASE_CONFIDENCE.MEDIUM_MIN) {
    return {
      status: 'MEDIUM_CONFIDENCE',
      label: 'Medium Confidence',
      badgeClass: 'badge-warning',
      copy: 'AI indicates a possible early crop disease pattern.',
      isLow: false,
    };
  }

  return {
    status: 'LOW_CONFIDENCE',
    label: 'Low Confidence — Verification Recommended',
    badgeClass: 'badge-warning',
    copy: 'AI is uncertain. Verification recommended before taking action.',
    isLow: true,
  };
}
