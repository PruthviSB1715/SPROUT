import React from 'react';

export function FeedModeToggle({ mode, onModeChange }) {
  return (
    <div className="inline-flex items-center p-1 bg-surface-container-high rounded-lg border border-outline-variant/60 shadow-inner">
      <button
        type="button"
        onClick={() => onModeChange('prototype')}
        className={`px-3 py-1.5 rounded-md font-label-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
          mode === 'prototype'
            ? 'bg-primary text-on-primary shadow-xs'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
        }`}
        title="Show presentation optics with AI bounding box overlays"
      >
        <span className="material-symbols-outlined text-[16px]">monitor</span>
        <span>Prototype</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange('live')}
        className={`px-3 py-1.5 rounded-md font-label-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
          mode === 'live'
            ? 'bg-primary text-on-primary shadow-xs'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
        }`}
        title="Connect directly to ESP32-CAM hardware stream"
      >
        <span className="material-symbols-outlined text-[16px]">radio</span>
        <span>Live Rover</span>
      </button>
    </div>
  );
}
