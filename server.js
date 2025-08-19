import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ Route: test health
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Hixs AI Backend Running 🚀" });
});

// ✅ Route: Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, image } = req.body;

    // agar user poochhe "tum kaun ho" ya "kisne banaya"
    const checkText = (message || "").toLowerCase();
    if (
      checkText.includes("tum kaun ho") ||
      checkText.includes("who are you") ||
      checkText.includes("kisne banaya") ||
      checkText.includes("who made you")
    ) {
      return res.json({
        reply: "Main Hixs AI hoon 🤖, mujhe Prashant ne banaya hai 🙌"
      });
    }

    const body = {
      contents: [
        {
          parts: [
            ...(message ? [{ text: message }] : []),
            ...(image
              ? [
                  {
                    inline_data: {
                      data: image.data,
                      mime_type: image.mimeType
                    }
                  }
                ]
              : [])
          ]
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API error:", data.error);
      return res.status(400).json({ reply: "⚠️ API Error: " + data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No reply";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "⚠️ Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
