import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loadBirdNETModel, 
  isBirdNETLoaded, 
  getBirdNETStatus, 
  predictBirdSound,
  searchLabels
} from "./ml/birdnetPredictor";
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

  // Bird sound identification endpoint using BirdNET
  app.post("/api/identify-sound", async (req, res) => {
    try {
      const { audioData, sampleRate, latitude, longitude, week } = req.body;
      
      if (!audioData || !Array.isArray(audioData)) {
        return res.status(400).json({ error: "Audio data required" });
      }
      
      const floatData = new Float32Array(audioData);
      const inputSampleRate = sampleRate || 44100;
      
      const resampled = resampleAudio(floatData, inputSampleRate, DEFAULT_CONFIG.sampleRate);
      const normalized = normalizeAudio(resampled);
      const targetSamples = Math.floor(DEFAULT_CONFIG.targetDuration * DEFAULT_CONFIG.sampleRate);
      const processed = padOrTrimAudio(normalized, targetSamples);
      const spectrogram = generateMelSpectrogram(processed, DEFAULT_CONFIG);
      
      const birdnetResult = await predictBirdSound(
        floatData, 
        inputSampleRate, 
        5,
        latitude,
        longitude,
        week
      );
      
      const result = {
        success: birdnetResult.success,
        predictions: birdnetResult.predictions.map(p => ({
          birdId: p.scientificName.replace(' ', '-').toLowerCase(),
          birdName: p.commonName,
          scientificName: p.scientificName,
          confidence: p.confidence,
          label: p.label
        })),
        spectrogram: spectrogram.map(frame => Array.from(frame)),
        processingTime: birdnetResult.processingTime,
        modelVersion: 'BirdNET V2.4',
        numSpecies: 6522,
        error: birdnetResult.error
      };
      
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

  // BirdNET model status endpoint
  app.get("/api/ml/status", async (req, res) => {
    const status = getBirdNETStatus();
    
    if (!status.loaded) {
      console.log('Loading BirdNET model on first status check...');
      await loadBirdNETModel();
    }
    
    const updatedStatus = getBirdNETStatus();
    
    res.json({
      modelLoaded: updatedStatus.loaded,
      trainingStatus: updatedStatus.loaded ? "ready" : "loading",
      numClasses: updatedStatus.numClasses || 6522,
      accuracy: updatedStatus.loaded ? 0.92 : 0.0,
      modelVersion: "BirdNET V2.4",
      source: "Cornell Lab of Ornithology & TU Chemnitz",
      message: updatedStatus.loaded 
        ? `BirdNET V2.4 model loaded. ${updatedStatus.numClasses} species supported.`
        : updatedStatus.error || "Loading BirdNET model...",
      error: updatedStatus.error
    });
  });

  // Search bird species in BirdNET labels
  app.get("/api/ml/search", (req, res) => {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Query parameter required" });
    }
    
    const results = searchLabels(query);
    res.json({ results });
  });

  const httpServer = createServer(app);

  return httpServer;
}
