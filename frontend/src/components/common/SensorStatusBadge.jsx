import React from 'react';

/**
 * SensorStatusBadge Component
 * Subtle source badge displaying ● Live Rover, ● Demo Mode, or ● Connecting
 */
export function SensorStatusBadge({ source, status, className = '' }) {
  const isRover = source === 'rover' || status === 'LIVE' || status === 'live';
  const isConnecting = status === 'CONNECTING' || status === 'connecting';

  if (isConnecting) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
        <span>Connecting</span>
      </span>
    );
  }

  if (isRover) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Live Rover</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      <span>Demo Mode</span>
    </span>
  );
}
