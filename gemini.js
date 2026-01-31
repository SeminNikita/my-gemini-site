export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ text: "Метод не разрешен" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  // Проверка ключа прямо в логах Vercel (выведет первые 4 символа для теста)
  console.log("API Key check:", apiKey ? apiKey.substring(0, 4) + "..." : "MISSING");

  if (!apiKey) {
    return res.status(500).json({ text: "Ошибка: Ключ API не найден в переменных Vercel" });
  }

  // Используем абсолютно базовый URL без лишних параметров
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: req.body.prompt || "Привет" }]
        }]
      })
    });

    const data = await response.json();

    // Если Google вернул ошибку, мы пробросим её текст в чат
    if (data.error) {
      return res.status(data.error.code || 500).json({ 
        text: `Google Error (${data.error.status}): ${data.error.message}` 
      });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "ИИ вернул пустой ответ";
    return res.status(200).json({ text: aiResponse });

  } catch (error) {
    return res.status(500).json({ text: "Ошибка сервера: " + error.message });
  }
}