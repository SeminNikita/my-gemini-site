import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ text: "Метод не поддерживается" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ text: "Ошибка: API ключ не настроен в Vercel" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Используем максимально точное название модели
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    const prompt = req.body.prompt || "Привет";

    // Указываем пустой массив генерации, чтобы избежать конфликтов версий
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text: text });
  } catch (error) {
    console.error("Ошибка API:", error);
    
    // Если ошибка 404 всё ещё летит от Google, попробуем дать подсказку
    let errorMessage = error.message;
    if (errorMessage.includes("404")) {
      errorMessage = "Модель не найдена. Попробуйте создать НОВЫЙ ключ в Google AI Studio, возможно старый ключ ограничен.";
    }
    
    return res.status(500).json({ text: "Ошибка: " + errorMessage });
  }
}
