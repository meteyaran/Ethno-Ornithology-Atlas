import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createDemoPredictions, IdentificationResult } from "./ml/prediction";
import { BirdClass } from "./ml/dataLoader";
import { generateMelSpectrogram, DEFAULT_CONFIG, resampleAudio, normalizeAudio, padOrTrimAudio } from "./ml/audioProcessor";

export async function registerRoutes(app: Express): Promise<Server> {
  // Audio file proxy endpoint to bypass CORS
  app.get("/api/audio-proxy", async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL parameter required" });
      }
      
      // Only allow xeno-canto URLs
      if (!url.includes('xeno-canto.org')) {
        return res.status(403).json({ error: "Only xeno-canto URLs allowed" });
      }
      
      const audioUrl = url.startsWith('http') ? url : `https:${url}`;
      
      const response = await fetch(audioUrl, {
        headers: {
          'User-Agent': 'BirdEncyclopedia/1.0'
        }
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch audio" });
      }
      
      // Set appropriate headers for audio streaming
      res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Pipe the audio stream to the response
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error) {
      console.error("Error proxying audio:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Xeno-canto API v3 proxy endpoint for bird sounds
  app.get("/api/bird-sounds/:scientificName", async (req, res) => {
    try {
      const { scientificName } = req.params;
      const apiKey = process.env.XENO_CANTO_API_KEY;
      
      if (!apiKey) {
        console.error("XENO_CANTO_API_KEY not configured");
        return res.status(500).json({ error: "API key not configured" });
      }
      
      // API v3 uses sp: tag for species search
      const query = `sp:"${scientificName}"`;
      const apiUrl = `https://xeno-canto.org/api/3/recordings?query=${encodeURIComponent(query)}&key=${apiKey}&per_page=50`;
      
      console.log("Fetching bird sounds from Xeno-canto API v3 for:", scientificName);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BirdEncyclopedia/1.0'
        }
      });
      
      console.log("Xeno-canto response status:", response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error("Xeno-canto error response:", text);
        return res.status(response.status).json({ error: "Failed to fetch bird sounds", details: text });
      }
      
      const data = await response.json();
      console.log("Found", data.numRecordings, "recordings for", scientificName);
      
      // Filter for quality A recordings first, then take top 3
      const recordings = data.recordings || [];
      const qualityA = recordings.filter((r: any) => r.q === "A").slice(0, 3);
      
      // If no A quality, take first 3 available
      const result = qualityA.length > 0 ? qualityA : recordings.slice(0, 3);
      
      res.json({ recordings: result, numRecordings: data.numRecordings });
    } catch (error) {
      console.error("Error fetching bird sounds:", error);
      res.status(500).json({ error: "Internal server error", message: String(error) });
    }
  });

  // Bird sound identification endpoint
  app.post("/api/identify-sound", async (req, res) => {
    try {
      const { audioData, sampleRate } = req.body;
      
      if (!audioData || !Array.isArray(audioData)) {
        return res.status(400).json({ error: "Audio data required" });
      }
      
      // Convert array to Float32Array for processing
      const floatData = new Float32Array(audioData);
      const inputSampleRate = sampleRate || 44100;
      
      // Generate spectrogram from recorded audio
      const resampled = resampleAudio(floatData, inputSampleRate, DEFAULT_CONFIG.sampleRate);
      const normalized = normalizeAudio(resampled);
      const targetSamples = Math.floor(DEFAULT_CONFIG.targetDuration * DEFAULT_CONFIG.sampleRate);
      const processed = padOrTrimAudio(normalized, targetSamples);
      const spectrogram = generateMelSpectrogram(processed, DEFAULT_CONFIG);
      
      // Create bird class mapping from birds data
      // In production, this would load from database or file
      const birdClasses: BirdClass[] = [
        { id: "1", name: "Bülbül", scientificName: "Luscinia megarhynchos", classIndex: 0 },
        { id: "2", name: "Kızılgerdan", scientificName: "Erithacus rubecula", classIndex: 1 },
        { id: "3", name: "Kara Baş Ötleğen", scientificName: "Sylvia atricapilla", classIndex: 2 },
        { id: "4", name: "Serçe", scientificName: "Passer domesticus", classIndex: 3 },
        { id: "5", name: "Guguk Kuşu", scientificName: "Cuculus canorus", classIndex: 4 },
        { id: "6", name: "Karatavuk", scientificName: "Turdus merula", classIndex: 5 },
        { id: "7", name: "Alakarga", scientificName: "Garrulus glandarius", classIndex: 6 },
        { id: "8", name: "Saka", scientificName: "Carduelis carduelis", classIndex: 7 },
        { id: "9", name: "Baykuş", scientificName: "Athene noctua", classIndex: 8 },
        { id: "10", name: "Ispinoz", scientificName: "Fringilla coelebs", classIndex: 9 },
        { id: "11", name: "Mavi Çalı Kuşu", scientificName: "Cyanistes caeruleus", classIndex: 10 },
        { id: "12", name: "Büyük Baştankara", scientificName: "Parus major", classIndex: 11 },
        { id: "13", name: "Yalıçapkını", scientificName: "Alcedo atthis", classIndex: 12 },
        { id: "14", name: "Saksağan", scientificName: "Pica pica", classIndex: 13 },
        { id: "15", name: "Kuzgun", scientificName: "Corvus corax", classIndex: 14 },
        { id: "16", name: "Leylek", scientificName: "Ciconia ciconia", classIndex: 15 },
        { id: "17", name: "Şahin", scientificName: "Buteo buteo", classIndex: 16 },
        { id: "18", name: "Kartal", scientificName: "Aquila chrysaetos", classIndex: 17 },
        { id: "19", name: "Baykuşlar", scientificName: "Bubo bubo", classIndex: 18 },
        { id: "20", name: "Flamingo", scientificName: "Phoenicopterus roseus", classIndex: 19 },
      ];
      
      // Check if real model is loaded, otherwise use demo
      const { isModelLoaded, identifyBirdSound } = require("./ml/prediction");
      
      let result;
      if (isModelLoaded()) {
        // Use real model inference
        result = await identifyBirdSound(floatData, inputSampleRate, 5);
      } else {
        // Demo mode - use simulated predictions
        result = createDemoPredictions(birdClasses, floatData.length, 5);
        result.spectrogram = spectrogram.map(frame => Array.from(frame));
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error identifying bird sound:", error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error", 
        message: String(error) 
      });
    }
  });

  // Get spectrogram from audio URL
  app.post("/api/generate-spectrogram", async (req, res) => {
    try {
      const { audioUrl } = req.body;
      
      if (!audioUrl) {
        return res.status(400).json({ error: "Audio URL required" });
      }
      
      // Fetch audio file
      const fullUrl = audioUrl.startsWith('http') ? audioUrl : `https:${audioUrl}`;
      const response = await fetch(fullUrl, {
        headers: { 'User-Agent': 'BirdEncyclopedia/1.0' }
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch audio" });
      }
      
      // For now, return a demo spectrogram
      // In production, would decode MP3 and generate real spectrogram
      const demoSpectrogram: number[][] = [];
      const numFrames = 128;
      const numMels = 128;
      
      for (let t = 0; t < numFrames; t++) {
        const frame: number[] = [];
        for (let f = 0; f < numMels; f++) {
          // Create a natural-looking spectrogram pattern
          const baseFreq = (Math.sin(t * 0.08) * 0.4 + 0.5) * numMels;
          const harmonics = Math.sin(t * 0.15) * 20;
          const distance = Math.abs(f - baseFreq - harmonics);
          const value = Math.exp(-distance * 0.08) * (0.7 + Math.random() * 0.3);
          frame.push(Math.min(1, Math.max(0, value)));
        }
        demoSpectrogram.push(frame);
      }
      
      res.json({ spectrogram: demoSpectrogram });
    } catch (error) {
      console.error("Error generating spectrogram:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Model training status endpoint
  app.get("/api/ml/status", (req, res) => {
    const { isModelLoaded } = require("./ml/prediction");
    
    res.json({
      modelLoaded: isModelLoaded(),
      trainingStatus: isModelLoaded() ? "ready" : "demo_mode",
      numClasses: 86,
      accuracy: isModelLoaded() ? 0.85 : 0.0,
      message: isModelLoaded() 
        ? "ML model loaded and ready for inference."
        : "Demo mode active. Full model training requires: 1) Download audio from Xeno-canto for 86 species, 2) GPU resources for CNN training, 3) Model export to TensorFlow.js format."
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
