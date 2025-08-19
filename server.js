import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get("/healthz", (req, res) => res.send("ok"));

app.post("/api/chat", async (req, res) => {
  try {
    const { message, image } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "❌ Missing Gemini API Key in server." });
    }

    // 👉 Identify wala check
    const identifyKeywords = [
      "tum kon ho",
      "tum kaun ho",
      "who are you",
      "kisne banaya",
      "who made you",
      "what is your name"
    ];

    if (message) {
      const lowerMsg = message.toLowerCase();
      if (identifyKeywords.some(k => lowerMsg.includes(k))) {
        return res.json({
          reply: "Main Hixs Ai hoon 🤖, mujhe Prashant ne banaya hai 🙌."
        });
      }
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      GEMINI_API_KEY;

    const contents = [{ role: "user", parts: [] }];
    if (message) contents[0].parts.push({ text: message });
    if (image) {
      contents[0].parts.push({
        inline_data: {
          mime_type: image.mimeType,
          data: image.data,
        },
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();
    if (data.error) {
      return res.status(400).json({ error: data.error.message || "Gemini API error" });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No reply from Gemini.";

    res.json({ reply });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));
