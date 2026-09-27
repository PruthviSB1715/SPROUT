import React from 'react';
import { useSensors } from '../hooks/useSensors';
import { RISK_THRESHOLDS } from '../config/riskThresholds';
import { SensorStatusBadge } from '../components/common/SensorStatusBadge';

export function RiskMonitorPage() {
  const { sensors, connectionStatus } = useSensors(true, 3000);

  const temp = sensors?.temperature ?? 31.4;
  const humidity = sensors?.humidity ?? 63;
  const moisture = sensors?.soil_moisture ?? sensors?.soilMoisture ?? 40.5;


  const risks = [
    {
      id: 1,
      category: 'Disease Risk',
      title: 'Fungal Propagation Risk (Leaf Mold / Early Blight)',
      severity: humidity > RISK_THRESHOLDS.HUMIDITY.HIGH_MIN ? 'HIGH' : 'MEDIUM',
      severityBadge: humidity > RISK_THRESHOLDS.HUMIDITY.HIGH_MIN ? 'badge-critical' : 'badge-warning',
      evidence: `Temp ${temp}°C + Humidity ${humidity}% microclimate conditions logged by sensors.`,
      location: 'Sector 4B (Tomato)',
      action: 'Inspect affected leaves and request Krishi Adhikari validation.',
    },
    {
      id: 2,
      category: 'Water Stress Risk',
      title: 'Soil Moisture Level Evaluation',
      severity: moisture < RISK_THRESHOLDS.SOIL_MOISTURE.DRY_MAX ? 'HIGH' : 'LOW',
      severityBadge: moisture < RISK_THRESHOLDS.SOIL_MOISTURE.DRY_MAX ? 'badge-critical' : 'badge-normal',
      evidence: `Live soil moisture at ${moisture}% (Dry threshold: < 30%).`,
      location: 'North Field All Sectors',
      action: moisture < 30 ? 'Trigger irrigation sequence.' : 'Soil moisture acceptable.',
    },
    {
      id: 3,
      category: 'Heat Stress Risk',
      title: 'Canopy Heat Warning',
      severity: temp > RISK_THRESHOLDS.TEMPERATURE.HIGH_MIN ? 'HIGH' : 'MODERATE',
      severityBadge: temp > RISK_THRESHOLDS.TEMPERATURE.HIGH_MIN ? 'badge-warning' : 'badge-normal',
      evidence: `Current temperature ${temp}°C (Warning threshold: > 33°C).`,
      location: 'Sector 1-4',
      action: 'Monitor transpiration rate during peak afternoon hours.',
    },
  ];

  return (
    <div className="space-y-lg">
      <div>
        <div className="flex items-center gap-sm">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Agricultural Risk Monitor</h1>
          <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">

          Real-time risk summary evaluated against calibrated agricultural threshold rules (`src/config/riskThresholds.js`).
        </p>
      </div>

      <div className="space-y-md">
        {risks.map((r) => (
          <div key={r.id} className="bg-surface-container-lowest rounded-xl p-md card-shadow border border-surface-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
            <div className="space-y-xs flex-1">
              <div className="flex items-center gap-sm">
                <span className="font-label-md text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">{r.category}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-label-md text-[10px] uppercase font-bold ${r.severityBadge}`}>
                  {r.severity}
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{r.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{r.evidence}</p>
              <div className="flex items-center gap-md text-xs text-outline font-medium mt-xs">
                <span>Target Field: {r.location}</span>
              </div>
            </div>

            <div className="w-full md:w-auto bg-surface-bright p-sm rounded border border-surface-variant text-xs space-y-1">
              <span className="font-bold text-primary block">Recommended Action:</span>
              <p className="text-on-surface">{r.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
