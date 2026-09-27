import React from 'react';

export function PrototypeCameraView({ lastCapturedImage }) {
  const defaultImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCUC6pXjGuVK7ok0QQeOfzT0mNyqNYWetRy_Mhd12Ry6pDE9-ClAkpcFklam0Ftft1D-aa_lEAj5mPOEYu91zqTA0TqC5lnWWMfC-B0xJ5vvMxYHZFo4_BPsJsDvpLJhsGCDDkPnJklpsWQfMG52-rxEfUdggkhwZCnRpJs9XSvty5lvY78DgIB3DWzTH7ZQQNV560qpsCcfX4IV6FvMWTIQNwUZadfdaLpHH1yegXQvjA5KButhWVR";

  return (
    <div className="relative w-full aspect-video bg-black crosshair overflow-hidden group">
      <img
        src={lastCapturedImage || defaultImage}
        alt="Rover Prototype Feed"
        className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
      />

      {/* Bounding Box Overlays */}
      <div className="absolute top-[30%] left-[40%] w-[15%] h-[20%] border-2 border-primary rounded-sm bg-primary/10 transition-all duration-300">
        <span className="absolute -top-6 left-0 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow-xs">
          Healthy Leaf 98%
        </span>
      </div>

      <div className="absolute top-[50%] left-[20%] w-[14%] h-[22%] border-2 border-error rounded-sm bg-error/10 transition-all duration-300">
        <span className="absolute -top-6 left-0 bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow-xs">
          Suspected Blight 82%
        </span>
      </div>

      {/* HUD Details */}
      <div className="absolute bottom-3 left-4 text-white font-mono text-xs opacity-80 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded border border-white/10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>CAM-OPTICS-1 | 1080p 60FPS | SIMULATION MODE</span>
      </div>
    </div>
  );
}
