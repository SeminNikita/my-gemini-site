export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  const userPrompt = req.body.prompt || "Привет";

  try {
    // Используем ПРЯМОЙ адрес Google AI Studio (не Vertex!)
    // ВАЖНО: версия v1 и модель gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ text: `Google Error: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    }
    
    res.status(500).json({ text: "Не удалось получить ответ" });
  } catch (error) {
    res.status(500).json({ text: "Ошибка сервера: " + error.message });
  }
}
