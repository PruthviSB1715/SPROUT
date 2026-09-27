import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSensors } from '../context/SensorContext';
import { LiveFeedPanel } from '../components/rover/LiveFeedPanel';
import { SensorStatusBadge } from '../components/common/SensorStatusBadge';

export function LiveRoverPage() {
  const { sensors, history, rover, connectionStatus, isSimulated } = useSensors();
  const navigate = useNavigate();

  const [autoDrive, setAutoDrive] = useState(true);
  const [missionState, setMissionState] = useState('IN_PROGRESS'); // IN_PROGRESS, PAUSED, STOPPED
  const [lastCapturedImage, setLastCapturedImage] = useState(null);

  const tempHistory = (history && history.length > 0)
    ? history.slice(-7).map(h => h.temperature ?? 30)
    : [28, 29, 30, 31, 31.4, 31.2, sensors?.temperature || 31.4];

  const soilHistory = (history && history.length > 0)
    ? history.slice(-7).map(h => h.soilMoisture ?? 40)
    : [45, 43, 42, 41, 40.5, 40.5, sensors?.soil_moisture || 40.5];

  const humHistory = (history && history.length > 0)
    ? history.slice(-7).map(h => h.humidity ?? 60)
    : [60, 61, 62, 62.5, 63, 63, sensors?.humidity || 63];

  const handleCapture = () => {
    // Simulate camera capture
    setLastCapturedImage('https://lh3.googleusercontent.com/aida-public/AB6AXuCco9HbbANzJN3DtdcWOIs7Vgsnn8ANOjevqCe1CZyqdUfJ-ievG2YDBbOKLAOITL4BUcw_2G3KvZF90Y2KtZrJpqH4pi96xZiU8yT4nahsGUnVcmGdAzuBTj7Z-y3-naUQ9T74M2OLih4CSY-A-A7sYdhNT3takIIBBIGm7PlRIcaaDUcEklOBJx6YIJ-kudtn4rmWZjm0HkewvU7jSXFLS2tHT6UWUR45Vyny0LGy--oeKtijmbal');
  };

  return (
    <div className="space-y-lg">
      {/* Header section for Rover Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-md gap-md">
        <div>
          <div className="flex items-center gap-sm">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {rover?.rover_id || 'Rover R-Alpha'}
            </h2>
            <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-xs mt-xs">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> 
            {rover?.mode || 'Autonomous Inspection'} — Sector 4B
          </p>
        </div>

        <div className="flex flex-wrap gap-sm">
          <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-variant text-on-surface-variant font-label-md text-label-md border border-outline-variant">
            <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span> {rover?.signal_strength || 'Excellent'}
          </span>
          <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-variant text-on-surface-variant font-label-md text-label-md border border-outline-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">battery_full</span> {rover?.battery || 88}%
          </span>
          <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-variant text-on-surface-variant font-label-md text-label-md border border-outline-variant font-mono text-[11px]">
            <span className="material-symbols-outlined text-[16px]">my_location</span> Lat: 34.0522, Lng: -118.2437 (SIM)
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Left Column: Camera Optics & Mission Controls */}
        <div className="lg:col-span-8 flex flex-col gap-lg">
          {/* Live Camera Feed Panel with Prototype / Live Hardware Toggle */}
          <LiveFeedPanel lastCapturedImage={lastCapturedImage} />

          {/* Mission Progress & Manual D-Pad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Status & Action Buttons */}
            <div className="bg-surface rounded-xl card-shadow p-md border border-surface-container-highest flex flex-col gap-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface border-b border-surface-container-highest pb-sm">
                Mission Controls
              </h3>

              <div>
                <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-xs">
                  <span>Sector Inspection Progress</span>
                  <span>68% Complete</span>
                </div>
                <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[68%] transition-all duration-500"></div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm text-right">
                  Est. remaining time: 14 mins
                </p>
              </div>

              <div className="grid grid-cols-2 gap-sm mt-auto">
                <button 
                  onClick={() => setMissionState('IN_PROGRESS')}
                  className={`py-sm px-md rounded font-label-md flex items-center justify-center gap-xs transition-colors ${
                    missionState === 'IN_PROGRESS' 
                      ? 'bg-primary text-on-primary shadow-xs' 
                      : 'bg-surface border border-outline text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined">play_arrow</span> Resume
                </button>

                <button 
                  onClick={() => setMissionState('PAUSED')}
                  className={`py-sm px-md rounded font-label-md flex items-center justify-center gap-xs transition-colors ${
                    missionState === 'PAUSED' 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'bg-surface border border-outline text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined">pause</span> Pause
                </button>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <button 
                  onClick={handleCapture}
                  className="bg-surface border border-outline text-secondary py-sm px-md rounded font-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-xs"
                >
                  <span className="material-symbols-outlined">photo_camera</span> Capture Image
                </button>
                <button 
                  onClick={() => navigate('/ai-diagnostics')}
                  className="bg-primary-container text-on-primary-container py-sm px-md rounded font-label-md hover:bg-primary transition-colors flex items-center justify-center gap-xs font-bold"
                >
                  <span className="material-symbols-outlined">psychology</span> Run AI Diagnosis
                </button>
              </div>
            </div>

            {/* Manual Steering D-Pad */}
            <div className="bg-surface rounded-xl card-shadow p-md border border-surface-container-highest flex flex-col items-center justify-center">
              <div className="w-full flex justify-between items-center mb-md">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Manual Override</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDrive}
                    onChange={(e) => setAutoDrive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ms-2 font-label-md text-label-md text-on-surface-variant">
                    {autoDrive ? 'Auto Drive' : 'Manual'}
                  </span>
                </label>
              </div>

              <div className={`grid grid-cols-3 grid-rows-3 gap-xs w-44 h-44 transition-opacity ${autoDrive ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div className="col-start-2 flex justify-center items-end">
                  <button className="w-12 h-12 bg-surface-container-high rounded-t-lg hover:bg-surface-variant active:bg-surface-dim border border-outline-variant flex justify-center items-center">
                    <span className="material-symbols-outlined text-on-surface">arrow_upward</span>
                  </button>
                </div>
                <div className="col-start-1 row-start-2 flex justify-end items-center">
                  <button className="w-12 h-12 bg-surface-container-high rounded-l-lg hover:bg-surface-variant active:bg-surface-dim border border-outline-variant flex justify-center items-center">
                    <span className="material-symbols-outlined text-on-surface">arrow_back</span>
                  </button>
                </div>
                <div className="col-start-2 row-start-2 flex justify-center items-center">
                  <button className="w-12 h-12 bg-error-container text-on-error-container rounded-full hover:bg-error hover:text-on-error transition-colors flex justify-center items-center shadow-xs">
                    <span className="material-symbols-outlined">stop</span>
                  </button>
                </div>
                <div className="col-start-3 row-start-2 flex justify-start items-center">
                  <button className="w-12 h-12 bg-surface-container-high rounded-r-lg hover:bg-surface-variant active:bg-surface-dim border border-outline-variant flex justify-center items-center">
                    <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
                  </button>
                </div>
                <div className="col-start-2 row-start-3 flex justify-center items-start">
                  <button className="w-12 h-12 bg-surface-container-high rounded-b-lg hover:bg-surface-variant active:bg-surface-dim border border-outline-variant flex justify-center items-center">
                    <span className="material-symbols-outlined text-on-surface">arrow_downward</span>
                  </button>
                </div>
              </div>

              <p className="font-body-sm text-[11px] text-on-surface-variant mt-sm text-center">
                {autoDrive ? 'Toggle Auto off to engage steering controls.' : 'Manual steering active (Simulated).'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-lg">
          <div className="bg-surface rounded-xl card-shadow p-md border border-surface-container-highest">
            <div className="border-b border-surface-container-highest pb-sm mb-md flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary">show_chart</span> Live Sensor Telemetry
              </h3>
              <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
            </div>

            <div className="space-y-md">
              <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant">
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant">Air Temp</span>
                  <span className="font-headline-md text-headline-md text-on-surface">{sensors?.temperature ?? 31.4}°C</span>
                </div>
                <div className="h-10 w-full flex items-end gap-1 pt-2">
                  {tempHistory.map((v, i) => (
                    <div key={i} className="flex-1 bg-secondary/40 rounded-t" style={{ height: `${Math.min(100, Math.max(10, (v / 40) * 100))}%` }} title={`${v}°C`}></div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant">
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant">Soil Moisture</span>
                  <span className="font-headline-md text-headline-md text-on-surface">{sensors?.soil_moisture ?? sensors?.soilMoisture ?? 40.5}%</span>
                </div>
                <div className="h-10 w-full flex items-end gap-1 pt-2">
                  {soilHistory.map((v, i) => (
                    <div key={i} className="flex-1 bg-primary/40 rounded-t" style={{ height: `${Math.min(100, Math.max(10, (v / 100) * 100))}%` }} title={`${v}%`}></div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant">
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant">Relative Humidity</span>
                  <span className="font-headline-md text-headline-md text-on-surface">{sensors?.humidity ?? 63.0}%</span>
                </div>
                <div className="h-10 w-full flex items-end gap-1 pt-2">
                  {humHistory.map((v, i) => (
                    <div key={i} className="flex-1 bg-cyan-600/40 rounded-t" style={{ height: `${Math.min(100, Math.max(10, (v / 100) * 100))}%` }} title={`${v}%`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-bright rounded-xl card-shadow p-md border border-surface-container-highest">
            <h4 className="font-label-md text-label-md text-on-surface uppercase mb-sm">Field Agent Notes</h4>
            <div className="flex gap-sm items-start bg-surface-container p-sm rounded-lg">
              <span className="material-symbols-outlined text-primary mt-xs">check_circle</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Soil moisture optimal in current sector. Minor early leaf spot symptoms logged on Row 4. AI model evaluation requested.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



