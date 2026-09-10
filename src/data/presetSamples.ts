import { PresetSatelliteSample } from '../types';

// High-fidelity SVG-based Sentinel-2A satellite band simulation images for instant testing
function generateSentinelSvg(
  primaryHue: string,
  limeGossanZone: string,
  barrenZone: string,
  gridLabel: string,
  sensorBand: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <radialGradient id="bgGrad" cx="45%" cy="50%" r="65%">
        <stop offset="0%" stop-color="${primaryHue}" />
        <stop offset="60%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </radialGradient>
      <radialGradient id="gossanGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#bef264" stop-opacity="0.95" />
        <stop offset="40%" stop-color="#a3e635" stop-opacity="0.7" />
        <stop offset="80%" stop-color="#65a30d" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#365314" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="barrenGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#78350f" stop-opacity="0.8" />
        <stop offset="50%" stop-color="#451a03" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#1e293b" stop-opacity="0" />
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.35"/>
      </pattern>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.15 0" />
        <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
      </filter>
    </defs>
    
    <!-- Base Satellite Background -->
    <rect width="800" height="600" fill="url(#bgGrad)" />
    <rect width="800" height="600" fill="url(#grid)" />

    <!-- Topography / Geological Strata -->
    <path d="M-50,150 Q200,80 450,220 T850,180 L850,650 L-50,650 Z" fill="#1c1917" opacity="0.65" />
    <path d="M-50,300 Q180,360 420,280 T850,390 L850,650 L-50,650 Z" fill="#292524" opacity="0.5" />
    
    <!-- Sparse Vegetation / Barren Depleted Soils (NDVI Deficit) -->
    <ellipse cx="380" cy="290" rx="220" ry="140" fill="url(#barrenGrad)" />
    <path d="${barrenZone}" fill="#451a03" opacity="0.55" filter="url(#noise)" />

    <!-- Primary Lime-Color Gossan Alteration Zone (Manganese Indication) -->
    <ellipse cx="430" cy="270" rx="140" ry="95" fill="url(#gossanGrad)" />
    <path d="${limeGossanZone}" fill="#bef264" opacity="0.75" />
    <circle cx="445" cy="265" r="32" fill="#d9f99d" opacity="0.85" />
    <circle cx="445" cy="265" r="14" fill="#1e293b" opacity="0.9" />
    <circle cx="445" cy="265" r="6" fill="#facc15" />

    <!-- Satellite Metadata Overlay -->
    <rect x="15" y="15" width="260" height="65" rx="4" fill="#020617" opacity="0.8" stroke="#334155" stroke-width="1" />
    <text x="28" y="36" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">MISSION: ESA SENTINEL-2A (MSI)</text>
    <text x="28" y="52" fill="#94a3b8" font-family="monospace" font-size="11">BAND: ${sensorBand}</text>
    <text x="28" y="68" fill="#e2e8f0" font-family="monospace" font-size="11">TARGET: ${gridLabel}</text>

    <!-- Crosshair & Scale -->
    <line x1="445" y1="230" x2="445" y2="250" stroke="#facc15" stroke-width="2" />
    <line x1="445" y1="280" x2="445" y2="300" stroke="#facc15" stroke-width="2" />
    <line x1="410" y1="265" x2="430" y2="265" stroke="#facc15" stroke-width="2" />
    <line x1="460" y1="265" x2="480" y2="265" stroke="#facc15" stroke-width="2" />
    <text x="490" y="270" fill="#facc15" font-family="monospace" font-size="11" font-weight="bold">TARGET-01 [Mn &gt;46%]</text>

    <!-- Scale bar bottom right -->
    <rect x="620" y="545" width="155" height="38" rx="4" fill="#020617" opacity="0.8" stroke="#334155" stroke-width="1" />
    <line x1="635" y1="560" x2="755" y2="560" stroke="#f8fafc" stroke-width="2" />
    <line x1="635" y1="555" x2="635" y2="565" stroke="#f8fafc" stroke-width="2" />
    <line x1="755" y1="555" x2="755" y2="565" stroke="#f8fafc" stroke-width="2" />
    <text x="670" y="575" fill="#cbd5e1" font-family="monospace" font-size="10">500 METERS</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_SATELLITE_SAMPLES: PresetSatelliteSample[] = [
  {
    id: 'kalahari-basin',
    name: 'Kalahari Manganese Field - Pit 4A',
    region: 'Northern Cape',
    country: 'South Africa',
    description: 'World’s most concentrated manganese ore body. Shows severe vegetation depletion and prominent lime-yellowish supergene gossan alteration over pyrolusite ore.',
    defaultPH: 5.3, // Triggers < 6.0 Alert!
    coordinates: '27.2415° S, 22.9814° E',
    sampleImageUrl: generateSentinelSvg(
      '#431407',
      'M390,240 Q450,210 490,260 T430,310 Z',
      'M310,210 Q420,180 540,240 T510,360 Z',
      'KALAHARI-BASIN-SEC04',
      'B12 (SWIR-2) / B8 (NIR) / B4 (RED)'
    ),
    knownManganeseGrade: '46.8% Mn (High Metallurgical Grade)',
    spectralNotes: 'High SWIR-2 absorption at 2.2µm combined with deep lime-yellow reflectance in Band 4/3 ratio indicates heavy MnO2 mineralization.'
  },
  {
    id: 'groote-eylandt',
    name: 'Groote Eylandt Sedimentary Basin',
    region: 'Northern Territory',
    country: 'Australia',
    description: 'Pisolitic manganese bed deposit. Coastal eucalyptus foliage exhibits severe chlorosis (vegetation stress) due to manganese phytotoxicity.',
    defaultPH: 5.7, // Triggers < 6.0 Alert!
    coordinates: '13.9872° S, 136.4528° E',
    sampleImageUrl: generateSentinelSvg(
      '#1e3a5f',
      'M410,230 Q480,220 500,280 T420,320 Z',
      'M290,200 Q430,170 560,250 T480,380 Z',
      'GROOTE-EYLANDT-A7',
      'B8A (Veg Red Edge) / B11 (SWIR-1) / B2'
    ),
    knownManganeseGrade: '42.1% Mn (Medium-High Chemical Grade)',
    spectralNotes: 'Lime-green spectral signature correlates with manganese-bearing kaolinite clay alteration halos with near-zero NDVI.'
  },
  {
    id: 'woodie-woodie',
    name: 'Woodie Woodie Hydrothermal Corridor',
    region: 'East Pilbara, WA',
    country: 'Australia',
    description: 'High-purity manganese pods hosted within Carawine Dolomite. Features intense siliceous lime-colored alteration caps in hyper-arid barren bedrock.',
    defaultPH: 4.9, // Triggers CRITICAL < 6.0 Alert!
    coordinates: '21.6514° S, 121.1942° E',
    sampleImageUrl: generateSentinelSvg(
      '#262626',
      'M380,220 Q470,190 520,270 T410,330 Z',
      'M280,180 Q450,150 580,230 T490,390 Z',
      'PILBARA-WOODIE-WW02',
      'B12 (2190nm) / B8A (865nm) / B3 (Green)'
    ),
    knownManganeseGrade: '49.4% Mn (Ultra-High Grade Pyrolusite)',
    spectralNotes: 'Severe acid leaching environment. Intense lime spectral anomaly directly pinpointing sub-surface breccia pipe.'
  },
  {
    id: 'carajas-azul',
    name: 'Carajás Azul Manganese Quarry',
    region: 'Pará Amazonia',
    country: 'Brazil',
    description: 'Large supergene manganese deposit on the edge of tropical canopy. Clear contrast between healthy rainforest canopy and exposed barren lime-laterite quarry bench.',
    defaultPH: 6.4, // Standard monitoring (>= 6.0)
    coordinates: '5.9810° S, 50.4820° W',
    sampleImageUrl: generateSentinelSvg(
      '#064e3b',
      'M420,250 Q490,230 510,290 T430,320 Z',
      'M330,210 Q440,190 540,260 T460,360 Z',
      'CARAJAS-AZUL-BENCH-C',
      'B4 (Red 665nm) / B3 (Green 560nm) / B2'
    ),
    knownManganeseGrade: '37.5% Mn (Siliceous Chemical Grade)',
    spectralNotes: 'Soil pH is buffered by local carbonate rocks; manganese is immobilized in solid manganite/cryptomelane forms.'
  }
];
