import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ text: "API Key missing" });

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Пробуем самую актуальную стабильную версию
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(req.body.prompt || "Hello");
    const response = await result.response;
    const text = response.text();
    
    res.status(200).json({ text });
  } catch (error) {
    console.error("Detailed Error:", error);
    // Выводим текст ошибки прямо в чат для диагностики
    res.status(500).json({ text: `Ошибка: ${error.message}. Попробуйте сменить регион функции в настройках Vercel на USA.` });
  }
}
