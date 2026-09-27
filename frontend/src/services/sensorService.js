import { ROVER_CONFIG } from '../config/roverConfig';
import { normalizeSensorData } from './sensorAdapter';
import { sensorSimulator } from './sensorSimulator';

/**
 * SensorService
 * Manages live polling, hardware connectivity detection, priority endpoint fallback,
 * automatic transition between LIVE 🟢, CONNECTING 🔵, DEMO 🟡, and history management.
 */
class SensorService {
  constructor() {
    this.listeners = new Set();
    this.connectionState = 'DEMO'; // 'LIVE' | 'CONNECTING' | 'DEMO' | 'OFFLINE'
    this.failedAttempts = 0;
    this.pollingTimer = null;
    this.isPolling = false;

    // Default normalized state initialized with simulator
    this.currentSensors = sensorSimulator.next();
    this.history = sensorSimulator.generateHistory(20);
    this.lastSuccessfulPoll = null;

    this.activeEndpoint = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Send current state immediately
    listener({
      sensors: this.currentSensors,
      history: this.history,
      connectionStatus: this.connectionState,
      isSimulated: this.currentSensors.source === 'demo',
      activeEndpoint: this.activeEndpoint,
      lastSync: this.lastSuccessfulPoll,
    });

    return () => this.listeners.delete(listener);
  }

  notify() {
    const payload = {
      sensors: this.currentSensors,
      history: this.history,
      connectionStatus: this.connectionState,
      isSimulated: this.currentSensors.source === 'demo',
      activeEndpoint: this.activeEndpoint,
      lastSync: this.lastSuccessfulPoll,
    };
    this.listeners.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error('[SensorService subscriber error]', e);
      }
    });
  }

  startPolling(intervalMs = ROVER_CONFIG.POLL_INTERVAL_MS) {
    if (this.isPolling) return;
    this.isPolling = true;

    // Immediate first fetch
    this.poll();

    this.pollingTimer = setInterval(() => {
      this.poll();
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.isPolling = false;
  }

  /**
   * Main polling cycle with priority fallback chain
   */
  async poll() {
    const endpoints = [
      { name: 'rover_dashboard', url: `${ROVER_CONFIG.ROVER_API_BASE}/api/sensors` },
      { name: 'fastapi_backend', url: `${ROVER_CONFIG.BACKEND_API_BASE}/api/sensors` },
      { name: 'esp32_direct', url: ROVER_CONFIG.ESP32_SENSOR_URL },
    ];

    let liveSuccess = false;
    let fetchedData = null;
    let successfulUrl = null;

    for (const ep of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ROVER_CONFIG.TIMEOUT_MS);

        const res = await fetch(ep.url, {
          method: 'GET',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          // Check if payload contains valid sensor data and isn't flagged offline by rover_dashboard.py
          if (json && (json.temp !== null || json.temperature !== null || json.soil_percent !== null || json.soil_moisture !== null)) {
            if (json.connection_status !== 'offline') {
              liveSuccess = true;
              fetchedData = json;
              successfulUrl = ep.url;
              break;
            }
          }
        }
      } catch (err) {
        // Connection error or timeout - try next endpoint in priority list
        continue;
      }
    }

    if (liveSuccess && fetchedData) {
      this.failedAttempts = 0;
      this.connectionState = 'LIVE';
      this.activeEndpoint = successfulUrl;
      this.lastSuccessfulPoll = new Date().toISOString();

      const normalized = normalizeSensorData(fetchedData, true, 'rover');
      this.currentSensors = normalized;

      // Update telemetry history with live reading
      this.appendHistoryPoint({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temperature: normalized.temperature,
        humidity: normalized.humidity,
        soilMoisture: normalized.soilMoisture,
        source: 'rover',
      });

      // Try fetching CSV history if connected to rover_dashboard
      this.fetchCsvHistory();
    } else {
      // Live fetch failed
      this.failedAttempts++;

      if (this.failedAttempts === 1) {
        this.connectionState = 'CONNECTING';
      } else {
        this.connectionState = 'DEMO';
      }

      this.activeEndpoint = null;
      // Fallback to smooth simulator
      const simData = sensorSimulator.next();
      this.currentSensors = simData;

      this.appendHistoryPoint({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temperature: simData.temperature,
        humidity: simData.humidity,
        soilMoisture: simData.soilMoisture,
        source: 'demo',
      });
    }

    this.notify();
  }

  async fetchCsvHistory() {
    try {
      const url = `${ROVER_CONFIG.ROVER_API_BASE}/api/sensors/history`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map((item) => ({
            timestamp: item.timestamp ? item.timestamp.slice(11, 19) : '',
            temperature: item.temp ?? item.temp_c,
            humidity: item.humidity ?? item.humidity_pct,
            soilMoisture: item.soil_percent ?? item.soil_pct,
            source: item.source || 'rover',
          })).filter((x) => x.temperature !== null && x.humidity !== null);

          if (formatted.length >= 5) {
            this.history = formatted.slice(-25);
          }
        }
      }
    } catch (e) {
      // Silently ignore if history endpoint is not available
    }
  }

  appendHistoryPoint(point) {
    const newHistory = [...this.history, point];
    if (newHistory.length > 30) {
      newHistory.shift();
    }
    this.history = newHistory;
  }

  getCurrentState() {
    return {
      sensors: this.currentSensors,
      history: this.history,
      connectionStatus: this.connectionState,
      isSimulated: this.currentSensors.source === 'demo',
      activeEndpoint: this.activeEndpoint,
      lastSync: this.lastSuccessfulPoll,
    };
  }
}

export const sensorService = new SensorService();
