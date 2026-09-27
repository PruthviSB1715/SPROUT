/**
 * Safe CSV Parser for env_log.csv
 * Expected columns: timestamp, temp_c, humidity_pct, soil_pct, air_quality_index, source
 */
export function parseEnvCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const timestampIdx = header.indexOf('timestamp');
  const tempIdx = header.indexOf('temp_c');
  const humIdx = header.indexOf('humidity_pct');
  const soilIdx = header.indexOf('soil_pct');
  const aqiIdx = header.indexOf('air_quality_index');
  const sourceIdx = header.indexOf('source');

  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map((p) => p.trim());

    try {
      const tempVal = tempIdx !== -1 && parts[tempIdx] !== undefined ? parseFloat(parts[tempIdx]) : NaN;
      const humVal = humIdx !== -1 && parts[humIdx] !== undefined ? parseFloat(parts[humIdx]) : NaN;
      const soilVal = soilIdx !== -1 && parts[soilIdx] !== undefined ? parseFloat(parts[soilIdx]) : NaN;
      const aqiVal = aqiIdx !== -1 && parts[aqiIdx] !== undefined ? parseFloat(parts[aqiIdx]) : NaN;

      const record = {
        timestamp: timestampIdx !== -1 ? parts[timestampIdx] : new Date().toISOString(),
        temperature: !isNaN(tempVal) ? tempVal : null,
        temp_c: !isNaN(tempVal) ? tempVal : null,
        humidity: !isNaN(humVal) ? humVal : null,
        humidity_pct: !isNaN(humVal) ? humVal : null,
        soilMoisture: !isNaN(soilVal) ? soilVal : null,
        soil_moisture: !isNaN(soilVal) ? soilVal : null,
        soil_percent: !isNaN(soilVal) ? soilVal : null,
        airQuality: !isNaN(aqiVal) ? aqiVal : 0,
        air_quality_index: !isNaN(aqiVal) ? aqiVal : 0,
        source: sourceIdx !== -1 && parts[sourceIdx] ? parts[sourceIdx] : 'auto',
      };

      records.push(record);
    } catch (e) {
      // Ignore malformed rows safely
      continue;
    }
  }

  return records;
}
