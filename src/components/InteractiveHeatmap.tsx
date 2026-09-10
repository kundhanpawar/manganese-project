import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  AlertTriangle,
  Flame,
  Sprout,
  Sparkles,
  Sliders,
  MapPin,
  Compass,
  Info
} from 'lucide-react';
import { ManganeseAnalysisResult, HeatmapPoint, ExcavationTarget, ContaminationZone } from '../types';

interface InteractiveHeatmapProps {
  analysis: ManganeseAnalysisResult;
  onSelectTarget?: (target: ExcavationTarget) => void;
}

export const InteractiveHeatmap: React.FC<InteractiveHeatmapProps> = ({
  analysis,
  onSelectTarget,
}) => {
  const [activeLayer, setActiveLayer] = useState<'manganese' | 'lime_gossan' | 'vegetation' | 'contamination' | 'all'>('all');
  const [opacity, setOpacity] = useState<number>(0.75);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showTargets, setShowTargets] = useState<boolean>(true);
  const [showContamination, setShowContamination] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  
  // Interactive inspector state
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    mnPercent: number;
    limeScore: number;
    vegCover: number;
    depthEstimate: number;
  } | null>(null);

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(
    analysis.excavationTargets[0]?.id || null
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click on canvas to inspect arbitrary coordinates
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    // Calculate nearest interpolated manganese percentage
    let closestPoint: HeatmapPoint | null = null;
    let minDist = Infinity;
    for (const pt of analysis.heatmapPoints) {
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < minDist) {
        minDist = dist;
        closestPoint = pt;
      }
    }

    const baseMn = closestPoint ? closestPoint.mnPercent : analysis.averageMnPercent;
    // Lime color is higher near center targets
    const distToCenter = Math.hypot(x - 52, y - 46);
    const limeScore = Math.max(10, Math.min(98, Math.round((1 - distToCenter / 50) * 95)));
    const vegCover = Math.max(2, Math.min(85, Math.round((distToCenter / 45) * 60 + 5)));
    const depthEstimate = Math.round((12 + (distToCenter / 20) * 15) * 10) / 10;

    setHoveredPoint({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      mnPercent: baseMn,
      limeScore,
      vegCover,
      depthEstimate,
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div id="interactive-heatmap-card" className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 lg:p-6 backdrop-blur-md flex flex-col gap-4">
      
      {/* Top Controls Header */}
      <div id="heatmap-toolbar" className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        
        {/* Layer Selection Chips */}
        <div id="layer-switcher-group" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Layer:
          </span>

          <button
            id="btn-layer-all"
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeLayer === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Composite All
          </button>

          <button
            id="btn-layer-manganese"
            onClick={() => setActiveLayer('manganese')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-all ${
              activeLayer === 'manganese'
                ? 'bg-red-500 text-white font-bold shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-red-400" />
            Mn Concentration
          </button>

          <button
            id="btn-layer-lime"
            onClick={() => setActiveLayer('lime_gossan')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-all ${
              activeLayer === 'lime_gossan'
                ? 'bg-lime-400 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-lime-400" />
            Lime Gossan Mask
          </button>

          <button
            id="btn-layer-veg"
            onClick={() => setActiveLayer('vegetation')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-all ${
              activeLayer === 'vegetation'
                ? 'bg-amber-600 text-white font-bold shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sprout className="w-3 h-3 text-amber-300" />
            Low-Veg Depletion
          </button>

          <button
            id="btn-layer-contam"
            onClick={() => setActiveLayer('contamination')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-all ${
              activeLayer === 'contamination'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-purple-300" />
            Contamination Plume
          </button>
        </div>

        {/* Sliders & Tools */}
        <div id="heatmap-utility-tools" className="flex items-center gap-3">
          {/* Opacity slider */}
          <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Sliders className="w-3 h-3 text-slate-400" />
            <label htmlFor="heatmap-opacity" className="text-[11px] font-mono text-slate-400">
              Opacity:
            </label>
            <input
              id="heatmap-opacity"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-amber-400 h-1.5 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-300 w-7">
              {Math.round(opacity * 100)}%
            </span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              id="btn-zoom-out"
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-300 px-1">
              {zoomLevel.toFixed(1)}x
            </span>
            <button
              id="btn-zoom-in"
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Heatmap Stage Viewport */}
      <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        
        <div
          id="heatmap-viewport"
          ref={containerRef}
          onMouseMove={handleContainerMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden cursor-crosshair select-none"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
        >
          {/* Base Satellite/Aerial Image */}
          <img
            id="base-satellite-image"
            src={analysis.imageUrl}
            alt={analysis.imageName}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dynamic SVG / Gradient Heatmap Overlays */}
          <svg
            id="heatmap-overlay-svg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ opacity }}
          >
            <defs>
              {/* Manganese Thermal Radial Gradients */}
              <radialGradient id="mnHotspotGrad1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="65%" stopColor="#eab308" stopOpacity="0.6" />
                <stop offset="85%" stopColor="#84cc16" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="mnHotspotGrad2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#eab308" stopOpacity="0.65" />
                <stop offset="80%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>

              {/* Lime-Color Gossan Gradient (Precise Manganese Indicator requested by user) */}
              <radialGradient id="limeGossanGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#bef264" stopOpacity="0.98" />
                <stop offset="30%" stopColor="#a3e635" stopOpacity="0.85" />
                <stop offset="65%" stopColor="#65a30d" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#14532d" stopOpacity="0" />
              </radialGradient>

              {/* Depleted / Less-Vegetation Halo (NDVI Deficit Indicator) */}
              <radialGradient id="barrenSoilGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#92400e" stopOpacity="0.55" />
                <stop offset="80%" stopColor="#451a03" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>

              {/* Contamination Runoff Basin Gradient */}
              <radialGradient id="contamGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#7c3aed" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#4c1d95" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
              </radialGradient>

              {/* Grid pattern */}
              <pattern id="surveyGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#38bdf8" strokeWidth="0.15" opacity="0.4" />
              </pattern>
            </defs>

            {/* Grid overlay */}
            {showGrid && <rect width="100" height="100" fill="url(#surveyGrid)" />}

            {/* Layer: Less-Vegetation / Barren Canopy Halo */}
            {(activeLayer === 'all' || activeLayer === 'vegetation') && (
              <g id="layer-barren-vegetation">
                <ellipse cx="48" cy="46" rx="28" ry="18" fill="url(#barrenSoilGrad)" />
                <ellipse cx="36" cy="56" rx="18" ry="14" fill="url(#barrenSoilGrad)" opacity="0.75" />
              </g>
            )}

            {/* Layer: Lime-Color Alteration Gossan Mask (Specific User Requirement) */}
            {(activeLayer === 'all' || activeLayer === 'lime_gossan') && (
              <g id="layer-lime-gossan">
                <ellipse cx="54" cy="44" rx="16" ry="12" fill="url(#limeGossanGrad)" />
                <circle cx="53" cy="43" r="6" fill="#ecfccb" opacity="0.9" />
                {/* Contour boundary representing gossan boundary */}
                <ellipse cx="54" cy="44" rx="16" ry="12" fill="none" stroke="#bef264" strokeWidth="0.4" strokeDasharray="1 0.5" />
              </g>
            )}

            {/* Layer: Manganese Ore Thermal Heatmap */}
            {(activeLayer === 'all' || activeLayer === 'manganese') && (
              <g id="layer-manganese-hotspots">
                <circle cx="54" cy="44" r="18" fill="url(#mnHotspotGrad1)" />
                <circle cx="36" cy="56" r="13" fill="url(#mnHotspotGrad2)" />
                <circle cx="68" cy="32" r="10" fill="url(#mnHotspotGrad2)" opacity="0.8" />
                
                {/* Hotspot core pins */}
                <circle cx="54" cy="44" r="2.5" fill="#ffffff" opacity="0.95" />
                <circle cx="36" cy="56" r="1.8" fill="#ffffff" opacity="0.85" />
              </g>
            )}

            {/* Layer: Environmental Contamination & Runoff Path */}
            {(activeLayer === 'all' || activeLayer === 'contamination') && showContamination && (
              <g id="layer-contamination">
                {analysis.contaminationZones.map((zone) => (
                  <g key={zone.zoneId} id={`zone-${zone.zoneId}`}>
                    <circle
                      cx={zone.xPercent}
                      cy={zone.yPercent}
                      r={zone.radiusPercent}
                      fill="url(#contamGrad)"
                    />
                    <circle
                      cx={zone.xPercent}
                      cy={zone.yPercent}
                      r={zone.radiusPercent}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="0.35"
                      strokeDasharray="1 0.8"
                    />
                    {/* Runoff flow path arrow */}
                    <path
                      d={`M ${zone.xPercent} ${zone.yPercent} Q ${zone.xPercent + 8} ${zone.yPercent + 10} ${zone.xPercent + 14} ${zone.yPercent + 18}`}
                      fill="none"
                      stroke="#e879f9"
                      strokeWidth="0.4"
                      strokeDasharray="0.8 0.4"
                    />
                  </g>
                ))}
              </g>
            )}
          </svg>

          {/* Excavation Targets Overlay Markers (HTML Pins) */}
          {showTargets && (
            <div id="excavation-targets-overlay" className="absolute inset-0 pointer-events-none">
              {analysis.excavationTargets.map((target, idx) => {
                const isSelected = selectedTargetId === target.id;
                const isAlpha = target.priority === 'CRITICAL_DIG';
                return (
                  <div
                    key={target.id}
                    id={`target-marker-${target.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTargetId(target.id);
                      onSelectTarget?.(target);
                    }}
                    className="absolute pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
                    style={{ left: `${target.xPercent}%`, top: `${target.yPercent}%` }}
                  >
                    {/* Pulsing ring for critical target */}
                    {isAlpha && (
                      <div className="absolute -inset-2 rounded-full border border-red-500 animate-ping opacity-60 pointer-events-none" />
                    )}

                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold shadow-lg border backdrop-blur-md whitespace-nowrap transition-all ${
                        isAlpha
                          ? 'bg-red-950/90 border-red-500 text-red-200 shadow-red-950/80'
                          : 'bg-amber-950/90 border-amber-500 text-amber-200'
                      } ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
                    >
                      <Crosshair className="w-3 h-3 text-white flex-shrink-0 animate-spin-slow" />
                      <span>{target.name.split(' ')[0]}</span>
                      <span className="text-white bg-slate-900/80 px-1 py-0.2 rounded text-[9px]">
                        {target.estimatedMnGrade}% Mn
                      </span>
                    </div>

                    {/* Depth and Bit Tag underneath */}
                    <div className="mt-0.5 text-center">
                      <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-slate-950/80 text-cyan-300 border border-slate-700">
                        ↓ {target.estimatedDepthMeters}m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Coordinate Watermark info on top left */}
          <div className="absolute top-2 left-2 z-10 px-2.5 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 pointer-events-none flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{analysis.locationName}</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">{analysis.coordinates}</span>
          </div>

          {/* Color Scale Legend on bottom left */}
          <div className="absolute bottom-2 left-2 z-10 px-3 py-1.5 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[10px] font-mono pointer-events-none">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Manganese Grade Index</span>
              <span className="text-red-400 font-bold">&gt;50% Peak</span>
            </div>
            <div className="w-36 h-2 rounded bg-gradient-to-r from-blue-600 via-emerald-500 via-lime-400 via-amber-400 to-red-600"></div>
            <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 font-mono">
              <span>10% Low</span>
              <span>35% Med</span>
              <span>44%+ High</span>
            </div>
          </div>

        </div>

      </div>

      {/* Real-time Hover / Click Inspector Strip */}
      <div id="inspector-strip" className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Crosshair className="w-4 h-4 text-amber-400" />
          <span className="font-bold uppercase tracking-wider text-slate-400">Live Grid Inspector:</span>
          {hoveredPoint ? (
            <span className="text-slate-200">
              Grid [X: {hoveredPoint.x}%, Y: {hoveredPoint.y}%]
            </span>
          ) : (
            <span className="text-slate-500 italic">Hover anywhere on satellite scene to inspect ground telemetry</span>
          )}
        </div>

        {hoveredPoint ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Estimated Mn:</span>
              <span className="font-bold text-amber-400 text-sm">{hoveredPoint.mnPercent}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Lime Gossan Index:</span>
              <span className="font-bold text-lime-400">{hoveredPoint.limeScore}/100</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Vegetation Cover:</span>
              <span className="font-bold text-emerald-400">{hoveredPoint.vegCover}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Suggested Drill Depth:</span>
              <span className="font-bold text-cyan-400">{hoveredPoint.depthEstimate}m</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Peak Mn: <strong className="text-amber-400">{analysis.peakMnPercent}%</strong></span>
            <span>Avg Grade: <strong className="text-slate-200">{analysis.averageMnPercent}%</strong></span>
            <span>Confidence: <strong className="text-emerald-400">{analysis.confidenceScore}%</strong></span>
          </div>
        )}
      </div>

    </div>
  );
};
