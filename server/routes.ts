import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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
