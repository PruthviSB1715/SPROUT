import { API_BASE_URL } from './endpoints';

/**
 * Robust API Client with AbortController timeout and precise error logging
 */
export async function apiRequest(endpoint, options = {}, timeoutMs = 5000) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { raw: errorText };
      }

      const error = new Error(errorData.detail || `HTTP Error ${response.status}`);
      error.status = response.status;
      error.url = url;
      error.data = errorData;
      console.warn(`[API HTTP Error ${response.status}] ${url}:`, errorData);
      throw error;
    }

    const data = await response.json();
    return { data, status: response.status, url };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      console.warn(`[API Timeout] Request to ${url} timed out after ${timeoutMs}ms`);
      const timeoutError = new Error(`Request timed out (${timeoutMs}ms)`);
      timeoutError.isTimeout = true;
      timeoutError.url = url;
      throw timeoutError;
    }

    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      console.warn(`[API Network/CORS Failure] Unable to fetch ${url}. Origin: ${window.location.origin}`);
      const networkError = new Error(`Connection failed to ${url}`);
      networkError.isNetworkError = true;
      networkError.url = url;
      throw networkError;
    }

    throw err;
  }
}
