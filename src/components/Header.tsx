import React from 'react';
import { Satellite, AlertTriangle, Volume2, VolumeX, Printer, RefreshCw } from 'lucide-react';

interface HeaderProps {
  isAcidicAlert: boolean;
  phValue: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPrintReport: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isAcidicAlert,
  phValue,
  soundEnabled,
  onToggleSound,
  onPrintReport,
  onReset,
  isAnalyzing,
}) => {
  return (
    <header id="dashboard-header" className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div id="header-container" className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left branding and satellite telemetry info */}
        <div id="brand-telemetry-section" className="flex items-center gap-3.5">
          <div id="brand-icon-wrapper" className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Satellite id="satellite-icon" className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div id="brand-title-row" className="flex items-center gap-2">
              <h1 id="brand-title" className="font-display text-xl font-bold tracking-wider text-slate-100 uppercase">
                Sentinel-2A Manganese Dashboard
              </h1>
              <span id="badge-mission" className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                ESA COPERNICUS MSI
              </span>
            </div>
            <p id="brand-subtitle" className="text-xs text-slate-400 font-sans">
              AI Multispectral Mineral Estimation • Lime-Gossan Vectors • Ground pH Leaching Telemetry
            </p>
          </div>
        </div>

        {/* Right status indicators and controls */}
        <div id="header-controls-section" className="flex items-center gap-2.5 sm:gap-3">
          {/* Ground pH Badge Indicator */}
          <div
            id="header-ph-indicator"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              isAcidicAlert
                ? 'bg-red-950/70 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {isAcidicAlert ? (
              <AlertTriangle id="ph-alert-icon" className="w-4 h-4 text-red-400 animate-bounce" />
            ) : (
              <span id="ph-dot-normal" className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
            <span id="ph-text-label">SOIL pH:</span>
            <span id="ph-number-value" className="font-bold text-sm">
              {phValue.toFixed(1)}
            </span>
            <span id="ph-status-badge" className="text-[10px] uppercase opacity-80 hidden md:inline">
              {isAcidicAlert ? 'ALERT: ACIDIC (<6.0)' : 'STABLE (≥6.0)'}
            </span>
          </div>

          {/* Audio siren toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            title={soundEnabled ? 'Disable Excavation Audio Alert' : 'Enable Excavation Audio Alert'}
            className={`p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-amber-950/50 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {soundEnabled ? (
              <Volume2 id="icon-volume-on" className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX id="icon-volume-off" className="w-4 h-4" />
            )}
            <span id="text-sound-status" className="hidden lg:inline text-[11px] font-mono">
              {soundEnabled ? 'ALERT SOUND ON' : 'MUTED'}
            </span>
          </button>

          {/* Export / Print Report */}
          <button
            id="btn-print-report"
            onClick={onPrintReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-all"
            title="Print or Export Field Report"
          >
            <Printer id="icon-printer" className="w-3.5 h-3.5" />
            <span id="text-print-report" className="hidden sm:inline">Export Report</span>
          </button>

          {/* Re-analyze / Reset */}
          <button
            id="btn-reset-analysis"
            onClick={onReset}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold font-mono tracking-wide transition-all disabled:opacity-50"
            title="Load New Satellite Target or Image"
          >
            <RefreshCw id="icon-refresh" className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span id="text-new-scan" className="hidden sm:inline">NEW TARGET</span>
          </button>
        </div>

      </div>
    </header>
  );
};
