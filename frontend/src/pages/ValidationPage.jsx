import React, { useState, useEffect } from 'react';
import { getValidationQueue, submitValidation } from '../api/validationApi';
import { useAuth } from '../context/AuthContext';

export function ValidationPage() {
  const { user } = useAuth();
  
  const [queue, setQueue] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [decision, setDecision] = useState('CONFIRMED');
  const [intervention, setIntervention] = useState('Immediate targeted organic fungicide application');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    const data = await getValidationQueue();
    setQueue(data);
    if (data.length > 0 && !selectedCase) {
      setSelectedCase(data[0]);
    }
  };

  const handleSelectCase = (item) => {
    setSelectedCase(item);
    setDecision(item.expertDecision || 'CONFIRMED');
    setIntervention(item.intervention || 'Immediate targeted organic fungicide application');
    setNotes(item.expertNotes || '');
    setSuccessMsg(null);
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    setSubmitting(true);
    try {
      const updated = await submitValidation(selectedCase.id, {
        decision,
        intervention,
        notes,
        adhikariName: user?.name || 'Dr. Vikram Sharma',
      });
      
      setSuccessMsg(`Case ${selectedCase.id} successfully updated to ${updated.status}.`);
      await fetchQueue();
      setSelectedCase(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = queue.filter(item => item.status === 'PENDING_REVIEW' || item.status === 'REQUIRES_FIELD_VERIFICATION').length;

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
        <div>
          <div className="flex items-center gap-sm">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Validation Center</h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md text-xs font-bold border border-primary/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified</span>
              Krishi Adhikari Portal
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Expert review queue for validating AI crop health detections before farmer dispatch.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-md rounded-lg bg-primary-container text-on-primary-container font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="font-bold underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Left Column: Validation Queue */}
        <div className="lg:col-span-4 flex flex-col gap-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-xs p-md flex flex-col border border-outline-variant">
            <div className="flex justify-between items-center mb-md pb-sm border-b border-surface-variant">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center">
                <span className="material-symbols-outlined mr-sm text-error">priority_high</span>
                Priority Queue
              </h3>
              <span className="bg-error-container text-on-error-container font-label-md text-label-md px-sm py-xs rounded-full font-bold">
                {pendingCount} Pending
              </span>
            </div>

            <div className="space-y-sm max-h-[600px] overflow-y-auto pr-xs">
              {queue.map((item) => {
                const isSelected = selectedCase?.id === item.id;
                const isValidated = item.status === 'VALIDATED';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCase(item)}
                    className={`p-md rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-surface-container border-primary shadow-xs border-l-4 border-l-primary'
                        : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-variant'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-xs">
                      <div>
                        <span className="font-label-md text-label-md text-on-surface-variant font-mono">
                          {item.id}
                        </span>
                        <h4 className="font-body-md text-body-md font-bold text-on-surface mt-xs">
                          {item.crop} — {item.disease}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-label-md text-[10px] font-bold uppercase ${
                        isValidated
                          ? 'bg-primary/10 text-primary'
                          : item.riskLevel === 'Critical'
                          ? 'bg-error/10 text-error'
                          : 'bg-amber-500/10 text-amber-700'
                      }`}>
                        {isValidated ? 'VALIDATED' : item.riskLevel}
                      </span>
                    </div>

                    <div className="flex items-center text-on-surface-variant font-body-sm text-[12px] gap-md mt-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">psychology</span> {(item.aiConfidence * 100).toFixed(1)}% AI
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Analysis & Expert Action */}
        {selectedCase ? (
          <div className="lg:col-span-8 flex flex-col gap-lg">
            <div className="bg-surface-container-lowest rounded-xl shadow-xs p-md border border-outline-variant">
              <div className="flex justify-between items-center mb-md pb-xs border-b border-outline-variant">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center">
                  <span className="material-symbols-outlined mr-sm text-primary">biotech</span>
                  AI Evidence Analysis
                </h3>
                <span className="font-mono text-xs bg-surface-variant text-on-surface-variant px-2.5 py-1 rounded font-bold">
                  {selectedCase.id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {/* Evidence Image */}
                <div className="relative rounded-lg overflow-hidden h-60 border border-outline-variant bg-surface-container">
                  <img
                    src={selectedCase.image}
                    alt={selectedCase.disease}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur text-on-surface font-label-md text-xs px-2.5 py-1 rounded shadow-xs border border-outline-variant font-bold">
                    AI Confidence: {(selectedCase.aiConfidence * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Contextual Indicators */}
                <div className="flex flex-col gap-sm">
                  <div className="bg-surface-container-low p-sm rounded-lg">
                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-xs uppercase text-[10px] tracking-wider">
                      Neural Model Detections
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface font-bold">
                      {selectedCase.crop} — {selectedCase.disease}
                    </p>
                  </div>

                  <div className="bg-surface-container-low p-sm rounded-lg flex-1">
                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-xs uppercase text-[10px] tracking-wider">
                      Key Field Indicators Detected
                    </h4>
                    <ul className="font-body-sm text-body-sm text-on-surface space-y-xs">
                      {selectedCase.indicators.map((ind, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs">
                          <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                          {ind}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental & Historical Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="bg-surface-container-lowest rounded-xl shadow-xs p-md border border-outline-variant">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center mb-sm">
                  <span className="material-symbols-outlined mr-sm text-secondary">thermostat</span>
                  Microclimate Context
                </h3>
                <div className="grid grid-cols-2 gap-sm">
                  <div className="bg-surface-container-low p-sm rounded-lg">
                    <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Air Temp</span>
                    <p className="font-headline-md text-headline-md text-on-surface mt-xs">
                      {selectedCase.sensors?.temperature || 31.4}°C
                    </p>
                  </div>
                  <div className="bg-surface-container-low p-sm rounded-lg">
                    <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Humidity</span>
                    <p className="font-headline-md text-headline-md text-on-surface mt-xs">
                      {selectedCase.sensors?.humidity || 63}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl shadow-xs p-md border border-outline-variant">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center mb-sm">
                  <span className="material-symbols-outlined mr-sm text-tertiary">history</span>
                  Historical Record
                </h3>
                <div className="space-y-xs text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-surface-variant">
                    <span>Sector previous cases</span>
                    <span className="font-bold">2 Cases</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>District Alert Level</span>
                    <span className="font-bold text-amber-600">Moderate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Determination Form */}
            <div className="bg-surface-bright rounded-xl shadow-overlay p-md border border-primary/20">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center mb-md border-b border-surface-variant pb-sm">
                <span className="material-symbols-outlined mr-sm text-primary">fact_check</span>
                Krishi Adhikari Expert Determination
              </h3>

              <form onSubmit={handleSubmitDecision} className="space-y-md">
                {/* Decision Radio */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-sm">
                    Validation Decision
                  </label>
                  <div className="flex flex-wrap gap-sm">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="decision"
                        value="CONFIRMED"
                        checked={decision === 'CONFIRMED'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="sr-only peer"
                      />
                      <div className="px-md py-sm rounded-lg border border-outline-variant peer-checked:bg-primary-container peer-checked:border-primary peer-checked:text-on-primary-container font-body-sm text-body-sm font-bold transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">verified</span> Confirm AI Diagnosis
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="decision"
                        value="INCONCLUSIVE"
                        checked={decision === 'INCONCLUSIVE'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="sr-only peer"
                      />
                      <div className="px-md py-sm rounded-lg border border-outline-variant peer-checked:bg-surface-variant peer-checked:border-outline peer-checked:text-on-surface font-body-sm text-body-sm font-bold transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">help</span> Inconclusive / Rescan
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="decision"
                        value="REJECTED"
                        checked={decision === 'REJECTED'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="sr-only peer"
                      />
                      <div className="px-md py-sm rounded-lg border border-outline-variant peer-checked:bg-error-container peer-checked:border-error peer-checked:text-on-error-container font-body-sm text-body-sm font-bold transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">cancel</span> Reject (False Positive)
                      </div>
                    </label>
                  </div>
                </div>

                {/* Intervention Dropdown */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs" htmlFor="intervention">
                    Recommended Expert Intervention
                  </label>
                  <select
                    id="intervention"
                    value={intervention}
                    onChange={(e) => setIntervention(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm text-on-surface focus:border-primary outline-none"
                  >
                    <option value="Immediate targeted organic fungicide application">Immediate targeted organic fungicide application</option>
                    <option value="Schedule high-resolution rover camera rescan in 24h">Schedule high-resolution rover camera rescan in 24h</option>
                    <option value="Adjust irrigation schedule (reduce canopy moisture)">Adjust irrigation schedule (reduce canopy moisture)</option>
                    <option value="Quarantine sector row for physical inspection">Quarantine sector row for physical inspection</option>
                    <option value="No chemical intervention required — monitor progression">No chemical intervention required — monitor progression</option>
                  </select>
                </div>

                {/* Expert Remarks */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs" htmlFor="notes">
                    Expert Remarks & Agronomist Instructions
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Detail specific observations and advisory instructions for the farmer..."
                    className="w-full bg-surface border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm text-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="flex justify-end pt-sm border-t border-surface-variant">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-lg py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold shadow-xs hover:bg-primary-container transition-all flex items-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    {submitting ? 'Submitting...' : 'Submit Expert Validation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center p-xl text-on-surface-variant">
            Select a case from the priority queue to review evidence.
          </div>
        )}
      </div>
    </div>
  );
}
