import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const app = express();
app.use(express.json({ limit: "1mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend folder
const frontendPath = path.join(__dirname, "..", "..", "frontend");
app.use(express.static(frontendPath));

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

app.get("/api/health", (req, res) => {
  res.json({ ok: true, hasKey: !!apiKey });
});

app.post("/api/ask", async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({ error: "OPENAI_API_KEY missing in backend/.env" });
    }

    const { question, moduleTitle } = req.body || {};
    if (!question) return res.status(400).json({ error: "Missing question" });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `Module: ${moduleTitle || "Unknown"}\nQuestion: ${question}`
    });

    res.json({ answer: response.output_text || "No answer returned." });
  } catch (err) {
    res.status(500).json({ error: "AI failed", details: err?.message || String(err) });
  }
});

// SPA fallback (if you add routes later)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;
