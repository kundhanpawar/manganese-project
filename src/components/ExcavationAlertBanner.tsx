import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Droplets, Hammer, FileText } from 'lucide-react';
import { GroundPHAlert, ExcavationTarget } from '../types';

interface ExcavationAlertBannerProps {
  alert: GroundPHAlert;
  primaryTarget?: ExcavationTarget;
  onJumpToTarget?: () => void;
}

export const ExcavationAlertBanner: React.FC<ExcavationAlertBannerProps> = ({
  alert,
  primaryTarget,
  onJumpToTarget,
}) => {
  const [expanded, setExpanded] = useState(true);

  if (alert.isAcidicAlert) {
    return (
      <section
        id="high-priority-excavation-alert-banner"
        className="w-full rounded-xl border-2 border-red-500/80 bg-gradient-to-r from-red-950/90 via-slate-950/95 to-red-950/90 p-4 lg:p-5 shadow-[0_0_30px_rgba(239,68,68,0.25)] relative overflow-hidden transition-all duration-300"
      >
        {/* Animated warning stripes accent */}
        <div
          id="alert-stripes-pattern"
          className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_10px,#7f1d1d_10px,#7f1d1d_20px)] animate-pulse"
        />

        <div id="alert-header-row" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div id="alert-title-group" className="flex items-start gap-3">
            <div
              id="alert-icon-box"
              className="p-2.5 rounded-lg bg-red-900/60 border border-red-500 text-red-200 flex-shrink-0 animate-bounce"
            >
              <AlertOctagon id="icon-critical-octagon" className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div id="alert-badge-row" className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  id="badge-high-priority"
                  className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider bg-red-600 text-white uppercase shadow-sm animate-pulse"
                >
                  HIGH-PRIORITY EXCAVATION ALERT
                </span>
                <span
                  id="badge-ph-reading"
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 border border-red-500/40 text-red-300"
                >
                  GROUND pH: {alert.phValue.toFixed(1)} (&lt; 6.0 CRITICAL THRESHOLD)
                </span>
                <span
                  id="badge-presence-confirmed"
                  className="px-2 py-0.5 rounded text-[11px] font-sans font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                >
                  Manganese Presence Confirmed
                </span>
              </div>
              <h2 id="alert-headline-text" className="text-base sm:text-lg font-bold text-red-100 leading-snug">
                {alert.headline}
              </h2>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div id="alert-action-buttons" className="flex items-center gap-2 self-end sm:self-center">
            {primaryTarget && (
              <button
                id="btn-jump-target"
                onClick={onJumpToTarget}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono uppercase transition-all shadow-md"
              >
                <Hammer id="icon-hammer" className="w-3.5 h-3.5" />
                Target Dig Grid
              </button>
            )}
            <button
              id="btn-toggle-alert-details"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-red-500/30 text-red-200 text-xs font-medium transition-colors"
            >
              <span>{expanded ? 'Collapse Protocol' : 'Review Protocol'}</span>
              {expanded ? (
                <ChevronUp id="icon-chevron-up" className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown id="icon-chevron-down" className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Detailed Excavation Protocol */}
        {expanded && (
          <div id="alert-expanded-body" className="mt-4 pt-4 border-t border-red-900/60 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Column 1: Chemical Dissolution Mechanics */}
            <div id="col-chemical-mechanics" className="p-3 rounded-lg bg-slate-900/70 border border-red-900/40">
              <div id="header-bioavailability" className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 font-mono mb-1.5">
                <Droplets id="icon-droplets" className="w-4 h-4 text-amber-400" />
                GEOCHEMICAL MOBILITY (pH &lt; 6.0)
              </div>
              <p id="text-bioavailability" className="text-xs text-slate-300 leading-relaxed font-sans">
                {alert.bioavailability}
              </p>
            </div>

            {/* Column 2: Neutralization & Runoff Containment */}
            <div id="col-tailings-containment" className="p-3 rounded-lg bg-slate-900/70 border border-red-900/40">
              <div id="header-neutralizer" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 font-mono mb-1.5">
                <ShieldAlert id="icon-shield-neutralizer" className="w-4 h-4 text-emerald-400" />
                RUNOFF &amp; LIME DOSING
              </div>
              <p id="text-tailings-hazard" className="text-xs text-slate-300 leading-relaxed font-sans mb-2">
                {alert.tailingsHazard}
              </p>
              <div id="box-recommended-neutralizer" className="text-[11px] p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                <strong className="text-emerald-300">Dosing Directive:</strong> {alert.recommendedNeutralizer}
              </div>
            </div>

            {/* Column 3: Immediate Excavation Crew Actions */}
            <div id="col-team-actions" className="p-3 rounded-lg bg-slate-900/70 border border-red-900/40">
              <div id="header-team-actions" className="flex items-center gap-1.5 text-xs font-semibold text-red-300 font-mono mb-1.5">
                <FileText id="icon-checklist" className="w-4 h-4 text-red-400" />
                MANDATORY EXCAVATION ACTIONS
              </div>
              <ul id="list-immediate-actions" className="space-y-1.5">
                {alert.immediateTeamActions.map((action, idx) => (
                  <li key={idx} id={`action-item-${idx}`} className="flex items-start gap-1.5 text-[11px] text-slate-200 font-sans">
                    <span className="w-4 h-4 rounded-full bg-red-900/80 text-red-300 text-[10px] font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </section>
    );
  }

  // Stable monitoring banner when pH >= 6.0
  return (
    <section
      id="standard-monitoring-banner"
      className="w-full rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-950 to-emerald-950/60 p-3.5 lg:p-4 transition-all"
    >
      <div id="standard-header-row" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div id="standard-title-group" className="flex items-center gap-3">
          <div id="icon-standard-box" className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 id="icon-check-stable" className="w-5 h-5" />
          </div>
          <div>
            <div id="standard-badge-row" className="flex items-center gap-2 mb-0.5">
              <span id="badge-stable-protocol" className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/80 text-emerald-200 uppercase">
                STANDARD EXTRACTION PROTOCOL
              </span>
              <span id="badge-stable-ph" className="text-xs font-mono text-emerald-400">
                Ground pH: {alert.phValue.toFixed(1)} (≥ 6.0 Stable Matrix)
              </span>
            </div>
            <p id="standard-headline" className="text-sm font-medium text-slate-200">
              {alert.headline}
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-stable-details"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 self-end sm:self-center text-xs text-slate-400 hover:text-slate-200 font-sans transition-colors"
        >
          <span>{expanded ? 'Hide Details' : 'View Geological Assessment'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div id="standard-expanded-body" className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 font-sans grid grid-cols-1 sm:grid-cols-2 gap-3">
          <p id="standard-bioavailability-desc">{alert.bioavailability}</p>
          <p id="standard-excavation-desc">{alert.excavationProtocol}</p>
        </div>
      )}
    </section>
  );
};
