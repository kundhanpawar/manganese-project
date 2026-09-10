import React, { useState } from 'react';
import { Beaker, AlertTriangle, CheckCircle2, ArrowRight, X, Info } from 'lucide-react';

interface PHInputDialogProps {
  isOpen: boolean;
  initialPH: number;
  imagePreviewUrl?: string;
  imageName?: string;
  onConfirm: (ph: number) => void;
  onClose?: () => void;
}

export const PHInputDialog: React.FC<PHInputDialogProps> = ({
  isOpen,
  initialPH,
  imagePreviewUrl,
  imageName,
  onConfirm,
  onClose,
}) => {
  const [ph, setPH] = useState<number>(initialPH);

  if (!isOpen) return null;

  const isAcidic = ph < 6.0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPH(parseFloat(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 14) {
      setPH(Math.round(val * 10) / 10);
    }
  };

  const presets = [
    { label: 'Extreme Acidic (4.8)', value: 4.8, alert: true, note: 'Intense Mn²⁺ Leaching' },
    { label: 'Kalahari Sump (5.3)', value: 5.3, alert: true, note: 'Excavation Alert' },
    { label: 'Threshold Acidic (5.8)', value: 5.8, alert: true, note: 'Active Mobility' },
    { label: 'Neutral Soil (6.8)', value: 6.8, alert: false, note: 'Stable Mineral' },
    { label: 'Alkaline Bed (7.8)', value: 7.8, alert: false, note: 'Insoluble Oxides' },
  ];

  return (
    <div
      id="ph-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="ph-modal-card"
        className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl relative text-slate-100 flex flex-col gap-5 overflow-hidden"
      >
        {/* Accent glow bar */}
        <div
          id="ph-accent-glow"
          className={`absolute top-0 left-0 right-0 h-1.5 transition-all ${
            isAcidic ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
          }`}
        />

        {/* Modal Header */}
        <div id="ph-modal-header" className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              id="ph-icon-circle"
              className={`p-3 rounded-xl border flex-shrink-0 ${
                isAcidic ? 'bg-red-950/60 border-red-500/50 text-red-400' : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
              }`}
            >
              <Beaker id="icon-beaker" className="w-6 h-6" />
            </div>
            <div>
              <span id="label-step-indicator" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Post-Upload Field Geochemistry Step
              </span>
              <h3 id="ph-modal-title" className="text-lg sm:text-xl font-bold font-display text-white">
                Enter Measured Ground pH Value
              </h3>
            </div>
          </div>
          {onClose && (
            <button
              id="btn-close-ph-modal"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Image thumbnail + prompt context */}
        <div id="ph-image-context-box" className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          {imagePreviewUrl ? (
            <img
              id="ph-modal-thumbnail"
              src={imagePreviewUrl}
              alt="Uploaded Sentinel 2A Target"
              className="w-16 h-12 rounded object-cover border border-slate-700 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-12 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
              SENTINEL
            </div>
          )}
          <div className="text-xs">
            <p id="ph-image-name" className="font-mono text-slate-200 truncate max-w-[280px]">
              {imageName || 'Sentinel-2A Satellite Frame'}
            </p>
            <p className="text-slate-400 mt-0.5 leading-snug">
              Satellite spectra analysis detects lime-colored gossan &amp; low-vegetation markers. Now specify the substrate pH to evaluate bioavailable manganese leaching.
            </p>
          </div>
        </div>

        {/* pH Range Controller */}
        <div id="ph-slider-container" className="space-y-3">
          <div className="flex items-center justify-between">
            <label id="label-ground-ph" htmlFor="input-range-ph" className="text-sm font-semibold text-slate-200">
              Ground / Borehole Core pH:
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-number-ph"
                type="number"
                min="1.0"
                max="14.0"
                step="0.1"
                value={ph}
                onChange={handleInputChange}
                className="w-20 px-2.5 py-1 text-center font-mono font-bold text-base rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-400 font-mono">pH Units</span>
            </div>
          </div>

          {/* Styled Range Slider */}
          <div className="relative py-2">
            <input
              id="input-range-ph"
              type="range"
              min="2.0"
              max="11.0"
              step="0.1"
              value={ph}
              onChange={handleSliderChange}
              className="w-full h-2.5 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-600 via-amber-400 to-emerald-500 accent-amber-400"
            />
            {/* 6.0 Threshold Marker */}
            <div className="absolute top-0 left-[44.4%] -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <span className="text-[10px] font-mono text-red-400 font-bold">6.0 ALERT THRESHOLD</span>
              <div className="w-0.5 h-3 bg-red-400 mt-0.5"></div>
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>2.0 (Strong Acid)</span>
            <span className="text-red-400 font-semibold">&lt; 6.0 Alert Zone</span>
            <span>7.0 (Neutral)</span>
            <span>11.0 (Alkaline)</span>
          </div>
        </div>

        {/* Real-time Chemical State Feedback Box */}
        <div
          id="ph-status-feedback-box"
          className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
            isAcidic
              ? 'bg-red-950/50 border-red-500/50 text-red-200'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {isAcidic ? (
            <AlertTriangle id="icon-feedback-alert" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
          ) : (
            <CheckCircle2 id="icon-feedback-check" className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <div className="font-bold uppercase tracking-wider mb-0.5 flex items-center gap-2">
              <span>{isAcidic ? '⚠️ HIGH-PRIORITY EXCAVATION ALERT TRIGGERED' : '✓ STABLE OXIDE MINERALIZATION'}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 font-mono text-[10px]">
                pH {ph.toFixed(1)} {isAcidic ? '< 6.0' : '≥ 6.0'}
              </span>
            </div>
            <p className="opacity-90 leading-relaxed font-sans">
              {isAcidic
                ? 'Because ground pH is less than 6.0, manganese is actively dissolved as soluble Mn²⁺ ions. This confirms high presence, accelerates environmental leaching, and activates the emergency excavation team protocol.'
                : 'Ground pH is 6.0 or higher. Manganese occurs as insoluble, stable crystalline oxides (MnO2 / Pyrolusite). Standard open-pit extraction protocol is recommended.'}
            </p>
          </div>
        </div>

        {/* Quick Geological Presets */}
        <div id="ph-presets-group" className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Geological Ground Profiles:
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                id={`btn-preset-ph-${idx}`}
                type="button"
                onClick={() => setPH(p.value)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
                  ph === p.value
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                <span>{p.label}</span>
                {p.alert && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Footer Action */}
        <div id="ph-modal-footer" className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>You can recalibrate pH anytime on the dashboard</span>
          </div>
          <button
            id="btn-confirm-ph-analysis"
            type="button"
            onClick={() => onConfirm(ph)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg ${
              isAcidic
                ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/60'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-emerald-950/60'
            }`}
          >
            <span>Analyze Satellite Target</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
