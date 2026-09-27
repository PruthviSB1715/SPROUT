import React from 'react';

export function SimulationBanner({ isSimulated = true }) {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-gutter py-1.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-600 text-sm">science</span>
        <span className="font-semibold uppercase tracking-wider text-[11px]">
          {isSimulated ? 'SIMULATION MODE ACTIVE' : 'REAL HARDWARE CONNECTED'}
        </span>
        <span className="text-amber-700/70 hidden sm:inline">
          {isSimulated 
            ? '— Backend simulator providing active sensor readings & rover telemetry'
            : '— Connected to physical Smart Farm Rover telemetry telemetry unit'}
        </span>
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px]">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <span>GPS: SIMULATED</span>
      </div>
    </div>
  );
}
