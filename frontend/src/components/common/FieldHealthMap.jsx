import React, { useState, useRef, useEffect } from 'react';

const DEFAULT_ZONES = [
  {
    id: 'zone-a',
    name: 'Zone A',
    statusText: 'Optimal (94%)',
    statusType: 'healthy', // healthy, inspection, risk
    strokeColor: '#187937',
    fillColor: 'rgba(24, 121, 55, 0.42)',
    badgeBorder: '#187937',
    badgeTextColor: '#187937',
    points: [
      { x: 345, y: 230 },
      { x: 425, y: 290 },
      { x: 150, y: 510 },
      { x: 75, y: 440 }
    ],
    badgePos: { x: 270, y: 205 },
    reticle: { x: 255, y: 360, coords: '390, 380' },
    crop: 'Roma Tomatoes',
    hectares: '4.2 Ha',
    moisture: '68%',
    riskLevel: 'Low (2%)'
  },
  {
    id: 'zone-b',
    name: 'Zone B',
    statusText: '• Under Survey',
    statusType: 'inspection',
    strokeColor: '#8c4b27',
    fillColor: 'rgba(140, 75, 39, 0.18)',
    badgeBorder: '#e2e8f0',
    badgeTextColor: '#475569',
    points: [
      { x: 630, y: 200 },
      { x: 835, y: 195 },
      { x: 765, y: 330 },
      { x: 620, y: 430 },
      { x: 460, y: 330 }
    ],
    badgePos: { x: 630, y: 165 },
    crop: 'Cherry Tomatoes',
    hectares: '3.8 Ha',
    moisture: '52%',
    riskLevel: 'Medium (18%)'
  },
  {
    id: 'sector-4b',
    name: 'Sector 4B',
    statusText: 'Fungal Risk',
    statusType: 'risk',
    strokeColor: '#dc2626',
    fillColor: 'rgba(220, 38, 38, 0.25)',
    badgeBorder: '#dc2626',
    badgeTextColor: '#dc2626',
    points: [
      { x: 762, y: 270 },
      { x: 975, y: 270 },
      { x: 770, y: 515 },
      { x: 630, y: 435 }
    ],
    badgePos: { x: 550, y: 505 },
    crop: 'Beefsteak Tomatoes',
    hectares: '4.5 Ha',
    moisture: '81%',
    riskLevel: 'High (64%)'
  }
];

const STORAGE_KEY = 'smart_farm_field_map_zones';

const getStoredZones = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved zones:', e);
  }
  return DEFAULT_ZONES;
};

export function FieldHealthMap({ mode = 'full' }) {
  const [zones, setZones] = useState(getStoredZones);
  const [isEditing, setIsEditing] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeModalZone, setActiveModalZone] = useState(null);

  // Sync zones if saved in another tab or page
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e || e.key === STORAGE_KEY || e.key === null) {
        setZones(getStoredZones());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Drag state
  const svgRef = useRef(null);
  const [dragState, setDragState] = useState(null); // { type: 'point'|'badge', zoneId, pointIndex }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setZones(JSON.parse(JSON.stringify(DEFAULT_ZONES)));
    window.dispatchEvent(new Event('storage'));
    showToast('Reset map layout to default boundaries.');
  };

  const handleSaveChanges = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
      window.dispatchEvent(new Event('storage'));
      showToast('Map layout and zone boundaries saved successfully!');
    } catch (e) {
      console.error('Failed to save zones:', e);
      showToast('Failed to save zone changes.');
    }
  };

  const handleAddZone = () => {
    const newId = `zone-${Date.now()}`;
    const newZone = {
      id: newId,
      name: `Zone ${String.fromCharCode(67 + zones.length - 3)}`,
      statusText: 'Optimal (90%)',
      statusType: 'healthy',
      strokeColor: '#10b981',
      fillColor: 'rgba(16, 185, 129, 0.35)',
      badgeBorder: '#10b981',
      badgeTextColor: '#10b981',
      points: [
        { x: 400, y: 350 },
        { x: 550, y: 350 },
        { x: 500, y: 480 },
        { x: 350, y: 450 }
      ],
      badgePos: { x: 420, y: 320 },
      crop: 'Bell Peppers',
      hectares: '2.5 Ha',
      moisture: '65%',
      riskLevel: 'Low (4%)'
    };
    setZones([...zones, newZone]);
    showToast(`Added ${newZone.name} to field grid.`);
  };

  // Drag logic
  const getSvgCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * 1000;
    const y = ((clientY - rect.top) / rect.height) * 600;
    return { x: Math.max(10, Math.min(990, x)), y: Math.max(10, Math.min(590, y)) };
  };

  const handleMouseDownPoint = (e, zoneId, pointIndex) => {
    e.stopPropagation();
    if (!isEditing) return;
    setDragState({ type: 'point', zoneId, pointIndex });
  };

  const handleMouseDownBadge = (e, zoneId) => {
    e.stopPropagation();
    if (!isEditing) return;
    const coords = getSvgCoords(e);
    const zone = zones.find((z) => z.id === zoneId);
    setDragState({
      type: 'badge',
      zoneId,
      offsetX: coords.x - zone.badgePos.x,
      offsetY: coords.y - zone.badgePos.y
    });
  };

  const handleMouseMove = (e) => {
    if (!dragState) return;
    const coords = getSvgCoords(e);

    setZones((prevZones) =>
      prevZones.map((zone) => {
        if (zone.id !== dragState.zoneId) return zone;

        if (dragState.type === 'point') {
          const newPoints = [...zone.points];
          newPoints[dragState.pointIndex] = { x: Math.round(coords.x), y: Math.round(coords.y) };
          return { ...zone, points: newPoints };
        } else if (dragState.type === 'badge') {
          return {
            ...zone,
            badgePos: {
              x: Math.round(coords.x - dragState.offsetX),
              y: Math.round(coords.y - dragState.offsetY)
            }
          };
        }
        return zone;
      })
    );
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  useEffect(() => {
    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragState]);

  return (
    <div className="bg-[#f6f8f3] rounded-2xl border border-[#e2e8db] shadow-card overflow-hidden flex flex-col font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 right-6 z-50 bg-slate-900/90 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in backdrop-blur-md border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
          {toastMessage}
        </div>
      )}

      {/* Header Container */}
      <div className="p-4 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f6f8f3] border-b border-[#e2e8db]">
        {/* Left Title & Draggable Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[#1e2922]">
            {/* Map Icon matching design */}
            <svg className="w-6 h-6 text-[#1e2922]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-6-3V4l6 3m0 13l6-3m-6 3V7m6 13l6-3V4l-6 3m0 13V7m0 0L9 4" />
            </svg>
            <h2 className="font-bold text-xl md:text-2xl text-[#1e2922] tracking-tight">Field Health Map</h2>
          </div>

          <span className="bg-[#dce7d5] text-[#2c4e2e] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-[#c3d6b8] shadow-xs">
            <svg className="w-4 h-4 text-[#2c4e2e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m3-5.5V11m0-5.5a1.5 1.5 0 013 0V11" />
            </svg>
            Draggable Elements
          </span>
        </div>

        {/* Right Health Legends */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]"></span>
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#854d0e]"></span>
            <span>Needs Inspection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
            <span>At-Risk</span>
          </div>
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className={`relative w-full ${mode === 'dashboard' ? 'h-[360px] md:h-[420px]' : 'h-[460px] md:h-[560px]'} bg-slate-900 overflow-hidden`}>
        {/* Satellite Background */}
        <img
          src="/satellite_field_bg.png"
          alt="Satellite Field View"
          className="absolute inset-0 w-full h-full object-cover opacity-90 contrast-[1.08] brightness-[0.92]"
        />

        {/* Floating Action Toolbar */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-white/60 flex items-center gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`${
              isEditing ? 'bg-[#c5221f] text-white hover:bg-[#b01e1b]' : 'bg-slate-800 text-white hover:bg-slate-700'
            } px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer`}
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            {isEditing ? 'Exit Editing' : 'Edit Layout'}
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-0.5"></span>

          <button
            onClick={handleAddZone}
            className="text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-slate-100/70 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_box</span>
            Add Zone
          </button>

          <button
            onClick={handleReset}
            className="text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-slate-100/70 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            Reset
          </button>

          <button
            onClick={handleSaveChanges}
            className="bg-[#dce7d5] text-[#1b642e] border border-[#1b642e]/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#d2e2c8] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Save Changes
          </button>
        </div>

        {/* SVG Interactive Overlay */}
        <svg
          ref={svgRef}
          viewBox="0 0 1000 600"
          className="absolute inset-0 w-full h-full z-10 touch-none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Corner Heat Gradient for Sector 4B */}
            <radialGradient id="fungalGlowTop" cx="20%" cy="20%" r="40%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.6)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>
            <radialGradient id="fungalGlowBottom" cx="80%" cy="80%" r="40%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.6)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>
            {/* Heat Gradient for Zone B */}
            <radialGradient id="surveyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(217, 119, 6, 0.35)" />
              <stop offset="100%" stopColor="rgba(217, 119, 6, 0)" />
            </radialGradient>
          </defs>

          {/* Render Zones */}
          {zones.map((zone) => {
            const pointsString = zone.points.map((p) => `${p.x},${p.y}`).join(' ');
            const isSelected = selectedZone === zone.id;

            return (
              <g key={zone.id} className="group">
                {/* Main Polygon */}
                <polygon
                  points={pointsString}
                  fill={zone.fillColor}
                  stroke={zone.strokeColor}
                  strokeWidth={isSelected ? '3.5' : '2.5'}
                  className="transition-all cursor-pointer hover:opacity-90"
                  onClick={() => setSelectedZone(zone.id)}
                />

                {/* Heatmap overlay accents for specific zones */}
                {zone.id === 'sector-4b' && (
                  <>
                    <circle cx={zone.points[0].x} cy={zone.points[0].y} r="80" fill="url(#fungalGlowTop)" pointerEvents="none" />
                    <circle cx={zone.points[2].x} cy={zone.points[2].y} r="90" fill="url(#fungalGlowBottom)" pointerEvents="none" />
                  </>
                )}
                {zone.id === 'zone-b' && (
                  <circle cx="680" cy="290" r="90" fill="url(#surveyGlow)" pointerEvents="none" />
                )}

                {/* Target Crosshair Reticle for Zone A */}
                {zone.reticle && (
                  <g transform={`translate(${zone.reticle.x}, ${zone.reticle.y})`} pointerEvents="none">
                    {/* Concentric circles */}
                    <circle cx="0" cy="0" r="28" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3,3" />
                    <circle cx="0" cy="0" r="18" fill="none" stroke="#10b981" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="6" fill="#10b981" />
                    {/* Crosshair lines */}
                    <line x1="-34" y1="0" x2="-20" y2="0" stroke="#10b981" strokeWidth="1.8" />
                    <line x1="20" y1="0" x2="34" y2="0" stroke="#10b981" strokeWidth="1.8" />
                    <line x1="0" y1="-34" x2="0" y2="-20" stroke="#10b981" strokeWidth="1.8" />
                    <line x1="0" y1="20" x2="0" y2="34" stroke="#10b981" strokeWidth="1.8" />

                    {/* Corner Bracket Guides */}
                    <path d="M-110,-70 L-125,-70 L-125,-55" fill="none" stroke="rgba(16, 185, 129, 0.6)" strokeWidth="2" />
                    <path d="M110,-70 L125,-70 L125,-55" fill="none" stroke="rgba(16, 185, 129, 0.6)" strokeWidth="2" />

                    {/* Coordinate Tag */}
                    <g transform="translate(0, 36)">
                      <rect x="-32" y="-10" width="64" height="20" rx="4" fill="white" stroke="#94a3b8" strokeWidth="1" />
                      <text x="0" y="3" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        {zone.reticle.coords}
                      </text>
                    </g>
                  </g>
                )}

                {/* Vertex Drag Handle Circles */}
                {isEditing &&
                  zone.points.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="6.5"
                      fill="white"
                      stroke={zone.strokeColor}
                      strokeWidth="2.5"
                      className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                      onMouseDown={(e) => handleMouseDownPoint(e, zone.id, idx)}
                      onTouchStart={(e) => handleMouseDownPoint(e, zone.id, idx)}
                    />
                  ))}
              </g>
            );
          })}
        </svg>

        {/* HTML Draggable Floating Badges over Map */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {zones.map((zone) => {
            const isRisk = zone.statusType === 'risk';
            const isHealthy = zone.statusType === 'healthy';

            return (
              <div
                key={zone.id}
                style={{
                  left: `${(zone.badgePos.x / 1000) * 100}%`,
                  top: `${(zone.badgePos.y / 600) * 100}%`
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto bg-white/95 backdrop-blur-md shadow-lg rounded-full px-3.5 py-1.5 flex items-center gap-2 border-2 transition-shadow hover:shadow-xl ${
                  isRisk
                    ? 'border-[#dc2626]'
                    : isHealthy
                    ? 'border-[#187937]'
                    : 'border-slate-300'
                } ${isEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                onMouseDown={(e) => handleMouseDownBadge(e, zone.id)}
                onTouchStart={(e) => handleMouseDownBadge(e, zone.id)}
              >
                {/* 6-dot grip handle */}
                <div className="flex flex-col gap-0.5 opacity-40">
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                  </div>
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                  </div>
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                  </div>
                </div>

                {/* Status Indicator Icon / Dot */}
                {isRisk ? (
                  <svg className="w-4 h-4 text-[#dc2626]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : isHealthy ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#187937]"></span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#854d0e]"></span>
                )}

                {/* Zone Title */}
                <span className={`text-xs font-bold ${isRisk ? 'text-[#dc2626]' : 'text-slate-800'}`}>
                  {zone.name}
                </span>

                {/* Status Description */}
                <span className={`text-xs font-semibold ${isHealthy ? 'text-[#187937]' : 'text-slate-600'}`}>
                  {zone.statusText}
                </span>

                {/* Settings / Sliders Tune Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalZone(zone);
                  }}
                  className="ml-1 p-0.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  title="Configure Zone Parameters"
                >
                  <svg className={`w-4 h-4 ${isRisk ? 'text-[#dc2626]' : 'text-slate-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            );
          })}

          {/* Floating Rover Active Badge at Bottom Right */}
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md shadow-lg rounded-xl px-3.5 py-1.5 flex items-center gap-2 border border-slate-100 pointer-events-auto">
            {/* Grip handle */}
            <div className="flex flex-col gap-0.5 opacity-40">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
              </div>
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
              </div>
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
              </div>
            </div>

            {/* Target Reticle Green Icon */}
            <svg className="w-4 h-4 text-[#15803d]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" fill="#15803d" />
              <path strokeLinecap="round" d="M12 1v4m0 14v4M1 12h4m14 0h4" />
            </svg>

            <span className="text-xs font-bold text-slate-800">Rover Active</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
          </div>
        </div>
      </div>

      {/* Zone Inspector Modal */}
      {activeModalZone && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {activeModalZone.statusText}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{activeModalZone.name} Inspector</h3>
              </div>
              <button
                onClick={() => setActiveModalZone(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-500">Crop Cultivation:</span>
                <span className="font-semibold text-slate-800">{activeModalZone.crop}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-500">Coverage Area:</span>
                <span className="font-semibold text-slate-800">{activeModalZone.hectares}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-500">Soil Moisture Level:</span>
                <span className="font-semibold text-slate-800">{activeModalZone.moisture}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-500">AI Risk Assessment:</span>
                <span className={`font-bold ${activeModalZone.statusType === 'risk' ? 'text-red-600' : 'text-emerald-700'}`}>
                  {activeModalZone.riskLevel}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  showToast(`Dispatched Rover AI Scan to ${activeModalZone.name}`);
                  setActiveModalZone(null);
                }}
                className="flex-1 bg-[#187937] hover:bg-[#15672f] text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                Scan Zone with Rover
              </button>
              <button
                onClick={() => setActiveModalZone(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
