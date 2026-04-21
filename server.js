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
    const settings = req.body?.settings ?? {};

    const model = settings.model || process.env.OPENAI_MODEL || "gpt-5.4-nano";
    const instructions =
      settings.system || "You are a friendly Ai chatbot that can help with any task.";

    const apiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        instructions,
        input: message
      })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({
        reply: `OpenAI error: ${data.error?.message || "unknown error"}`
      });
    }

    return res.json({
      reply: data.output_text || "The model returned no text."
    });
  } catch (err) {
    return res.status(500).json({
      reply: `Server error: ${String(err)}`
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Ultra Ai backend running on port ${PORT}`);
});
