/**
 * Centralized Hardware & Rover Configuration
 * 
 * Default values match the ESP32-CAM and ESP32 main board setup:
 * - ESP32-CAM MJPEG Stream: http://192.168.4.2:81/stream
 * - ESP32-CAM Capture: http://192.168.4.2/capture
 * - Python Dashboard Bridge API: http://localhost:5000
 */

export const ROVER_CONFIG = {
  // Live MJPEG HTTP stream from ESP32-CAM
  CAMERA_STREAM_URL: import.meta.env.VITE_ROVER_CAMERA_URL || 'http://192.168.4.2:81/stream',
  
  // Python Flask Bridge API URL (rover_dashboard.py)
  ROVER_API_BASE: import.meta.env.VITE_ROVER_API_URL || 'http://localhost:5000',

  // Main Backend API Base (FastAPI)
  BACKEND_API_BASE: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  
  // ESP32 Direct Sensor API (if polling directly from browser)
  ESP32_SENSOR_URL: import.meta.env.VITE_ESP32_SENSOR_URL || 'http://192.168.4.1/sensors',

  // Connection timeouts & retries
  STREAM_RETRY_INTERVAL_MS: 3000,
  POLL_INTERVAL_MS: 3000,
  TIMEOUT_MS: 2500,
  MAX_FAILED_ATTEMPTS: 2,
};

