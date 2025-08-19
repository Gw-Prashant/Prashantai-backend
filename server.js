// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// 🔹 Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ✅ Health check (Render ke liye)
app.get("/healthz", (req, res) => {
  res.send("ok");
});

// ✅ Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, image } = req.body;

    // 🔹 Identity check
    const lower = (message || "").toLowerCase();
    if (
      lower.includes("tum kon ho") ||
      lower.includes("who are you") ||
      lower.includes("kisne banaya") ||
      lower.includes("who made you")
    ) {
      return res.json({ reply: "I am Hixs Ai, made by Prashant." });
    }

    // 🔹 Gemini input banaye
    const parts = [];
    if (message) parts.push({ text: message });
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    }

    // 🔹 Gemini se response
    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).json({ reply: "⚠️ Server error, please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
