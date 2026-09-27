/**
 * Centralized Sensor Simulation Service
 * Produces smooth realistic drift for environmental parameters when the rover is offline.
 *
 * BAD: 25 -> 31 -> 22 -> 34
 * GOOD: 26.1 -> 26.3 -> 26.4 -> 26.2 -> 26.5
 */

class SensorSimulator {
  constructor() {
    this.temp = 28.5;
    this.humidity = 58.0;
    this.soilMoisture = 42.5;
    this.airQuality = 4;

    this.tempTrend = 0.05;
    this.humTrend = -0.1;
    this.soilTrend = -0.05;

    this.stepCount = 0;
  }

  /**
   * Advances simulation by one step with smooth drift
   */
  next() {
    this.stepCount++;

    // Temperature drift between 24.0 and 32.0 C
    const tempNoise = (Math.random() - 0.48) * 0.2;
    this.temp = Math.max(24.0, Math.min(32.0, this.temp + this.tempTrend * 0.3 + tempNoise));
    if (this.temp >= 31.5) this.tempTrend = -Math.abs(this.tempTrend);
    if (this.temp <= 24.5) this.tempTrend = Math.abs(this.tempTrend);

    // Humidity drift between 45.0% and 75.0%
    const humNoise = (Math.random() - 0.48) * 0.3;
    this.humidity = Math.max(45.0, Math.min(75.0, this.humidity + this.humTrend * 0.4 + humNoise));
    if (this.humidity >= 73.0) this.humTrend = -Math.abs(this.humTrend);
    if (this.humidity <= 47.0) this.humTrend = Math.abs(this.humTrend);

    // Soil moisture gradual change between 30.0% and 70.0%
    const soilNoise = (Math.random() - 0.5) * 0.15;
    this.soilMoisture = Math.max(30.0, Math.min(70.0, this.soilMoisture + this.soilTrend * 0.2 + soilNoise));
    if (this.soilMoisture <= 32.0) this.soilTrend = 0.08; // simulate irrigation bounce
    if (this.soilMoisture >= 68.0) this.soilTrend = -0.05;

    // Air Quality index minor drift between 0 and 15
    const aqiNoise = Math.floor((Math.random() - 0.5) * 2);
    this.airQuality = Math.max(0, Math.min(15, this.airQuality + aqiNoise));

    const round = (val) => Math.round(val * 10) / 10;

    return {
      temperature: round(this.temp),
      humidity: round(this.humidity),
      soilMoisture: round(this.soilMoisture),
      soil_moisture: round(this.soilMoisture),
      soil_percent: round(this.soilMoisture),
      airQuality: this.airQuality,
      air_quality_index: this.airQuality,
      timestamp: new Date().toISOString(),
      source: 'demo',
      status: 'demo',
      connectionStatus: 'DEMO',
      flags: [
        { type: 'info', text: 'Simulated telemetry mode active (Rover offline)' }
      ]
    };
  }

  /**
   * Generates N historical simulated points for telemetry charts
   */
  generateHistory(count = 20) {
    const history = [];
    const now = Date.now();
    const intervalMs = 15000;

    let t = 28.0;
    let h = 60.0;
    let s = 45.0;

    for (let i = count - 1; i >= 0; i--) {
      const timeStr = new Date(now - i * intervalMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      t = Math.max(24.0, Math.min(32.0, t + (Math.random() - 0.48) * 0.4));
      h = Math.max(45.0, Math.min(75.0, h + (Math.random() - 0.48) * 0.5));
      s = Math.max(30.0, Math.min(70.0, s + (Math.random() - 0.5) * 0.2));

      history.push({
        timestamp: timeStr,
        temperature: Math.round(t * 10) / 10,
        humidity: Math.round(h * 10) / 10,
        soilMoisture: Math.round(s * 10) / 10,
        source: 'demo'
      });
    }

    return history;
  }
}

export const sensorSimulator = new SensorSimulator();
