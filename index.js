import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Lấy 2 key từ biến môi trường
const API_KEYS = [
  process.env.PEXELS_API_KEY_1,
  process.env.PEXELS_API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

// Hàm chọn key luân phiên
function getNextKey() {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

app.use(cors({ origin: "*", methods: ["GET"] }));

app.get("/api/pexels/batch", async (req, res) => {
  const raw = (req.query.keywords || "").trim();
  if (!raw) return res.status(400).json({ error: "Missing keywords" });

  const list = [...new Set(raw.split(",").map(k => k.trim().toLowerCase()).filter(Boolean))];

  try {
    const results = await Promise.all(
      list.map(async (k) => {
        const key = getNextKey();
        try {
          const resp = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(k)}&per_page=1`,
            { headers: { Authorization: key } }
          );
          if (!resp.ok) {
            console.warn(`Key ${key} failed with status ${resp.status}`);
            return [k, null];
          }
          const data = await resp.json();
          return [k, data?.photos?.[0]?.src?.medium || null];
        } catch (err) {
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
