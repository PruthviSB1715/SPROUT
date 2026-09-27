import React from 'react';
import { useSensors } from '../hooks/useSensors';
import { getSoilStatus } from '../config/riskThresholds';
import { SensorStatusBadge } from '../components/common/SensorStatusBadge';

export function IrrigationPage() {
  const { sensors, connectionStatus } = useSensors(true, 3000);

  const moisture = sensors?.soil_moisture ?? sensors?.soilMoisture ?? 40.5;
  const soilInfo = getSoilStatus(moisture);

  return (
    <div className="space-y-lg max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-sm">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Irrigation & Soil Management</h1>
          <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          AI-assisted irrigation rules derived from live soil moisture ({moisture}%), air humidity, and temperature sensors.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-lg card-shadow border border-surface-variant space-y-md">
        <div className="flex justify-between items-center pb-md border-b border-surface-variant">
          <div>
            <div className="flex items-center gap-2 mb-xs">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Current Soil Moisture</span>
              <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
            </div>
            <div className="font-display-lg text-display-lg text-blue-600 font-bold mt-xs">
              {moisture}%
            </div>
          </div>
          <span className={`px-4 py-1.5 rounded-full font-bold text-sm ${soilInfo.badge}`}>
            Status: {soilInfo.status}
          </span>
        </div>


        <div className="bg-primary/5 border border-primary/20 rounded-lg p-md relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
          <h4 className="font-label-md text-xs text-primary font-bold uppercase tracking-wider mb-xs pl-xs">
            AI-Assisted Water Requirement Status
          </h4>
          <p className="font-body-md text-body-md text-on-surface pl-xs leading-relaxed font-medium">
            <strong>{soilInfo.action}</strong> — Based on soil moisture of {moisture}%, ambient temperature of {sensors?.temperature || 31.4}°C, and relative humidity of {sensors?.humidity || 63}%.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-sm text-xs text-center font-mono pt-xs">
          <div className="bg-surface-container p-sm rounded">
            <span className="text-[10px] text-on-surface-variant block uppercase">Dry Threshold</span>
            &lt; 30%
          </div>
          <div className="bg-surface-container p-sm rounded">
            <span className="text-[10px] text-on-surface-variant block uppercase">Optimal Range</span>
            30% — 60%
          </div>
          <div className="bg-surface-container p-sm rounded">
            <span className="text-[10px] text-on-surface-variant block uppercase">Excessive Threshold</span>
            &gt; 60%
          </div>
        </div>
      </div>
    </div>
  );
}
