import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ text: "API Key missing in Vercel settings" });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(req.body.prompt || "Привет");
    const response = await result.response;
    
    res.status(200).json({ text: response.text() });
  } catch (error) {
    // Если библиотека выдает ошибку, пробуем прямой fetch к стабильному API
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const directRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: req.body.prompt }] }] })
      });
      const data = await directRes.json();
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } catch (err) {
      res.status(500).json({ text: "Ошибка Gemini: " + error.message });
    }
  }
}
