import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Добавляем обработку только POST запросов
  if (req.method !== 'POST') {
    return res.status(405).json({ text: "Метод не разрешен" });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Используем gemini-1.5-flash — она быстрее и стабильнее для бесплатных ключей
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const prompt = req.body.prompt || "Привет!";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Возвращаем четкий JSON объект
    res.status(200).json({ text: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ text: "Ошибка Gemini: " + error.message });
  }
}
