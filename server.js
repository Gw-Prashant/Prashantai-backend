import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

app.get("/healthz", (_req, res) => res.send("ok"));

app.post("/api/chat", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: "Missing API key" });

    const { message, image } = req.body;
    const parts = [];
    if (message?.trim()) parts.push({ text: message.trim() });
    if (image?.data && image?.mimeType) {
      parts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
    }
    if (parts.length === 0) return res.status(400).json({ error: "Send message or image" });

    const body = { contents: [{ role: "user", parts }] };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );

    const json = await resp.json();
    const reply = json?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ?? "(no reply)";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
