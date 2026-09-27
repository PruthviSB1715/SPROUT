import React from 'react';
import { useNavigate } from 'react-router-dom';

export function CropHealthPage() {
  const navigate = useNavigate();

  const crops = [
    {
      id: 1,
      name: 'Tomato (North Field)',
      health: 'Attention Required',
      healthBadge: 'badge-warning',
      aiDetection: 'Early Blight',
      confidence: '68.0%',
      validation: 'Pending Krishi Adhikari Review',
      lastScanned: '12 mins ago',
      riskLevel: 'Medium Risk'
    },
    {
      id: 2,
      name: 'Potato (East Patch)',
      health: 'Low Confidence Alert',
      healthBadge: 'badge-warning',
      aiDetection: 'Leaf Mold',
      confidence: '40.7%',
      validation: 'Pending Review',
      lastScanned: '2 hours ago',
      riskLevel: 'Requires Field Verification'
    },
    {
      id: 3,
      name: 'Capsicum (Sector 1)',
      health: 'Optimal / Healthy',
      healthBadge: 'badge-normal',
      aiDetection: 'None (Healthy Tissue)',
      confidence: '98.2%',
      validation: 'Self-Verified',
      lastScanned: '30 mins ago',
      riskLevel: 'Low Risk'
    }
  ];

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Crop Health Overview</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Crop-by-crop health tracking with neural confidence metrics and Krishi Adhikari validation state.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {crops.map((crop) => (
          <div key={crop.id} className="bg-surface-container-lowest rounded-xl p-md card-shadow border border-surface-variant flex flex-col justify-between space-y-md">
            <div>
              <div className="flex justify-between items-start mb-xs">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{crop.name}</h3>
                <span className={`px-2 py-0.5 rounded-full font-label-md text-[10px] uppercase font-bold ${crop.healthBadge}`}>
                  {crop.health}
                </span>
              </div>

              <div className="space-y-xs text-xs text-on-surface-variant mt-md">
                <div className="flex justify-between py-1 border-b border-surface-variant">
                  <span>AI Detections:</span>
                  <span className="font-bold text-on-surface">{crop.aiDetection}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-variant">
                  <span>AI Confidence:</span>
                  <span className="font-bold text-primary">{crop.confidence}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-variant">
                  <span>Validation Status:</span>
                  <span className="font-semibold text-secondary">{crop.validation}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Last Scanned:</span>
                  <span>{crop.lastScanned}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/ai-diagnostics')}
              className="w-full py-2 rounded bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-xs font-bold transition-colors"
            >
              View Diagnostic Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
