import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PHInputDialog } from './components/PHInputDialog';
import { ExcavationAlertBanner } from './components/ExcavationAlertBanner';
import { InteractiveHeatmap } from './components/InteractiveHeatmap';
import { VisualReport } from './components/VisualReport';
import { analyzeImageSpectra, evaluateGroundPH } from './services/manganeseAnalyzer';
import { playExcavationAlertTone } from './utils/audioAlert';
import { PRESET_SATELLITE_SAMPLES } from './data/presetSamples';
import { ManganeseAnalysisResult, ExcavationTarget } from './types';
import {
  Satellite,
  Sliders,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  MapPin,
  CheckCircle2,
  HelpCircle,
  Activity,
  Flame,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [analysis, setAnalysis] = useState<ManganeseAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Post-upload pH prompt modal state
  const [isPHModalOpen, setIsPHModalOpen] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<{
    dataUrl: string;
    imageName: string;
    locationName: string;
    defaultPH: number;
  } | null>(null);

  // Live editable ground pH
  const [currentPH, setCurrentPH] = useState<number>(5.3);

  // Initial load: automatically load Kalahari Basin benchmark so dashboard is immediately active and rich
  useEffect(() => {
    const initialSample = PRESET_SATELLITE_SAMPLES[0];
    runAnalysis(initialSample.sampleImageUrl, `${initialSample.name}.svg`, initialSample.defaultPH, initialSample.name, false);
  }, []);

  const runAnalysis = async (
    dataUrl: string,
    imageName: string,
    ph: number,
    locationName: string,
    playAudio = true
  ) => {
    setIsAnalyzing(true);
    setCurrentPH(ph);
    try {
      const result = await analyzeImageSpectra(dataUrl, imageName, ph, locationName);
      setAnalysis(result);

      if (result.groundPHAlert.isAcidicAlert && soundEnabled && playAudio) {
        playExcavationAlertTone(2);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Called when user selects or drops a photo
  const handleSelectImage = (
    imageDataUrl: string,
    imageName: string,
    defaultPH: number,
    locationName: string
  ) => {
    // As explicitly requested: "also after the photo uploadation the system should ask the ph value of the ground"
    setPendingUpload({
      dataUrl: imageDataUrl,
      imageName,
      locationName,
      defaultPH,
    });
    setCurrentPH(defaultPH);
    setIsPHModalOpen(true);
  };

  // When user confirms pH in the dialog
  const handleConfirmPH = (ph: number) => {
    setIsPHModalOpen(false);
    if (pendingUpload) {
      runAnalysis(pendingUpload.dataUrl, pendingUpload.imageName, ph, pendingUpload.locationName, true);
    }
  };

  // When user adjusts pH on the live dashboard slider
  const handleLivePHChange = (newPH: number) => {
    setCurrentPH(newPH);
    if (analysis) {
      const updatedAlert = evaluateGroundPH(newPH);
      setAnalysis({
        ...analysis,
        phValue: newPH,
        groundPHAlert: updatedAlert,
      });

      if (updatedAlert.isAcidicAlert && !analysis.groundPHAlert.isAcidicAlert && soundEnabled) {
        playExcavationAlertTone(2);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    const firstSample = PRESET_SATELLITE_SAMPLES[0];
    handleSelectImage(firstSample.sampleImageUrl, `${firstSample.name}.svg`, firstSample.defaultPH, firstSample.name);
  };

  return (
    <div id="manganese-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header
        isAcidicAlert={analysis?.groundPHAlert.isAcidicAlert ?? false}
        phValue={currentPH}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onPrintReport={handlePrint}
        onReset={handleReset}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Step 1: Upload / Satellite Target Section */}
        <ImageUploader
          onSelectImage={handleSelectImage}
          isAnalyzing={isAnalyzing}
        />

        {/* Loading Spinner Indicator */}
        {isAnalyzing && (
          <div id="loading-indicator" className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-8 text-center flex flex-col items-center justify-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-lg font-bold font-display text-amber-300">
              Analyzing Sentinel-2A Satellite Imagery...
            </h3>
            <p className="text-xs text-slate-300 font-mono max-w-md">
              Extracting SWIR absorption indices, measuring lime-gossan spectral reflectance, calculating bare-ground NDVI deficits, and evaluating ground pH mobility.
            </p>
          </div>
        )}

        {/* Results Area */}
        {analysis && !isAnalyzing && (
          <div id="results-wrapper" className="space-y-6 animate-fade-in">
            
            {/* High-Priority Excavation Alert Banner (pH < 6.0 Rule) */}
            <ExcavationAlertBanner
              alert={analysis.groundPHAlert}
              primaryTarget={analysis.excavationTargets[0]}
              onJumpToTarget={() => {
                const el = document.getElementById('excavation-targets-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Live Substrate pH Tuner Bar */}
            <div id="live-ph-tuner-card" className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      Live Substrate Ground pH Calibrator:
                    </span>
                    <span className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded ${
                      currentPH < 6.0 ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      pH {currentPH.toFixed(1)} {currentPH < 6.0 ? '(ALERT <6.0)' : '(STABLE)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans">
                    Adjust measured pH to simulate rain leaching or lime neutralization effects on manganese dissolution.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  id="slider-live-ph"
                  type="range"
                  min="2.0"
                  max="10.0"
                  step="0.1"
                  value={currentPH}
                  onChange={(e) => handleLivePHChange(parseFloat(e.target.value))}
                  className="w-full sm:w-48 h-2 bg-gradient-to-r from-red-600 via-amber-400 to-emerald-500 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="font-mono text-sm font-bold text-white w-10 text-right">
                  {currentPH.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Interactive Heat Map Section */}
            <InteractiveHeatmap
              analysis={analysis}
              onSelectTarget={(target) => {
                const el = document.getElementById(`row-target-${target.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            />

            {/* Visual Geological Report & Charts */}
            <VisualReport
              analysis={analysis}
              onTargetSelect={(target) => {
                const el = document.getElementById(`target-marker-${target.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            />

          </div>
        )}

      </main>

      {/* Ground pH Prompt Modal Dialog (Appears immediately after photo upload) */}
      <PHInputDialog
        isOpen={isPHModalOpen}
        initialPH={pendingUpload?.defaultPH ?? 5.4}
        imagePreviewUrl={pendingUpload?.dataUrl}
        imageName={pendingUpload?.imageName}
        onConfirm={handleConfirmPH}
        onClose={() => setIsPHModalOpen(false)}
      />

      {/* Footer */}
      <footer id="app-footer" className="border-t border-slate-900 bg-slate-950/80 px-4 lg:px-8 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-emerald-500" />
            <span className="font-mono text-slate-400">Sentinel-2A MSI Multispectral Exploration Dashboard</span>
          </div>
          <p className="text-center sm:text-right font-sans">
            Calibrated for Manganese Ore (MnO2/Pyrolusite) • Lime-Gossan Spectral Masking • Geochemical pH &lt; 6.0 Leaching Rules
          </p>
        </div>
      </footer>

    </div>
  );
}
