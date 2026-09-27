import { useState, useCallback } from 'react';
import { diagnoseImage, getLatestDiagnosis } from '../api/diagnosis';

export function useDiagnosis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const runDiagnosis = useCallback(async (imageFile) => {
    if (!imageFile) {
      setError('Please select an image file to analyze.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await diagnoseImage(imageFile);
      setResult(data);
      return data;
    } catch (err) {
      const msg = err.message || 'AI diagnosis service failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatest = useCallback(async () => {
    try {
      const data = await getLatestDiagnosis();
      if (data && data.crop) {
        setResult(data);
      }
      return data;
    } catch (err) {
      console.warn('Failed to fetch latest diagnosis:', err);
    }
  }, []);

  return {
    runDiagnosis,
    fetchLatest,
    loading,
    error,
    result,
    setResult,
    clearError: () => setError(null)
  };
}
