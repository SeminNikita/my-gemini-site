export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Метод не разрешен" });

  const apiKey = process.env.GEMINI_API_KEY;
  
  // Используем gemini-pro — она самая стабильная для новых ключей
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.body.prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Если тут будет 400 или 403 — значит проблема в ключе или регионе
      return res.status(data.error.code || 500).json({ 
        text: `Google Error: ${data.error.message} (${data.error.status})` 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "ИИ прислал пустой ответ";
    res.status(200).json({ text: aiText });

  } catch (error) {
    res.status(500).json({ text: "Системная ошибка: " + error.message });
  }
}
