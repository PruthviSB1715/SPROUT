import React, { useState, useEffect } from 'react';
import { generateReport } from '../api/reportApi';
import { useSensors } from '../context/SensorContext';
import { SensorStatusBadge } from '../components/common/SensorStatusBadge';

export function ReportsPage() {
  const { sensors, connectionStatus } = useSensors();

  const [language, setLanguage] = useState('en'); // 'en' or 'hi'
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    const data = await generateReport({
      crop: 'Tomato',
      disease: 'Early Blight',
      confidence: 0.68,
      temperature: sensors?.temperature || 31.4,
      humidity: sensors?.humidity || 63.0,
      soil_moisture: sensors?.soil_moisture ?? sensors?.soilMoisture ?? 40.5
    });
    setReportData(data);
    setLoading(false);
  };

  const report = reportData?.report;

  return (
    <div className="space-y-lg max-w-5xl mx-auto">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-md">
        <div>
          <div className="flex items-center gap-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Farmer AI Advisory Reports
            </h1>
            <SensorStatusBadge source={sensors?.source} status={connectionStatus} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">

            Comprehensive field reports generated from neural image analysis and microclimate telemetry.
          </p>
        </div>

        <div className="flex items-center gap-sm">
          {/* Language Switcher */}
          <div className="flex p-1 bg-surface-container-low rounded-lg border border-outline-variant text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded transition-all ${
                language === 'en'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 rounded transition-all ${
                language === 'hi'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-md py-2 rounded bg-surface border border-outline text-on-surface hover:bg-surface-variant transition-colors font-label-md text-xs flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-sm">print</span> Print Report
          </button>
        </div>
      </div>

      {/* Ollama Offline LLM Status Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant p-sm rounded-lg flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">memory</span>
          <span className="font-bold text-on-surface">Local AI Report Engine (Ollama):</span>
          <span className="text-on-surface-variant">{reportData?.ollama_status || 'LOCAL REPORT GENERATOR ACTIVE'}</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-mono text-[10px]">
          OFFLINE READY
        </span>
      </div>

      {/* Main Report Viewer Card */}
      {loading ? (
        <div className="p-xl text-center bg-surface-container-lowest rounded-xl border border-surface-variant text-on-surface-variant">
          Generating localized advisory report...
        </div>
      ) : report ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-overlay border border-outline-variant overflow-hidden p-container-margin md:p-xl space-y-lg">
          {/* Report Title & Metadata Header */}
          <div className="border-b border-surface-variant pb-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
            <div>
              <span className="text-xs font-mono uppercase text-on-surface-variant">
                Report ID: REP-{new Date().toISOString().slice(0, 10)}
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-xs">
                {language === 'hi' ? report.hindi.title : report.english.title}
              </h2>
            </div>
            <div className="flex items-center gap-sm">
              <span className="px-3 py-1 rounded-full badge-warning text-xs font-bold uppercase">
                {language === 'hi' ? report.hindi.risk_level : report.english.risk_level}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                Validation: Pending Adhikari
              </span>
            </div>
          </div>

          {/* Environmental Snapshot Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-md bg-surface-bright p-md rounded-lg border border-surface-variant">
            <div>
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Target Crop</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-xs">{report.crop}</p>
            </div>
            <div>
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">AI Diagnosis</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-xs">{report.disease}</p>
            </div>
            <div>
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Model Confidence</span>
              <p className="font-headline-sm text-headline-sm text-primary mt-xs">{report.confidence}</p>
            </div>
            <div>
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Soil Moisture</span>
              <p className="font-headline-sm text-headline-sm text-blue-600 mt-xs">{report.environmental_context.soil_moisture}</p>
            </div>
          </div>

          {/* Report Body & Recommendation */}
          <div className="space-y-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">assessment</span>
              {language === 'hi' ? 'एआई मूल्यांकन एवं विश्लेषण' : 'AI Assessment & Field Analysis'}
            </h3>

            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-base">
              {language === 'hi' ? report.hindi.assessment : report.english.assessment}
            </p>

            {/* Action Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-lg relative overflow-hidden mt-md">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
              <h4 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider mb-sm pl-xs">
                {language === 'hi' ? 'किसान के लिए अनुशंसित कार्य' : 'Recommended Farmer Actions'}
              </h4>
              <p className="font-body-md text-body-md text-on-surface pl-xs leading-relaxed font-medium">
                {language === 'hi' ? report.hindi.recommendation : report.english.recommendation}
              </p>
            </div>
          </div>

          {/* Microclimate Telemetry Grid */}
          <div className="border-t border-surface-variant pt-md">
            <h4 className="font-label-md text-xs text-on-surface-variant uppercase font-bold mb-sm">
              Associated Sensor Conditions at Scan Time
            </h4>
            <div className="flex flex-wrap gap-md text-xs text-on-surface font-mono">
              <div className="bg-surface-container px-3 py-1.5 rounded">
                Temperature: <span className="font-bold">{report.environmental_context.temperature}</span>
              </div>
              <div className="bg-surface-container px-3 py-1.5 rounded">
                Humidity: <span className="font-bold">{report.environmental_context.humidity}</span>
              </div>
              <div className="bg-surface-container px-3 py-1.5 rounded">
                Soil Moisture: <span className="font-bold">{report.environmental_context.soil_moisture}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
