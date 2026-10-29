import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint for EVALÚA
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "EVALÚA",
    tagline: "Organiza la información. Evalúa mejor.",
    region: "Perú - Huánuco",
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in dev / production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EVALÚA server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
