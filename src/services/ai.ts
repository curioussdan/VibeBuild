import { GoogleGenAI, Type } from "@google/genai";
import { ProjectSummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getNextQuestion(prompt: string, previousAnswers: Record<string, string>) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a product strategist for VibeBuild. 
    The user wants to build: "${prompt}".
    Previous answers: ${JSON.stringify(previousAnswers)}.
    Ask ONE specific follow-up question to clarify the requirements. 
    If you have enough info to generate a summary, return "FINISH".
    Otherwise, return just the question text.`,
  });
  return response.text.trim();
}

export async function generateProjectSummary(prompt: string, answers: Record<string, string>): Promise<ProjectSummary> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the initial prompt: "${prompt}" and these answers: ${JSON.stringify(answers)}, 
    generate a structured project summary in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          project_type: { type: Type.STRING },
          problem_statement: { type: Type.STRING },
          target_user: { type: Type.STRING },
          must_have_features: { type: Type.ARRAY, items: { type: Type.STRING } },
          optional_features: { type: Type.ARRAY, items: { type: Type.STRING } },
          design_preferences: { type: Type.STRING },
          deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
          urgency: { type: Type.STRING },
          constraints: { type: Type.STRING },
          extra_notes: { type: Type.STRING },
        },
        required: ["project_type", "problem_statement", "must_have_features", "deliverables"],
      },
    },
  });
  return JSON.parse(response.text);
}
