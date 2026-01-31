export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  // Важно: используем актуальный адрес v1beta
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: req.body.prompt || "Привет" }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Извлекаем текст из специфической структуры ответа Google
    const aiText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ text: `Ошибка: ${error.message}` });
  }
}
