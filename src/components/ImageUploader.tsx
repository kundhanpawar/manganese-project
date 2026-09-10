import React, { useState, useRef } from 'react';
import { Upload, Satellite, Sparkles, MapPin, Compass, AlertCircle, Eye } from 'lucide-react';
import { PRESET_SATELLITE_SAMPLES } from '../data/presetSamples';
import { PresetSatelliteSample } from '../types';
import { uploadImageToStorage } from '../utils/firebaseStorage';

interface ImageUploaderProps {
  onSelectImage: (imageDataUrl: string, imageName: string, defaultPH: number, locationName: string) => void;
  isAnalyzing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onSelectImage,
  isAnalyzing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('kalahari-basin');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid satellite or aerial image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSelectImage(dataUrl, file.name, 5.4, file.name.replace(/\.[^/.]+$/, ''));
        
        // Upload to Firebase Storage in the background as requested
        uploadImageToStorage(dataUrl, `uploaded_${Date.now()}_${file.name}`).catch(err => {
          console.error("Firebase upload error:", err);
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleSelectPreset = (sample: PresetSatelliteSample) => {
    setSelectedPresetId(sample.id);
    onSelectImage(sample.sampleImageUrl, `${sample.name}.svg`, sample.defaultPH, sample.name);
    
    // Also save preset selections to Firebase Storage for tracking
    uploadImageToStorage(sample.sampleImageUrl, `preset_${Date.now()}_${sample.name}.svg`).catch(err => {
      console.error("Firebase preset upload error:", err);
    });
  };

  return (
    <div id="image-uploader-container" className="w-full space-y-6">
      
      {/* Hero Guidance Banner */}
      <div id="uploader-guidance-card" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ESA SENTINEL-2A MULTISPECTRAL ENGINE
              </span>
              <span className="text-xs text-slate-400 font-mono">10m-20m Ground Sample Resolution</span>
            </div>
            <h2 id="uploader-heading" className="text-xl sm:text-2xl font-bold font-display text-white">
              Upload Satellite Scene or Select Manganese Mine Target
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 font-sans">
              Identifies outcropping manganese ore formations by mapping <strong className="text-lime-300">lime-colored gossan spectral reflectance</strong> and <strong className="text-amber-300">vegetation depletion/chlorosis halos</strong>. Prompts for ground pH to calculate chemical leaching hazards and dispatch excavation alerts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-300">
            <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400"></span>
              <span>Lime Color = Mn Anomaly</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Low Veg = Outcrop Vector</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>pH &lt; 6.0 = Excavation Alert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Drag-and-Drop Area */}
      <div
        id="drag-drop-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
          isDragging
            ? 'border-amber-400 bg-amber-950/20 scale-[1.01]'
            : 'border-slate-700 hover:border-amber-400/80 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          id="file-input-hidden"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.tif,.tiff"
          className="hidden"
        />

        {/* Ambient Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415510_1px,transparent_1px),linear-gradient(to_bottom,#33415510_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center max-w-lg mx-auto">
          <div
            id="dropzone-icon-circle"
            className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
          >
            <Upload id="icon-upload" className="w-8 h-8" />
          </div>

          <h3 id="dropzone-title" className="text-lg sm:text-xl font-bold text-white mb-1 font-display">
            Drop Sentinel-2A Satellite or Aerial Image Here
          </h3>
          <p id="dropzone-subtitle" className="text-xs sm:text-sm text-slate-400 mb-4 font-sans">
            Supports Sentinel-2 multispectral crops, true color (B4-B3-B2), false color infrared (B8-B4-B3), drone orthomosaics, or PNG/JPEG place photographs.
          </p>

          <button
            id="btn-browse-files"
            type="button"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider font-mono transition-all shadow-lg shadow-amber-950/40 group-hover:shadow-amber-500/20"
          >
            Browse Imagery Files
          </button>
        </div>
      </div>

      {/* Preset Satellite Targets Section */}
      <div id="presets-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass id="icon-compass" className="w-4 h-4 text-emerald-400" />
            <h3 id="presets-heading" className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              Or Benchmark With Calibrated Sentinel-2A Mining Targets:
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-sans hidden sm:inline">
            Click any target for instant AI &amp; spectral analysis
          </span>
        </div>

        <div id="preset-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_SATELLITE_SAMPLES.map((sample) => {
            const isAlertPreset = sample.defaultPH < 6.0;
            return (
              <div
                key={sample.id}
                id={`preset-card-${sample.id}`}
                onClick={() => handleSelectPreset(sample)}
                className={`group rounded-xl border p-3.5 bg-slate-900/80 hover:bg-slate-850 cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  selectedPresetId === sample.id
                    ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mb-3">
                  <img
                    src={sample.sampleImageUrl}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-[10px] font-mono text-cyan-300">
                    {sample.coordinates}
                  </div>
                  <div
                    className={`absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isAlertPreset ? 'bg-red-950/90 border border-red-500/60 text-red-300' : 'bg-emerald-950/90 border border-emerald-500/60 text-emerald-300'
                    }`}
                  >
                    pH {sample.defaultPH} {isAlertPreset ? 'ALERT' : 'STABLE'}
                  </div>
                </div>

                {/* Info Text */}
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors font-display line-clamp-1">
                    {sample.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{sample.region}, {sample.country}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-2 font-sans">
                    {sample.description}
                  </p>
                </div>

                {/* Grade and button */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-amber-300">
                    {sample.knownManganeseGrade.split(' ')[0]}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-300 group-hover:text-amber-400 font-mono">
                    Analyze <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
