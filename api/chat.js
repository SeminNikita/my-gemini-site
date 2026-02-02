export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  const userPrompt = req.body.prompt || "Привет";
  
  // ВСТАВЬТЕ СЮДА ВАШ PROJECT ID ИЗ GOOGLE CLOUD (например, my-project-123)
  const projectId = "core-silicon-486214-t7"; 
  const region = "us-central1"; // Стандартный регион для Vertex

  try {
    // Правильный URL для Vertex AI API
    const url = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }]
      })
    });

    const data = await response.json();

    // Vertex возвращает массив объектов при стриминге
    if (data[0]?.candidates?.[0]?.content) {
      const aiText = data[0].candidates[0].content.parts[0].text;
      res.status(200).json({ text: aiText });
    } else {
      res.status(500).json({ text: "Ошибка Vertex: " + JSON.stringify(data) });
    }
  } catch (error) {
    res.status(500).json({ text: "Ошибка сервера: " + error.message });
  }
}
