export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  
  // Мы переходим на стабильную версию v1 и используем самую надежную модель
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

    // Если Google вернул ошибку, выводим её полностью для диагностики
    if (data.error) {
      return res.status(data.error.code || 500).json({ 
        text: `Google Error ${data.error.code}: ${data.error.message}` 
      });
    }

    // Проверяем, есть ли ответ в структуре
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: aiText });
    } else {
      res.status(500).json({ text: "Получен пустой ответ от ИИ." });
    }

  } catch (error) {
    res.status(500).json({ text: `Системная ошибка: ${error.message}` });
  }
}
