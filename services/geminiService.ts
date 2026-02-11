import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

// Initialize the client only if the key exists, handled gracefully in calls if not
const getAiClient = () => {
  if (!API_KEY) return null;
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateDharmaAdvice = async (reflectionText: string, emotionState: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "请配置 API Key 以获取 AI 智慧指引。 (Please configure API Key)";
  }

  const prompt = `
    你是一位富有慈悲心和智慧的佛教导师。用户正在进行每日反省（忏悔）。
    
    用户的总体情绪状态概览: ${emotionState}
    用户的反省内容: "${reflectionText}"
    
    请根据用户的反省，引用“五蕴皆空”、“无常”、“因果”或“慈悲”等核心佛法理念，
    给予一段简短（150字以内）、温暖且具有启发性的指引。
    不要批评，要鼓励用户放下执念，回归内心的平静。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "暂无法获取指引，请静心冥想。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "网络连接不稳定，请专注于当下的呼吸。";
  }
};
