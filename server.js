import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Ultra Ai backend is alive.");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body?.message ?? "";
    const history = req.body?.history ?? [];
    const settings = req.body?.settings ?? {};

    const model = process.env.OPENAI_MODEL || "gpt-5.4-nano";
    const systemPrompt =
      settings.system || "You are a friendly Ai chatbot that can help with any task.";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: systemPrompt
          },
          ...history
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              role: m.role,
              content: m.content
            })),
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    const reply =
      data.output_text ||
      "No response.";

    res.json({ reply });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: String(err)
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Ultra Ai backend running on port ${PORT}`);
});
