import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';

// Lazy initialized Gemini client for server-side analysis
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

function manganeseApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-manganese-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/analyze-manganese' && req.method === 'POST') {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const bodyStr = Buffer.concat(chunks).toString('utf-8');
            const body = JSON.parse(bodyStr || '{}');

            const { imageBase64, mimeType, phValue, locationName } = body;
            const ph = typeof phValue === 'number' ? phValue : 5.8;

            const ai = getGeminiClient();
            if (!ai || !process.env.GEMINI_API_KEY) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                useLocalEngine: true,
                message: 'No GEMINI_API_KEY found in environment. Using integrated local spectral engine.'
              }));
              return;
            }

            const prompt = `You are an expert satellite remote sensing geologist and geochemist specializing in European Space Agency (ESA) Sentinel-2A multispectral exploration for Manganese (Mn) ore deposits (e.g. Pyrolusite MnO2, Psilomelane, Cryptomelane, Braunite).

Analyze the provided satellite or aerial image of the area: "${locationName || 'Target Mining Grid'}".
The measured ground soil / core sample pH value is: ${ph.toFixed(1)}.

IMPORTANT GEOLOGICAL RULES TO APPLY:
1. Less Vegetation / Barren Areas: Manganese phytotoxicity and dense duricrusts inhibit vegetative growth (resulting in severe NDVI deficits, canopy dieback, or chlorosis). These barren or sparsely vegetated ground patches are prime exploration vectors.
2. Lime-Color / Pale Greenish-Yellow Reflectance: Supergene weathering, siliceous gossan caps, and altered clay halos associated with manganese enrichment present distinct lime / pale-yellowish-green optical and Shortwave Infrared (SWIR Band 11/12) spectral responses.
3. Ground pH Impact (< 6.0 Rule):
   - If Ground pH < 6.0: Acidic conditions mobilize manganese into highly soluble, toxic, and bioavailable Mn2+ divalent ions. Manganese is definitely present and leachable. THIS TRIGGERS A HIGH-PRIORITY EXCAVATION TEAM ALERT (acid mine drainage containment, worker respiratory protection against Mn dust, immediate deep core drilling at primary dig spots).
   - If Ground pH >= 6.0: Manganese is primarily locked in stable, insoluble oxide/carbonate matrices. Standard excavation protocol applies.

Return a valid JSON object matching this EXACT structure (do not include markdown wrapping or backticks outside the JSON):
{
  "overallGrade": "High-Grade Metallurgical (>44%)" | "Chemical Grade (35-44%)" | "Low-Grade Siliceous (<35%)" | "Trace / Background",
  "averageMnPercent": number,
  "peakMnPercent": number,
  "confidenceScore": number,
  "mineralBreakdown": [
    { "mineral": "Manganese Dioxide (MnO2)", "symbol": "MnO2", "percentage": number, "color": "#facc15", "description": "Primary high-grade pyrolusite ore matrix" },
    { "mineral": "Iron Oxides (Hematite/Goethite)", "symbol": "Fe2O3", "percentage": number, "color": "#f97316", "description": "Associated ferruginous laterite companion" },
    { "mineral": "Silica / Quartz", "symbol": "SiO2", "percentage": number, "color": "#94a3b8", "description": "Host gangue matrix and chert bands" },
    { "mineral": "Alumina", "symbol": "Al2O3", "percentage": number, "color": "#38bdf8", "description": "Surrounding clay saprolite" },
    { "mineral": "Moisture & Volatiles", "symbol": "H2O/LOI", "percentage": number, "color": "#a855f7", "description": "Structural and pore moisture" }
  ],
  "spectralFeatures": {
    "vegetationCoveragePercent": number,
    "vegetationStressIndex": number,
    "limeColorReflectanceIndex": number,
    "bareRockSoilExposure": number,
    "ndviAverage": number,
    "swirRatio": number,
    "gossanConfidence": number
  },
  "excavationTargets": [
    {
      "id": "target-1",
      "name": "Primary Excavation Trench Alpha",
      "xPercent": number (20-80),
      "yPercent": number (20-80),
      "estimatedMnGrade": number,
      "estimatedDepthMeters": number,
      "estimatedTonnageTons": number,
      "priority": "CRITICAL_DIG",
      "rationale": "Direct intersection of lime-colored gossan anomaly and zero canopy cover",
      "spectralCue": "Intense lime spectral peak + B12 SWIR absorption",
      "recommendedDrillBit": "Diamond Core HQ3 (Tungsten carbide reaming shell)"
    },
    {
      "id": "target-2",
      "name": "Secondary Pit Expansion Beta",
      "xPercent": number,
      "yPercent": number,
      "estimatedMnGrade": number,
      "estimatedDepthMeters": number,
      "estimatedTonnageTons": number,
      "priority": "SECONDARY_DIG",
      "rationale": "Flank transition zone with manganese-induced vegetation chlorosis",
      "spectralCue": "Low NDVI threshold + altered ferruginous clay",
      "recommendedDrillBit": "Reverse Circulation (RC) Hammer 140mm"
    }
  ],
  "contaminationZones": [
    {
      "zoneId": "contam-1",
      "name": "Acidic Manganese Runoff Basin",
      "severity": "CRITICAL",
      "xPercent": number,
      "yPercent": number,
      "radiusPercent": number,
      "pollutant": "Soluble Mn2+ leachate & heavy metal siltation",
      "waterRunoffRisk": "Gravity flow towards drainage tributary",
      "remediationPlan": "Hydrated lime slurry bunding & neutralization catchment"
    }
  ],
  "summaryReport": {
    "executiveSummary": "Concise high-level summary of manganese viability and ground pH findings",
    "geologicalContext": "Description of deposit type and lithology inferred from Sentinel-2 bands",
    "vegetationAnalysis": "Explanation of how low vegetation reveals manganese ore outcrops",
    "limeColorAssessment": "Detailed analysis of lime color signatures matching manganese gossans",
    "phImpactAnalysis": "Evaluation of ground pH (${ph.toFixed(1)}) on manganese mobility and excavation safety",
    "miningRecommendations": ["Action 1", "Action 2", "Action 3", "Action 4"]
  }
}`;

            let cleanBase64 = '';
            let resolvedMime = mimeType || 'image/png';

            if (typeof imageBase64 === 'string') {
              if (imageBase64.includes(';base64,')) {
                const parts = imageBase64.split(';base64,');
                cleanBase64 = parts[1].trim();
                const extractedMime = parts[0].replace(/^data:/, '').trim();
                if (extractedMime && !extractedMime.includes('svg')) {
                  resolvedMime = extractedMime;
                }
              } else if (!imageBase64.startsWith('data:') && imageBase64.length > 50) {
                cleanBase64 = imageBase64.trim();
              }
            }

            const parts: any[] = [];
            if (cleanBase64 && cleanBase64.length > 50 && /^[A-Za-z0-9+/=]+$/.test(cleanBase64.slice(0, 100))) {
              parts.push({
                inlineData: {
                  mimeType: resolvedMime.includes('svg') ? 'image/png' : resolvedMime,
                  data: cleanBase64,
                },
              });
            }
            parts.push({ text: prompt });

            let response;
            try {
              response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: { parts },
                config: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                },
              });
            } catch (err36: any) {
              const errMsg = err36?.message || String(err36);
              if (errMsg.includes('429') || errMsg.includes('Quota exceeded')) {
                console.warn('Gemini API quota exceeded. Falling back to local heuristic engine.');
                throw new Error('QUOTA_EXCEEDED');
              }
              console.warn('gemini-3.6-flash attempt failed:', errMsg);
              try {
                response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: { parts },
                  config: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                  },
                });
              } catch (err38: any) {
                const err38Msg = err38?.message || String(err38);
                if (err38Msg.includes('429') || err38Msg.includes('Quota exceeded')) {
                  console.warn('Gemini API quota exceeded. Falling back to local heuristic engine.');
                  throw new Error('QUOTA_EXCEEDED');
                }
                console.warn('gemini-3.8-flash attempt failed, trying gemini-3.1-flash:', err38Msg);
                response = await ai.models.generateContent({
                  model: 'gemini-3.1-flash',
                  contents: { parts },
                  config: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                  },
                });
              }
            }

            const text = response.text || '{}';
            let parsed = {};
            try {
              const cleanedJson = text.replace(/```json\s*|\s*```/g, '').trim();
              parsed = JSON.parse(cleanedJson);
            } catch {
              // fallback
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              data: parsed,
            }));
          } catch (err: any) {
            const isQuota = err?.message === 'QUOTA_EXCEEDED' || String(err).includes('429') || String(err).includes('Quota exceeded');
            if (!isQuota) {
              console.error('Gemini analysis error:', err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              useLocalEngine: true,
              error: isQuota ? 'AI service quota exceeded. Using fast local heuristic engine.' : (err?.message || 'AI processing failed, using local engine.'),
            }));
          }
          return;
        }
        next();
      });
    },
  };
}

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), manganeseApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
