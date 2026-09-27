import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensors } from '../hooks/useSensors';
import { useRoverStatus } from '../hooks/useRoverStatus';
import { getSoilStatus } from '../config/riskThresholds';
import { FieldHealthMap } from '../components/common/FieldHealthMap';
import { SensorStatusBadge } from '../components/common/SensorStatusBadge';

export function DashboardPage() {
  const { user } = useAuth();
  const { sensors, connectionStatus, isSimulated } = useSensors(true, 3000);
  const { rover } = useRoverStatus(true, 5000);
  const navigate = useNavigate();

  const soilInfo = getSoilStatus(sensors?.soil_moisture);

  const [actions, setActions] = useState([
    { id: 1, text: 'Inspect row 4 - Tomato', detail: 'Scheduled by AI based on growth anomaly.', done: false },
    { id: 2, text: 'Low moisture in South patch', detail: 'Trigger irrigation sequence for sectors 7-9.', done: false },
    { id: 3, text: 'Clean Rover Camera Lenses', detail: 'Routine maintenance required for optimal AI detection.', done: true },
  ]);

  const toggleAction = (id) => {
    setActions(actions.map(a => a.id === id ? { ...a, done: !a.done } : a));
  };

  return (
    <div className="space-y-lg">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">
            Good Morning, {user?.name || 'Farmer'}
          </h2>
          <div className="flex flex-wrap items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
              <span className="font-medium text-on-surface">{rover?.location?.name || 'North Field'}</span>
            </div>
            <span className="text-outline">|</span>
            <div className="flex items-center gap-xs">
              <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
            </div>
            <span className="text-outline">|</span>
            <div className="flex items-center gap-xs text-on-surface-variant/80">
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>3s Live Sensor Sync: Active</span>
            </div>
          </div>
        </div>

        <div className="flex gap-sm w-full md:w-auto">
          <button 
            onClick={() => navigate('/rover')}
            className="flex-1 md:flex-none flex items-center justify-center gap-xs px-md py-sm rounded border border-outline text-on-surface hover:bg-surface-variant transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
            Rover Controls
          </button>
          <button 
            onClick={() => navigate('/ai-diagnostics')}
            className="flex-1 md:flex-none flex items-center justify-center gap-xs px-md py-sm rounded bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-xs font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
            New Scan
          </button>
        </div>
      </div>

      {/* Bento Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
        {/* Field Health */}
        <div className="col-span-2 md:col-span-3 lg:col-span-2 bg-surface-container-lowest rounded-lg p-md card-shadow border border-surface-variant flex flex-col justify-between h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
          <div>
            <div className="flex justify-between items-start mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Field Health Index
              </span>
              <span className="material-symbols-outlined text-primary">eco</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="font-display-lg text-display-lg text-on-surface">
                92<span className="text-headline-md">%</span>
              </span>
            </div>
          </div>
          <div className="mt-md flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full badge-normal font-label-md text-[10px] uppercase font-bold">
              Optimal Condition
            </span>
            <div className="w-24 h-6 relative">
              <svg className="w-full h-full text-primary stroke-current" fill="none" strokeWidth="2" viewBox="0 0 100 20">
                <path d="M0,20 L20,15 L40,18 L60,10 L80,12 L100,2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Risks */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1 bg-surface-container-lowest rounded-lg p-md card-shadow border border-surface-variant flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Active Risks
              </span>
              <span className="material-symbols-outlined text-secondary">warning</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">1</span>
            </div>
          </div>
          <div className="mt-md">
            <span className="px-2 py-0.5 rounded-full badge-warning font-label-md text-[10px] uppercase font-bold">
              Medium Risk
            </span>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="col-span-1 bg-surface-container-lowest rounded-lg p-md card-shadow border border-surface-variant flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-xs">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Moisture
              </span>
              <span className="material-symbols-outlined text-blue-600">water_drop</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                {sensors?.soil_moisture ?? sensors?.soilMoisture ?? 40.5}<span className="text-body-sm">%</span>
              </span>
            </div>
            <div className="mt-1">
              <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
            </div>
          </div>
          <div className="mt-sm w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${sensors?.soil_moisture || 40.5}%` }}></div>
          </div>
        </div>

        {/* Temperature */}
        <div className="col-span-1 bg-surface-container-lowest rounded-lg p-md card-shadow border border-surface-variant flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-xs">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Temp
              </span>
              <span className="material-symbols-outlined text-orange-500">thermostat</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                {sensors?.temperature ?? 31.4}<span className="text-body-sm">°C</span>
              </span>
            </div>
            <div className="mt-1">
              <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
            </div>
          </div>
          <div className="mt-sm w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-400 h-full rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Humidity */}
        <div className="col-span-1 bg-surface-container-lowest rounded-lg p-md card-shadow border border-surface-variant flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-xs">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Humidity
              </span>
              <span className="material-symbols-outlined text-cyan-600">air</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                {sensors?.humidity ?? 63.0}<span className="text-body-sm">%</span>
              </span>
            </div>
            <div className="mt-1">
              <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
            </div>
          </div>
          <div className="mt-sm w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${sensors?.humidity || 63}%` }}></div>
          </div>
        </div>

        {/* Rover Battery */}
        <div className="col-span-1 bg-surface-container-lowest rounded-lg p-md card-shadow border border-surface-variant flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Rover Bat.
              </span>
              <span className="material-symbols-outlined text-primary">battery_charging_80</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                {rover?.battery ?? 88}<span className="text-body-sm">%</span>
              </span>
            </div>
          </div>
          <div className="mt-md w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${rover?.battery || 88}%` }}></div>
          </div>
        </div>
      </div>


      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Field Health Map */}
        <div className="lg:col-span-2">
          <FieldHealthMap mode="dashboard" />
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-1 flex flex-col gap-md">
          <div className="bg-surface-container-lowest rounded-lg card-shadow border border-surface-variant overflow-hidden flex-1 flex flex-col">
            <div className="p-md border-b border-surface-variant bg-surface-bright flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant">playlist_add_check</span>
                Next Actions
              </h3>
              <button className="text-primary p-1 hover:bg-primary/10 rounded">
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            </div>
            <ul className="divide-y divide-surface-variant flex-1">
              {actions.map((item) => (
                <li
                  key={item.id}
                  onClick={() => toggleAction(item.id)}
                  className="p-md flex items-start gap-sm hover:bg-surface-bright transition-colors cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded border-outline text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className={`font-body-md text-body-md font-medium group-hover:text-primary transition-colors ${item.done ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                      {item.text}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-sm bg-surface-bright border-t border-surface-variant text-center">
              <button 
                onClick={() => navigate('/crop-health')}
                className="text-primary font-label-md text-label-md hover:underline"
              >
                View All Tasks ({soilInfo.status})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent AI Detections */}
      <div className="bg-surface-container-lowest rounded-lg card-shadow border border-surface-variant overflow-hidden">
        <div className="p-md border-b border-surface-variant bg-surface-bright flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">visibility</span>
            Recent AI Detections
          </h3>
          <span className="px-sm py-1 bg-surface-variant rounded-full text-on-surface-variant font-label-md text-[10px]">
            Live Queue
          </span>
        </div>

        <div className="p-md">
          <div className="flex flex-col md:flex-row gap-md p-sm border border-surface-variant rounded-lg hover:border-primary/50 transition-colors bg-surface-bright/50">
            <div className="w-full md:w-36 h-32 md:h-auto shrink-0 relative rounded bg-surface-container overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCco9HbbANzJN3DtdcWOIs7Vgsnn8ANOjevqCe1CZyqdUfJ-ievG2YDBbOKLAOITL4BUcw_2G3KvZF90Y2KtZrJpqH4pi96xZiU8yT4nahsGUnVcmGdAzuBTj7Z-y3-naUQ9T74M2OLih4CSY-A-A7sYdhNT3takIIBBIGm7PlRIcaaDUcEklOBJx6YIJ-kudtn4rmWZjm0HkewvU7jSXFLS2tHT6UWUR45Vyny0LGy--oeKtijmbal"
                alt="Leaf scan"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 m-2 border-2 border-secondary/80 bg-secondary/10 rounded-sm"></div>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-xs">
              <div>
                <div className="flex justify-between items-start mb-xs">
                  <h4 className="font-headline-sm text-[18px] font-semibold text-on-surface">
                    Tomato — Leaf Mold (AI Detection)
                  </h4>
                  <span className="px-sm py-0.5 rounded-full badge-warning font-label-md text-[10px] uppercase font-bold">
                    LOW CONFIDENCE
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-md gap-y-xs font-body-sm text-body-sm text-on-surface-variant mb-sm">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">location_on</span> North Field, Row 4
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">schedule</span> 12m ago
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">radar</span> Rover-Alpha
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm pt-sm border-t border-surface-variant border-dashed">
                <div className="flex items-center gap-sm">
                  <span className="px-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-[11px] flex items-center gap-xs font-semibold">
                    <span className="material-symbols-outlined text-amber-600 text-[14px]">warning</span>
                    40.71% Confidence — Verification Recommended
                  </span>
                </div>

                <button
                  onClick={() => navigate('/validation')}
                  className="px-md py-1.5 rounded bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-md text-label-md"
                >
                  View Validation Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
