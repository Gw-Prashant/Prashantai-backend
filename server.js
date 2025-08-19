import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // base64 images upto ~10MB

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

/* 🔒 Identity / system prompt */
const SYSTEM_PROMPT = `
You are **Hixs Ai**, an AI assistant created by **Prashant**.
If the user asks (in any language or context) "who are you", "what is your name",
"kisne banaya", "tum kaun ho" etc., always include:
"I am Hixs Ai, made by Prashant."
Be concise and helpful.
`;

app.get("/healthz", (_req, res) => res.send("ok"));

app.post("/api/chat", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const { message, image } = req.body;

    // Build Gemini parts: system prompt first, then user text, then optional image
    const parts = [{ text: SYSTEM_PROMPT }];

    if (message?.trim()) {
      parts.push({ text: message.trim() });
    }

    if (image?.data && image?.mimeType) {
      parts.push({
        inlineData: { data: image.data, mimeType: image.mimeType }
      });
    }

    if (parts.length === 1) { // only system prompt present
      return res.status(400).json({ error: "Send message or image" });
    }

    const body = { contents: [{ role: "user", parts }] };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const json = await resp.json();

    // Extract text safely
    const reply =
      json?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ??
      json?.promptFeedback?.blockReason ??
      "(no reply)";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
