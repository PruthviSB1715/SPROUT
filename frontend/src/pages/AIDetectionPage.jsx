import React, { useState } from 'react';
import { diagnoseImage } from '../services/api';
import { useSensors } from '../hooks/useSensors';
import { addCaseToQueue } from '../api/validationApi';

export function AIDetectionPage() {
  const { sensors } = useSensors();

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Cc9bLei4aQe5esABD2PNGvAdCbCn_xZ3jzlMHr3xY6K8KZPs7ExRIfCBRpA5cmHONlPQLbYOMigc2eHG0GrVoReQSgZ70xRkp4kf0gEhosGhi2-9so6sMxHLrHaEYJgNF11_yfID05l5gpGguukjZp61-eKP30fGXcHqaQ7N22QmwerqY7pwJfeqgnKRm-DWp3tjZ3U6VcPGlLTXs4prVyQPMDx4nsxcWoV4aMlKnlVEg3JA4Ne8'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedToExpert, setSubmittedToExpert] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Active Diagnosis Result State
  const [result, setResult] = useState({
    crop: {
      name: 'Tomato',
      confidence: 0.9958,
      status: 'HIGH_CONFIDENCE',
      top_predictions: [
        { crop: 'Tomato', confidence: 0.9958 },
        { crop: 'Pepper', confidence: 0.0025 },
        { crop: 'Potato', confidence: 0.0012 }
      ]
    },
    disease: {
      available: true,
      crop: 'Tomato',
      disease: 'Leaf Mold',
      confidence: 0.4070,
      status: 'disease_detected',
      confidence_status: 'LOW_CONFIDENCE',
      top_predictions: [
        { disease: 'Leaf Mold', confidence: 0.4070 },
        { disease: 'Early Blight', confidence: 0.2156 },
        { disease: 'Target Spot', confidence: 0.1227 },
        { disease: 'Septoria Leaf Spot', confidence: 0.1040 },
        { disease: 'Late Blight', confidence: 0.1020 }
      ]
    }
  });

  const handleFileChange = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a JPG, JPEG, PNG or WEBP image.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setSubmittedToExpert(false);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      runSamplePrediction();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await diagnoseImage(selectedFile);
      if (response && response.diagnosis) {
        const diag = response.diagnosis;
        const resObj = diag.result || diag;

        setResult({
          crop: resObj.crop || { name: 'Tomato', confidence: 0.9958, top_predictions: [] },
          disease: resObj.disease || { disease: 'Leaf Mold', confidence: 0.4070, confidence_status: 'LOW_CONFIDENCE', top_predictions: [] }
        });
      }
    } catch (err) {
      console.warn('[AIDetectionPage] Upload error:', err);
      setError(err.message || 'Backend unavailable. Please make sure FastAPI is running at http://127.0.0.1:8000.');
    } finally {
      setLoading(false);
    }
  };

  const runSamplePrediction = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        crop: {
          name: 'Tomato',
          confidence: 0.9958,
          status: 'HIGH_CONFIDENCE',
          top_predictions: [
            { crop: 'Tomato', confidence: 0.9958 },
            { crop: 'Pepper', confidence: 0.0025 },
            { crop: 'Potato', confidence: 0.0012 }
          ]
        },
        disease: {
          available: true,
          crop: 'Tomato',
          disease: 'Leaf Mold',
          confidence: 0.4070,
          status: 'disease_detected',
          confidence_status: 'LOW_CONFIDENCE',
          top_predictions: [
            { disease: 'Leaf Mold', confidence: 0.4070 },
            { disease: 'Early Blight', confidence: 0.2156 },
            { disease: 'Target Spot', confidence: 0.1227 },
            { disease: 'Septoria Leaf Spot', confidence: 0.1040 },
            { disease: 'Late Blight', confidence: 0.1020 }
          ]
        }
      });
      setLoading(false);
    }, 500);
  };

  const handleSendToExpert = async () => {
    await addCaseToQueue({
      crop: result.crop.name,
      disease: result.disease.disease,
      aiConfidence: result.disease.confidence,
      riskLevel: result.disease.confidence_status === 'LOW_CONFIDENCE' ? 'Low Confidence' : 'Medium Risk',
      image: imagePreview || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Cc9bLei4aQe5esABD2PNGvAdCbCn_xZ3jzlMHr3xY6K8KZPs7ExRIfCBRpA5cmHONlPQLbYOMigc2eHG0GrVoReQSgZ70xRkp4kf0gEhosGhi2-9so6sMxHLrHaEYJgNF11_yfID05l5gpGguukjZp61-eKP30fGXcHqaQ7N22QmwerqY7pwJfeqgnKRm-DWp3tjZ3U6VcPGlLTXs4prVyQPMDx4nsxcWoV4aMlKnlVEg3JA4Ne8'
    });
    setSubmittedToExpert(true);
  };

  // Convert decimal to percentage format (e.g. 0.9958 -> 99.58%)
  const cropConfPercent = (result.crop.confidence * 100).toFixed(2);
  const diseaseConfPercent = (result.disease.confidence * 100).toFixed(2);
  const isLowConfidence = result.disease.confidence_status === 'LOW_CONFIDENCE' || result.disease.confidence < 0.5;

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            AI Crop Recognition & Disease Diagnostics
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Analyze crop images via FastAPI neural model integrated with soil moisture and microclimate telemetry.
          </p>
        </div>

        <div className="flex flex-wrap gap-sm">
          <label className="px-md py-2 rounded-full border border-secondary text-secondary font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center gap-xs cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">upload</span> Select Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-md py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-xs hover:bg-primary-container transition-all flex items-center gap-xs font-bold disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            {loading ? 'Analyzing image...' : 'Analyze Image'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-md rounded-lg bg-error-container text-on-error-container flex items-center justify-between text-sm shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-md rounded-xl border-2 border-dashed transition-colors flex flex-col sm:flex-row items-center justify-between gap-md ${
          dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-lowest'
        }`}
      >
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-[32px] text-primary">add_photo_alternate</span>
          <div>
            <p className="font-bold text-on-surface text-sm">Drag and drop crop leaf image here, or click to upload</p>
            <p className="text-xs text-on-surface-variant">Supports PlantVillage JPG, JPEG, PNG, WEBP leaf photos</p>
          </div>
        </div>

        {imagePreview && (
          <div className="flex items-center gap-sm">
            <img src={imagePreview} alt="Thumbnail" className="w-12 h-12 object-cover rounded border border-outline-variant" />
            <button
              onClick={handleRemoveImage}
              className="text-error hover:bg-error-container p-1.5 rounded transition-colors text-xs font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">delete</span> Remove
            </button>
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg">
        {/* Left Column: Image View & Bounding Box */}
        <div className="xl:col-span-8 flex flex-col gap-lg">
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant overflow-hidden relative">
            <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-surface-container relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Analyzed Leaf" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                  No image selected. Upload an image to analyze.
                </div>
              )}
              
              <div className="absolute top-[28%] left-[38%] w-[130px] h-[120px] border-2 border-primary border-dashed rounded flex flex-col items-end justify-start p-xs bg-primary/5">
                <span className="bg-primary text-on-primary font-label-md text-[10px] px-2 py-0.5 rounded font-bold shadow-xs">
                  AI Bounding Box
                </span>
              </div>
            </div>
          </div>

          {/* AI Result Card */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-xs border border-outline-variant space-y-md relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md pl-xs">
              <div>
                <div className="flex flex-wrap items-center gap-sm">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    Crop: {result.crop.name} — Disease: {result.disease.disease}
                  </h2>
                  <span className={`px-3 py-1 rounded-full font-label-md text-[11px] uppercase tracking-wider font-bold ${
                    isLowConfidence ? 'badge-warning' : 'bg-secondary-container text-on-secondary-container'
                  }`}>
                    {isLowConfidence ? '⚠ Low Confidence' : 'Disease Detected'}
                  </span>
                </div>
                
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                  {isLowConfidence
                    ? 'AI is not sufficiently confident. Consider taking another clear leaf image or performing additional field/soil analysis.'
                    : 'Neural network structural leaf pattern matched against PlantVillage disease database.'}
                </p>
              </div>

              {/* Crop & Disease Confidence Summaries */}
              <div className="flex gap-md bg-surface-bright p-sm rounded-lg border border-surface-variant text-xs">
                <div>
                  <span className="text-on-surface-variant text-[10px] uppercase font-bold block">Crop Confidence</span>
                  <p className="font-bold text-primary text-sm">{cropConfPercent}%</p>
                </div>
                <div className="border-l border-surface-variant pl-md">
                  <span className="text-on-surface-variant text-[10px] uppercase font-bold block">Disease Confidence</span>
                  <p className="font-bold text-secondary text-sm">{diseaseConfPercent}%</p>
                </div>
              </div>
            </div>

            {/* LOW CONFIDENCE WARNING & ACTION BUTTONS */}
            {isLowConfidence && (
              <div className="p-md rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-sm">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <span className="material-symbols-outlined text-amber-600 text-base">warning</span>
                  <span>⚠ LOW CONFIDENCE ({diseaseConfPercent}%): Verification Recommended</span>
                </div>
                <p className="text-xs text-amber-900/80">
                  AI is uncertain. Verification recommended before taking curative action.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-xs pt-xs">
                  <button
                    onClick={runSamplePrediction}
                    className="p-2 rounded bg-surface border border-amber-500/30 text-on-surface text-[11px] font-semibold hover:bg-surface-variant text-center"
                  >
                    Capture Another Image
                  </button>
                  <button
                    onClick={() => alert('Inspect lower leaf canopy for spots or lesions.')}
                    className="p-2 rounded bg-surface border border-amber-500/30 text-on-surface text-[11px] font-semibold hover:bg-surface-variant text-center"
                  >
                    Inspect Affected Leaf
                  </button>
                  <button
                    onClick={handleSendToExpert}
                    className="p-2 rounded bg-surface border border-amber-500/30 text-on-surface text-[11px] font-semibold hover:bg-surface-variant text-center"
                  >
                    Request Agent Verification
                  </button>
                  <button
                    onClick={handleSendToExpert}
                    className="p-2 rounded bg-primary text-on-primary text-[11px] font-bold hover:bg-primary-container text-center"
                  >
                    Request Adhikari Validation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Top Disease Predictions List & Microclimate */}
        <div className="xl:col-span-4 flex flex-col gap-lg">
          {/* Top Disease Predictions List */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-xs border border-outline-variant space-y-sm">
            <div className="flex items-center gap-sm mb-xs">
              <span className="material-symbols-outlined text-secondary text-xl">coronavirus</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Top Disease Predictions</h3>
            </div>
            <ul className="space-y-xs">
              {result.disease.top_predictions.map((pred, i) => (
                <li key={i} className="flex justify-between items-center p-2 rounded bg-surface-container-low text-xs">
                  <span className="font-semibold text-on-surface">{i + 1}. {pred.disease}</span>
                  <span className="font-mono text-secondary font-bold">{(pred.confidence * 100).toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Microclimate Evidence */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-xs border border-outline-variant flex-1">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Environmental Evidence</h3>
            </div>
            <div className="grid grid-cols-2 gap-xs text-xs">
              <div className="p-2 bg-surface-container-low rounded">
                <span className="text-on-surface-variant text-[10px] block">Temperature</span>
                <span className="font-bold text-on-surface">{sensors?.temperature || 31.4}°C</span>
              </div>
              <div className="p-2 bg-surface-container-low rounded">
                <span className="text-on-surface-variant text-[10px] block">Air Humidity</span>
                <span className="font-bold text-on-surface">{sensors?.humidity || 63}%</span>
              </div>
              <div className="p-2 bg-surface-container-low rounded col-span-2">
                <span className="text-on-surface-variant text-[10px] block">Soil Moisture Status</span>
                <span className="font-bold text-blue-600">{sensors?.soil_moisture || 40.5}% ({sensors?.soil_status || 'Optimal'})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
