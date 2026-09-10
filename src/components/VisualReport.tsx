import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Pickaxe,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Sprout,
  ShieldCheck,
  FileCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
  Beaker,
  Layers,
  Activity
} from 'lucide-react';
import { ManganeseAnalysisResult, ExcavationTarget } from '../types';

interface VisualReportProps {
  analysis: ManganeseAnalysisResult;
  onTargetSelect?: (target: ExcavationTarget) => void;
}

export const VisualReport: React.FC<VisualReportProps> = ({
  analysis,
  onTargetSelect,
}) => {
  // Depth profile simulation for ore body
  const depthProfileData = [
    { depth: '0m', grade: Math.max(12, Math.round(analysis.averageMnPercent * 0.55)), label: 'Overburden' },
    { depth: '5m', grade: Math.max(22, Math.round(analysis.averageMnPercent * 0.8)), label: 'Gossan Cap' },
    { depth: '10m', grade: Math.round(analysis.averageMnPercent * 1.05), label: 'Sub-surface Seam' },
    { depth: '15m', grade: analysis.peakMnPercent, label: 'Massive Pyrolusite Core' },
    { depth: '20m', grade: Math.round(analysis.averageMnPercent * 1.1), label: 'Primary Bench' },
    { depth: '30m', grade: Math.round(analysis.averageMnPercent * 0.95), label: 'Siliceous Flank' },
    { depth: '40m', grade: Math.round(analysis.averageMnPercent * 0.7), label: 'Saprolite Contact' },
    { depth: '50m', grade: Math.round(analysis.averageMnPercent * 0.45), label: 'Bedrock Basal' },
  ];

  // Sentinel-2A Multispectral reflectance simulation
  const spectralBandsData = [
    { band: 'B2 Blue (490nm)', reflectance: 18, baseline: 20 },
    { band: 'B3 Green (560nm)', reflectance: 38, baseline: 25 },
    { band: 'B4 Red (665nm)', reflectance: 44, baseline: 30 },
    { band: 'B8 NIR (842nm)', reflectance: 14, baseline: 55 }, // Depleted vegetation
    { band: 'B11 SWIR-1 (1610nm)', reflectance: 48, baseline: 35 },
    { band: 'B12 SWIR-2 (2190nm)', reflectance: 22, baseline: 40 }, // Strong Mn absorption
  ];

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Sentinel2A_Manganese_Report_${analysis.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="visual-report-container" className="space-y-6">
      
      {/* KPI Cards Row */}
      <div id="report-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Average Manganese Level */}
        <div id="kpi-card-avg-mn" className="rounded-xl p-4 bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Avg Manganese (Mn)</span>
            <Pickaxe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span id="kpi-avg-mn-val" className="text-2xl sm:text-3xl font-bold font-display text-white">
              {analysis.averageMnPercent}%
            </span>
            <span className="text-xs text-amber-400 font-mono font-semibold">
              Peak {analysis.peakMnPercent}%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase">
              {analysis.overallGrade.split(' ')[0]}
            </span>
            <span className="text-[11px] text-slate-400">Confidence: {analysis.confidenceScore}%</span>
          </div>
        </div>

        {/* Card 2: Lime-Color Gossan Score (Specific user requirement) */}
        <div id="kpi-card-lime-gossan" className="rounded-xl p-4 bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Lime-Color Anomaly</span>
            <Sparkles className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span id="kpi-lime-score-val" className="text-2xl sm:text-3xl font-bold font-display text-lime-400">
              {analysis.spectralFeatures.limeColorReflectanceIndex}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100 Index</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 font-sans leading-tight">
            Pale yellowish-green signature indicates outcropping manganiferous gossan caps.
          </p>
        </div>

        {/* Card 3: Vegetation Depletion / Bare Ground (Specific user requirement) */}
        <div id="kpi-card-veg-depletion" className="rounded-xl p-4 bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Vegetation Canopy Deficit</span>
            <Sprout className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span id="kpi-bare-soil-val" className="text-2xl sm:text-3xl font-bold font-display text-white">
              {analysis.spectralFeatures.bareRockSoilExposure}%
            </span>
            <span className="text-xs text-amber-400 font-mono">Bare / Low Veg</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 font-sans leading-tight">
            Manganese phytotoxicity stunts vegetation, exposing shallow digging targets.
          </p>
        </div>

        {/* Card 4: Ground Soil pH & Alert Trigger */}
        <div
          id="kpi-card-soil-ph"
          className={`rounded-xl p-4 border shadow-md transition-all ${
            analysis.groundPHAlert.isAcidicAlert
              ? 'bg-red-950/40 border-red-500/50 text-red-200'
              : 'bg-slate-900/90 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between opacity-80 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Ground Substrate pH</span>
            <Beaker className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span id="kpi-ph-val" className="text-2xl sm:text-3xl font-bold font-mono">
              {analysis.phValue.toFixed(1)}
            </span>
            <span
              id="kpi-ph-alert-badge"
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                analysis.groundPHAlert.isAcidicAlert
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {analysis.groundPHAlert.isAcidicAlert ? 'ALERT: pH < 6.0' : 'STABLE (≥ 6.0)'}
            </span>
          </div>
          <p className="text-[11px] mt-2 font-sans leading-tight opacity-90">
            {analysis.groundPHAlert.isAcidicAlert
              ? 'Manganese mobilized as soluble toxic Mn²⁺ ions. Excavation alert active.'
              : 'Manganese stabilized in solid oxide matrices (Pyrolusite).'}
          </p>
        </div>

      </div>

      {/* Main Charts Section */}
      <div id="charts-row" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Mineral Composition Elemental Breakdown */}
        <div id="chart-mineral-breakdown-card" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 id="chart-mineral-title" className="text-base font-bold font-display text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Estimated Mineral Concentrations (% Weight)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Sentinel-2 Inferred</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Elemental concentration of target zone showing high manganese dioxide proportion alongside companion iron laterite and quartz gangue.
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analysis.mineralBreakdown}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 60]} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <YAxis dataKey="symbol" type="category" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-700 text-xs shadow-xl">
                          <p className="font-bold text-white">{item.mineral}</p>
                          <p className="text-amber-400 font-mono mt-0.5">Estimated Concentration: {item.percentage}%</p>
                          <p className="text-slate-400 text-[11px] mt-1">{item.description}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {analysis.mineralBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend row */}
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
            {analysis.mineralBreakdown.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: m.color }} />
                <span className="text-slate-300 truncate">{m.symbol}: <strong>{m.percentage}%</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Depth vs. Estimated Ore Grade Profile */}
        <div id="chart-depth-profile-card" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 id="chart-depth-title" className="text-base font-bold font-display text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Sub-Surface Ore Grade vs. Depth Profile
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">Drill Target Model</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Modeled manganese grade through the weathered stratigraphy. Primary payzone begins beneath shallow 4m overburden, peaking between 12m–18m depth.
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={depthProfileData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="depth" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[0, 60]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-700 text-xs shadow-xl font-mono">
                          <p className="font-bold text-amber-400">Depth: {item.depth}</p>
                          <p className="text-white text-sm font-bold mt-0.5">{item.grade}% Manganese</p>
                          <p className="text-slate-400 text-[11px] mt-1">{item.label}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="grade" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#gradeGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Surface Overburden: ~3.5m</span>
            <span className="text-amber-300 font-bold">Optimal Seam: 12m - 18m</span>
            <span>Basal Contact: ~42m</span>
          </div>
        </div>

      </div>

      {/* Excavation Targets Directives Table */}
      <div id="excavation-targets-section" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Pickaxe className="w-5 h-5 text-amber-400" />
              <h3 id="targets-table-title" className="text-lg font-bold font-display text-white">
                Excavation Target Locations &amp; Drill Crew Dispatch
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Prioritized dig targets derived from lime-color reflectance maxima and vegetation depletion anomalies.
            </p>
          </div>
          <button
            id="btn-export-target-data"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors self-start sm:self-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Target Data (JSON)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table id="targets-data-table" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Target ID &amp; Name</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Est. Grade</th>
                <th className="py-2.5 px-3">Depth</th>
                <th className="py-2.5 px-3">Est. Volume</th>
                <th className="py-2.5 px-3">Spectral Vector</th>
                <th className="py-2.5 px-3">Recommended Drill Bit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-sans">
              {analysis.excavationTargets.map((target) => {
                const isCritical = target.priority === 'CRITICAL_DIG';
                return (
                  <tr
                    key={target.id}
                    id={`row-target-${target.id}`}
                    onClick={() => onTargetSelect?.(target)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-white font-mono">{target.name}</div>
                      <div className="text-[11px] text-slate-400">Grid Pos: X {target.xPercent}% • Y {target.yPercent}%</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isCritical
                            ? 'bg-red-950 border border-red-500 text-red-300 animate-pulse'
                            : 'bg-amber-950 border border-amber-500/50 text-amber-300'
                        }`}
                      >
                        {target.priority.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400 text-sm">
                      {target.estimatedMnGrade}% Mn
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-300">
                      {target.estimatedDepthMeters} m
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {target.estimatedTonnageTons.toLocaleString()} tonnes
                    </td>
                    <td className="py-3 px-3 max-w-xs text-slate-300 text-[11px]">
                      {target.spectralCue}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-300 text-[11px]">
                      {target.recommendedDrillBit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contamination Areas & Environmental Hazards */}
      <div id="contamination-report-section" className="rounded-2xl border border-purple-900/40 bg-slate-900/80 p-5 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-purple-400" />
          <h3 id="contam-section-title" className="text-base font-bold font-display text-white">
            Highlighted Contaminated Areas &amp; Leaching Perimeters
          </h3>
        </div>
        <p className="text-xs text-slate-300 font-sans">
          Environmental runoff containment map for heavy metal siltation and dissolved manganese:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {analysis.contaminationZones.map((zone) => (
            <div
              key={zone.zoneId}
              id={`card-contam-${zone.zoneId}`}
              className="p-3.5 rounded-xl bg-slate-950 border border-purple-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-purple-200">{zone.name}</span>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                      zone.severity === 'CRITICAL'
                        ? 'bg-red-950 border border-red-500 text-red-300'
                        : 'bg-amber-950 border border-amber-500/50 text-amber-300'
                    }`}
                  >
                    {zone.severity} HAZARD
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  <strong>Pollutant:</strong> {zone.pollutant}
                </p>
                <p className="text-xs text-slate-400 mb-2 font-sans">
                  <strong>Runoff Risk:</strong> {zone.waterRunoffRisk}
                </p>
              </div>
              <div className="p-2 rounded bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200">
                <strong className="text-purple-300">Remediation Directive:</strong> {zone.remediationPlan}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Narrative Geological Report */}
      <div id="narrative-report-card" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 lg:p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileCheck className="w-5 h-5 text-emerald-400" />
          <h3 id="narrative-report-title" className="text-lg font-bold font-display text-white">
            Integrated Remote Sensing &amp; Geochemical Field Report
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300 font-sans leading-relaxed">
          
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-amber-300 font-mono uppercase tracking-wider mb-1">
                1. Executive Summary &amp; Ore Classification
              </h4>
              <p>{analysis.summaryReport.executiveSummary}</p>
            </div>

            <div>
              <h4 className="font-bold text-lime-300 font-mono uppercase tracking-wider mb-1">
                2. Lime-Color Gossan Anomaly Assessment
              </h4>
              <p>{analysis.summaryReport.limeColorAssessment}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-emerald-300 font-mono uppercase tracking-wider mb-1">
                3. Low Vegetation &amp; Phytotoxicity Correlation
              </h4>
              <p>{analysis.summaryReport.vegetationAnalysis}</p>
            </div>

            <div>
              <h4 className="font-bold text-cyan-300 font-mono uppercase tracking-wider mb-1">
                4. Ground Substrate pH &amp; Excavation Safety
              </h4>
              <p>{analysis.summaryReport.phImpactAnalysis}</p>
            </div>
          </div>

        </div>

        {/* Mining Directives Checklist */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <h4 className="font-bold text-white font-display text-sm mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Field Directives for Mining &amp; Excavation Teams
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analysis.summaryReport.miningRecommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
