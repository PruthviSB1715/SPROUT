import React, { useState } from 'react';
import { FeedModeToggle } from './FeedModeToggle';
import { PrototypeCameraView } from './PrototypeCameraView';
import { HardwareCameraFeed } from './HardwareCameraFeed';

export function LiveFeedPanel({ lastCapturedImage }) {
  // Default to 'prototype' for reliable presentation demo stability
  const [feedMode, setFeedMode] = useState('prototype');

  return (
    <div className="bg-surface rounded-xl card-shadow overflow-hidden border border-surface-container-highest relative flex flex-col">
      {/* Card Header with Integrated Segmented Switch */}
      <div className="p-md border-b border-surface-container-highest flex flex-wrap justify-between items-center gap-sm bg-surface-container-lowest z-10">
        <div className="flex items-center gap-md">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">videocam</span>
            <span>Main Optics Feed</span>
          </h3>

          <span className={`px-2.5 py-0.5 rounded-full font-label-md text-[11px] font-bold flex items-center gap-xs border transition-colors ${
            feedMode === 'prototype'
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${feedMode === 'prototype' ? 'bg-primary animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span>{feedMode === 'prototype' ? 'PROTOTYPE VIEW' : 'LIVE ROVER STREAM'}</span>
          </span>
        </div>

        {/* Segmented Mode Switch */}
        <FeedModeToggle mode={feedMode} onModeChange={setFeedMode} />
      </div>

      {/* Camera Viewport Area */}
      <div className="w-full">
        {feedMode === 'prototype' ? (
          <PrototypeCameraView lastCapturedImage={lastCapturedImage} />
        ) : (
          <HardwareCameraFeed />
        )}
      </div>
    </div>
  );
}
