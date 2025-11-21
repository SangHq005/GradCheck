import { GoogleGenAI, Type } from "@google/genai";
import { Student, AnalysisResult } from "../types";

// Helper function to chunk data if list is too long
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const analyzeGraduates = async (students: Student[]): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  
  // Prepare a lightweight list for Gemini to save tokens
  const studentData = students.map(s => `${s.fullName} (${s.major || 'Unknown Major'})`).join(', ');
  
  // Limit to first 100 students for deep analysis if list is huge to avoid token limits, 
  // or handle with pagination in a real large-scale app. 
  // For now, we take a slice if it's massive.
  const contextData = studentData.length > 30000 ? studentData.substring(0, 30000) + "..." : studentData;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Dưới đây là danh sách các sinh viên trong một Câu lạc bộ vừa tốt nghiệp đại học:
    "${contextData}"

    Hãy thực hiện các yêu cầu sau và trả về JSON:
    1. "summary": Một đoạn nhận xét ngắn gọn (khoảng 2-3 câu) về sự đa dạng ngành nghề của đợt tốt nghiệp này.
    2. "congratulationMessage": Một lời chúc mừng tốt nghiệp cảm động, hay, phù hợp để đăng lên Fanpage của CLB dành cho các anh chị này.
    3. "stats": Một mảng thống kê đếm số lượng sinh viên theo Ngành (Major). Nếu không có thông tin ngành, hãy đoán dựa trên context hoặc bỏ qua.

    Output JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            congratulationMessage: { type: Type.STRING },
            stats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Không thể phân tích dữ liệu lúc này.",
      congratulationMessage: "Chúc mừng các anh chị đã tốt nghiệp!",
      stats: []
    };
  }
};