import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

app.get("/api/pexels", async (req, res) => {
  const query = req.query.q || "nature";
  if (!PEXELS_API_KEY) return res.status(500).json({ error: "Missing API key" });

  try {
    const resp = await fetch(`https://api.pexels.com/v1/search?query=${query}`, {
      headers: { Authorization: PEXELS_API_KEY }
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
