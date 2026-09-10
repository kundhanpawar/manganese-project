export interface MineralComposition {
  mineral: string;
  symbol: string;
  percentage: number;
  color: string;
  description: string;
}

export interface ExcavationTarget {
  id: string;
  name: string;
  xPercent: number; // 0 - 100 on image
  yPercent: number; // 0 - 100 on image
  estimatedMnGrade: number; // percentage e.g. 48.2
  estimatedDepthMeters: number;
  estimatedTonnageTons: number;
  priority: 'CRITICAL_DIG' | 'SECONDARY_DIG' | 'RECONNAISSANCE';
  rationale: string;
  spectralCue: string;
  recommendedDrillBit: string;
}

export interface ContaminationZone {
  zoneId: string;
  name: string;
  severity: 'CRITICAL' | 'WARNING' | 'MODERATE';
  xPercent: number;
  yPercent: number;
  radiusPercent: number;
  pollutant: string;
  waterRunoffRisk: string;
  remediationPlan: string;
}

export interface HeatmapPoint {
  x: number; // 0 - 100
  y: number; // 0 - 100
  intensity: number; // 0 - 1
  mnPercent: number;
  type: 'manganese' | 'lime_gossan' | 'barren_vegetation' | 'contamination';
}

export interface SpectralIndicators {
  vegetationCoveragePercent: number;
  vegetationStressIndex: number; // 0 to 1
  limeColorReflectanceIndex: number; // 0 to 100
  bareRockSoilExposure: number; // percentage
  ndviAverage: number;
  swirRatio: number;
  gossanConfidence: number; // percentage
}

export interface GroundPHAlert {
  isAcidicAlert: boolean; // true if pH < 6.0
  phValue: number;
  priorityLevel: 'CRITICAL_ALERT' | 'STANDARD_MONITORING';
  headline: string;
  bioavailability: string;
  excavationProtocol: string;
  tailingsHazard: string;
  recommendedNeutralizer: string;
  immediateTeamActions: string[];
}

export interface ManganeseAnalysisResult {
  id: string;
  timestamp: string;
  imageName: string;
  imageUrl: string;
  locationName: string;
  coordinates?: string;
  phValue: number;
  groundPHAlert: GroundPHAlert;
  overallGrade: 'High-Grade Metallurgical (>44%)' | 'Chemical Grade (35-44%)' | 'Low-Grade Siliceous (<35%)' | 'Trace / Background';
  averageMnPercent: number;
  peakMnPercent: number;
  confidenceScore: number;
  mineralBreakdown: MineralComposition[];
  spectralFeatures: SpectralIndicators;
  excavationTargets: ExcavationTarget[];
  contaminationZones: ContaminationZone[];
  heatmapPoints: HeatmapPoint[];
  summaryReport: {
    executiveSummary: string;
    geologicalContext: string;
    vegetationAnalysis: string;
    limeColorAssessment: string;
    phImpactAnalysis: string;
    miningRecommendations: string[];
  };
}

export interface PresetSatelliteSample {
  id: string;
  name: string;
  region: string;
  country: string;
  description: string;
  defaultPH: number;
  coordinates: string;
  sampleImageUrl: string;
  thumbnailSvg?: string;
  knownManganeseGrade: string;
  spectralNotes: string;
}
