import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ROVER_CONFIG } from '../../config/roverConfig';

export function HardwareCameraFeed() {
  const streamBaseUrl = ROVER_CONFIG.CAMERA_STREAM_URL;
  const [streamUrl, setStreamUrl] = useState(streamBaseUrl);
  const [status, setStatus] = useState('CONNECTING'); // 'CONNECTING' | 'LIVE' | 'OFFLINE'
  const [retryCount, setRetryCount] = useState(0);
  const retryTimerRef = useRef(null);

  const handleStreamLoad = () => {
    setStatus('LIVE');
  };

  const handleStreamError = useCallback(() => {
    setStatus('OFFLINE');
  }, []);

  const handleRetry = () => {
    setStatus('CONNECTING');
    // Force browser reload of MJPEG stream by appending cache-busting timestamp parameter
    const cacheBuster = `${streamBaseUrl}${streamBaseUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    setStreamUrl(cacheBuster);
    setRetryCount((prev) => prev + 1);
  };

  // Automatic cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-neutral-950 overflow-hidden flex items-center justify-center">
      {status !== 'OFFLINE' && (
        <img
          key={streamUrl}
          src={streamUrl}
          alt="ESP32-CAM Hardware Feed"
          onLoad={handleStreamLoad}
          onError={handleStreamError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            status === 'LIVE' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Connecting Loading Overlay */}
      {status === 'CONNECTING' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90 text-neutral-200 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-xs text-neutral-400">Connecting to camera at {streamBaseUrl}...</p>
        </div>
      )}

      {/* Live HUD Badge Overlay */}
      {status === 'LIVE' && (
        <>
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-md font-mono text-xs border border-white/10 flex items-center gap-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold tracking-wider text-emerald-400">LIVE CAMERA</span>
            <span className="text-neutral-400">| ESP32-CAM</span>
          </div>

          <div className="absolute bottom-3 left-3 text-neutral-300 font-mono text-[11px] opacity-80 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded border border-white/10">
            RAW HARDWARE FEED — {streamBaseUrl}
          </div>
        </>
      )}

      {/* Offline State */}
      {status === 'OFFLINE' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-neutral-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[28px]">videocam_off</span>
          </div>

          <h4 className="font-headline-sm text-lg font-bold text-neutral-100 mb-1">
            CAMERA OFFLINE
          </h4>

          <p className="font-body-sm text-xs text-neutral-400 max-w-sm mb-4">
            Rover camera is unavailable. Ensure your device is connected to <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-amber-300">Smart_Rover_AP</code> and ESP32-CAM is powered at <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">{streamBaseUrl}</code>.
          </p>

          <div className="flex items-center gap-2 mb-4 font-mono text-[11px] text-amber-400/90">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Check Wi-Fi AP & Power</span>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-on-primary font-label-md text-xs font-semibold rounded-lg shadow-xs hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Retry Connection {retryCount > 0 && `(${retryCount})`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
