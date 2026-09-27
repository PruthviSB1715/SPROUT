import React from 'react';
import { FieldHealthMap } from '../components/common/FieldHealthMap';

export function FieldMapPage() {
  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm mb-sm">
        <div>
          <div className="flex items-center gap-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Interactive Field Map</h1>
            <span className="bg-amber-500/10 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border border-amber-500/30">
              SIMULATED LOCATION
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Precision GIS layout displaying rover scan paths, crop sectors, draggable zones, and early disease hotspots.
          </p>
        </div>

        <div className="flex gap-sm font-label-md text-xs">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 font-bold flex items-center gap-1 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Sector 1-3: Healthy (98%)
          </span>
          <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-700 font-bold flex items-center gap-1 border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-600"></span> Sector 4B: Fungal Risk
          </span>
        </div>
      </div>

      {/* Main Map Container */}
      <FieldHealthMap mode="full" />
    </div>
  );
}

