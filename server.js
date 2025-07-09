
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/api/info", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  const cmd = `yt-dlp -J --no-playlist ${url}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("yt-dlp error:", stderr);
      return res.status(500).json({ error: "Failed to fetch video info" });
    }
    try {
      const json = JSON.parse(stdout);
      const formats = json.formats.map(f => ({
        url: f.url,
        quality: f.format_note || f.resolution || "unknown",
        ext: f.ext
      })).filter(f => f.url && f.ext === "mp4");

      res.json({
        title: json.title,
        thumbnail: json.thumbnail,
        formats: formats
      });
    } catch (e) {
      res.status(500).json({ error: "Invalid response from yt-dlp" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`yt-dlp API server running on port ${PORT}`);
});
