import React, { useState } from 'react';
import { useHealth } from '../../hooks/useHealth';

export function DevDebugPanel() {
  const health = useHealth(8000);
  const [expanded, setExpanded] = useState(false);

  // Render only in development mode
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-2 right-2 z-50 font-mono text-[11px]">
      <div className="bg-inverse-surface text-inverse-on-surface rounded-lg shadow-overlay border border-outline-variant/40 overflow-hidden">
        {/* Toggle Bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-3 py-1.5 flex items-center justify-between gap-3 bg-inverse-surface hover:bg-surface-container-highest/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${health.online ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="font-bold">
              DEV DEBUG: {health.online ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
            </span>
          </div>
          <span className="text-[10px] opacity-70">
            {expanded ? '▼ Hide' : '▲ Diagnostic Info'}
          </span>
        </button>

        {/* Expanded Diagnostics */}
        {expanded && (
          <div className="p-3 border-t border-outline/30 space-y-1.5 bg-black/60 backdrop-blur-md max-w-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Frontend URL:</span>
              <span className="text-white font-semibold">{health.frontendOrigin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Backend URL:</span>
              <span className="text-white font-semibold">{health.backendBaseUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Health Endpoint:</span>
              <span className="text-blue-300 truncate max-w-[200px]">{health.healthUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">HTTP Status:</span>
              <span className={`font-bold ${health.httpStatus === 200 ? 'text-green-400' : 'text-red-400'}`}>
                {health.httpStatus || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI Engine:</span>
              <span className={`font-bold ${health.aiEngineAvailable ? 'text-green-400' : 'text-amber-400'}`}>
                {health.aiEngineAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
              </span>
            </div>
            {health.error && (
              <div className="text-red-400 text-[10px] border-t border-red-500/30 pt-1 mt-1">
                Err: {health.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
