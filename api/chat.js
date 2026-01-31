export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  
  // Используем gemini-1.5-flash-latest — это самый надежный эндпоинт
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.body.prompt || "Hi" }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Это поможет нам увидеть реальную причину от Google
      return res.status(data.error.code || 500).json({ 
        text: `Google Error: ${data.error.message} (Reason: ${data.error.status})` 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Пустой ответ";
    res.status(200).json({ text: aiText });

  } catch (error) {
    res.status(500).json({ text: `System Error: ${error.message}` });
  }
}
