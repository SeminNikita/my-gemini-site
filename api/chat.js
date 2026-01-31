export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  
  // Пытаемся сначала использовать 1.5-flash в стабильной версии v1
  const models = ["gemini-1.5-flash", "gemini-1.0-pro"];
  let lastError = "";

  for (const modelName of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: req.body.prompt || "Привет" }] }]
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
      } else if (data.error) {
        lastError = data.error.message;
        continue; // Пробуем следующую модель, если эта не найдена
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  res.status(500).json({ text: `Google API Error: ${lastError}` });
}
