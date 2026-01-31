export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  const userPrompt = req.body.prompt || "Привет";

  // Список всех возможных вариаций имен моделей
  const modelVariants = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  let lastError = "";

  // Пробуем каждую модель по очереди
  for (const modelName of modelVariants) {
    try {
      // Пробуем версию v1beta, так как она самая гибкая
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }]
        })
      });

      const data = await response.json();

      if (response.ok && data.candidates && data.candidates[0].content) {
        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ text: aiText });
      } else if (data.error) {
        lastError = `${modelName}: ${data.error.message}`;
        console.log(`Model ${modelName} failed:`, data.error.message);
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  // Если ни одна модель не подошла
  res.status(404).json({ 
    text: `Ни одна модель не доступна для вашего ключа. Последняя ошибка: ${lastError}. Проверьте доступ в Google AI Studio.` 
  });
}
