import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Bật CORS cho tất cả domain
app.use(cors({ origin: "*", methods: ["GET"] }));

// Endpoint batch: /api/pexels/batch?keywords=cat,dog,tree
app.get("/api/pexels/batch", async (req, res) => {
  const raw = (req.query.keywords || "").trim();
  if (!raw) return res.status(400).json({ error: "Missing keywords" });

  const list = [...new Set(raw.split(",").map(k => k.trim().toLowerCase()).filter(Boolean))];

  try {
    const results = await Promise.all(
      list.map(async (k) => {
        try {
          const resp = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(k)}&per_page=1`,
            { headers: { Authorization: PEXELS_API_KEY } }
          );
          if (!resp.ok) return [k, null];
          const data = await resp.json();
          return [k, data?.photos?.[0]?.src?.medium || null];
        } catch {
          return [k, null];
        }
      })
    );

    res.json({ images: Object.fromEntries(results) });
  } catch (err) {
    res.status(500).json({ error: "Batch proxy error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Pexels proxy running on port ${PORT}`);
});
