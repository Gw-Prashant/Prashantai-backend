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

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ✅ Health check route
app.get("/healthz", (req, res) => {
  res.send("ok");
});

// ✅ Main chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, image } = req.body;

    // 🔹 Identity check (Hindi + English)
    const lower = (message || "").toLowerCase();
    if (
      lower.includes("tum kon ho") ||
      lower.includes("who are you") ||
      lower.includes("kisne banaya") ||
      lower.includes("who made you")
    ) {
      return res.json({ reply: "I am Hixs Ai, made by Prashant." });
    }

    // 🔹 Build Gemini input
    let input = [];
    if (message) input.push(message);
    if (image) {
      input.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    }

    // 🔹 Call Gemini API
    const result = await model.generateContent(input);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("❌ Error in /api/chat:", err);
    res.status(500).json({ reply: "⚠️ Server error, please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
