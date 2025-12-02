
const API_KEY_STORAGE_KEY = 'todo-app-api-key';

export const getApiKey = (): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const setApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export interface AIAnalysisResult {
    tasks: { text: string; description: string }[];
}

/**
 * Calls Google Gemini API.
 */
const callGemini = async (prompt: string, imageBase64?: string): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key is missing. Please set it in Settings.");
    }

    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
        parts.push({
            inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
            }
        });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: parts }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;
        return content;

    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};

export const analyzeImage = async (base64Image: string): Promise<AIAnalysisResult> => {
    const prompt = `
    Analyze this image and extract actionable tasks. 
    Return a JSON object with a "tasks" array. 
    Each task should have a "text" (short summary) and "description" (details).
    If it's code, describe the refactoring or fix needed.
    If it's a UI, describe the implementation steps.
    IMPORTANT: Output ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    `;

    try {
        const textResponse = await callGemini(prompt, base64Image);
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Failed to parse Gemini response:", error);
        throw new Error("Failed to parse AI response as JSON.");
    }
};

export const analyzePdf = async (textContent: string): Promise<AIAnalysisResult> => {
    const prompt = `
    Analyze the following text (extracted from a PDF or document) and extract actionable tasks.
    Return a JSON object with a "tasks" array.
    Each task should have a "text" (short summary) and "description" (details).
    IMPORTANT: Output ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    
    Text Content:
    ${textContent.substring(0, 20000)}
    `;

    try {
        const textResponse = await callGemini(prompt);
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Failed to parse Gemini response:", error);
        throw new Error("Failed to parse AI response as JSON.");
    }
};

export const getWisdom = async (pendingTasks: string[]): Promise<string> => {
    const prompt = `You are a wise, ancient cosmic turtle swimming in the sea of code. The user has these remaining tasks: [${pendingTasks.join(", ")}]. Give a short, profound, and slightly humorous piece of advice or motivation for a developer. Keep it under 150 characters. End with a turtle emoji 🐢.`;
    return await callGemini(prompt);
};

export const breakdownTask = async (taskText: string): Promise<string[]> => {
    const prompt = `Break down the following developer task into 3-5 smaller, actionable, technical sub-tasks. Output ONLY the sub-tasks, one per line, starting with nothing (just the text). Do not use markdown bullets. Keep them concise. Task: "${taskText}"`;

    const textResponse = await callGemini(prompt);
    return textResponse.split('\n').filter((line: string) => line.trim() !== '').map((line: string) => line.replace(/^- /, '').trim());
};
