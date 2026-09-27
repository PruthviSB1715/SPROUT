/**
 * Normalization Adapter for Environmental Sensor Data.
 * Isolated hardware-specific field names (temp, temp_c, soil_percent, soil_pct, humidity_pct, aqi)
 * into a single unified frontend format.
 */
export function normalizeSensorData(rawPayload, isHardwareConnected = true, forcedSource = null) {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return createEmptyNormalizedData();
  }

  // Extract nested data if payload is wrapped (e.g. { data: { ... } })
  const payload = rawPayload.data ? rawPayload.data : rawPayload;

  // Temperature extraction
  let temp = payload.temperature ?? payload.temp ?? payload.temp_c;
  if (temp !== null && temp !== undefined) {
    temp = parseFloat(Number(temp).toFixed(1));
    if (isNaN(temp)) temp = null;
  } else {
    temp = null;
  }

  // Humidity extraction
  let hum = payload.humidity ?? payload.humidity_pct;
  if (hum !== null && hum !== undefined) {
    hum = parseFloat(Number(hum).toFixed(1));
    if (isNaN(hum)) hum = null;
  } else {
    hum = null;
  }

  // Soil moisture extraction
  let soil = payload.soilMoisture ?? payload.soil_moisture ?? payload.soil_percent ?? payload.soil_pct;
  if (soil !== null && soil !== undefined) {
    soil = parseFloat(Number(soil).toFixed(1));
    if (isNaN(soil)) soil = null;
  } else {
    soil = null;
  }

  // Air quality index extraction
  let aqi = payload.airQuality ?? payload.air_quality_index ?? payload.aqi ?? payload.mq135_raw;
  if (aqi !== null && aqi !== undefined) {
    aqi = Math.round(Number(aqi));
    if (isNaN(aqi)) aqi = 0;
  } else {
    aqi = 0;
  }

  // Source determination
  let source = forcedSource || payload.source || (isHardwareConnected ? 'rover' : 'demo');
  if (source === 'simulated_fallback' || source === 'simulator' || source === 'manual_fallback') {
    source = 'demo';
  } else if (source === 'auto' || source === 'manual') {
    source = 'rover';
  }

  const isLive = isHardwareConnected && source === 'rover';

  const timestamp = payload.timestamp || payload.updated_at || new Date().toISOString();

  return {
    temperature: temp,
    humidity: hum,
    soilMoisture: soil,
    soil_moisture: soil,
    soil_percent: soil,
    airQuality: aqi,
    air_quality_index: aqi,
    timestamp: timestamp,
    source: isLive ? 'rover' : 'demo',
    status: isLive ? 'live' : 'demo',
    connectionStatus: isLive ? 'LIVE' : 'DEMO',
    flags: payload.flags || [],
    raw: payload
  };
}

export function createEmptyNormalizedData() {
  return {
    temperature: null,
    humidity: null,
    soilMoisture: null,
    soil_moisture: null,
    soil_percent: null,
    airQuality: 0,
    air_quality_index: 0,
    timestamp: new Date().toISOString(),
    source: 'demo',
    status: 'demo',
    connectionStatus: 'DEMO',
    flags: [],
    raw: null
  };
}
