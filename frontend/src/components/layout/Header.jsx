import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../hooks/useHealth';
import sproutLogo from '../../assets/branding/sprout-logo.png';
import sproutWordmark from '../../assets/branding/sprout-wordmark.png';

export function Header({ setMobileOpen }) {
  const { activeRole } = useAuth();
  const { connectionState, aiEngineAvailable } = useHealth(8000);

  return (
    <header className="flex justify-between items-center w-full px-gutter h-16 bg-surface dark:bg-surface-dim text-primary border-b border-outline-variant/40 shadow-xs z-10 shrink-0">
      {/* Left: Mobile Menu & Brand */}
      <div className="flex items-center gap-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-on-surface-variant hover:bg-surface-variant p-1.5 rounded transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden md:flex items-center gap-2">
          <img src={sproutLogo} alt="SPROUT Logo" className="w-8 h-8 object-contain" />
          <img src={sproutWordmark} alt="SPROUT" className="h-6 object-contain" />
          <span className="text-xs text-on-surface-variant font-medium ml-1 font-mono">| Smart Farm Rover AI</span>
        </div>
      </div>

      {/* Center: Mobile Brand */}
      <div className="flex md:hidden items-center gap-1.5">
        <img src={sproutLogo} alt="SPROUT Logo" className="w-7 h-7 object-contain" />
        <img src={sproutWordmark} alt="SPROUT" className="h-5 object-contain" />
      </div>

      {/* Right: System Connection Badges */}
      <div className="flex items-center gap-sm">
        {/* Active Role Pill */}
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-md text-[11px] font-semibold border border-primary/20">
          <span className="material-symbols-outlined text-[14px]">account_circle</span>
          {activeRole?.replace('_', ' ')}
        </span>

        {/* 3-State Backend Connection Indicator */}
        {connectionState === 'CHECKING' ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-md text-[11px] font-medium border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Checking...</span>
          </div>
        ) : connectionState === 'ONLINE' ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-md text-[11px] border border-primary/20 font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>● Backend Online</span>
            <span className="text-outline-variant">|</span>
            <span className={aiEngineAvailable ? 'text-primary' : 'text-amber-600 font-bold'}>
              {aiEngineAvailable ? '● AI Engine Ready' : '⚠ AI Engine Unavailable'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-[11px] font-bold border border-error/30">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            <span>● Backend Offline</span>
          </div>
        )}

        <button className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-full transition-colors relative">
          <span className="material-symbols-outlined">sensors</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <button className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-full transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
