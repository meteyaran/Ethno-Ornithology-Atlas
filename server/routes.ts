import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);

  return httpServer;
}
