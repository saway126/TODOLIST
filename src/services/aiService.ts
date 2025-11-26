
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
 * Calls OpenAI API to analyze image or text.
 */
const callOpenAI = async (messages: any[]): Promise<AIAnalysisResult> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key is missing. Please set it in Settings.");
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Use a cost-effective vision model
                messages: messages,
                max_tokens: 1000,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        try {
            const result = JSON.parse(content);
            // Ensure the result has the expected structure
            if (!result.tasks || !Array.isArray(result.tasks)) {
                // Try to handle if AI returned just an array or wrapped differently
                if (Array.isArray(result)) return { tasks: result };
                throw new Error("Invalid JSON structure from AI");
            }
            return result;
        } catch (e) {
            console.error("Failed to parse AI response:", content);
            throw new Error("Failed to parse AI response as JSON.");
        }

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
    `;

    const messages = [
        {
            role: "user",
            content: [
                { type: "text", text: prompt },
                {
                    type: "image_url",
                    image_url: {
                        url: `data:image/jpeg;base64,${base64Image}`
                    }
                }
            ]
        }
    ];

    return callOpenAI(messages);
};

export const analyzePdf = async (textContent: string): Promise<AIAnalysisResult> => {
    // Note: For now, we assume textContent is extracted text. 
    // If we want to send the PDF file itself, we would need to use the Assistants API with file upload,
    // which is more complex. For this version, we'll rely on client-side text extraction (if implemented)
    // or just treat the input as a large text block.

    const prompt = `
    Analyze the following text (extracted from a PDF or document) and extract actionable tasks.
    Return a JSON object with a "tasks" array.
    Each task should have a "text" (short summary) and "description" (details).
    
    Text Content:
    ${textContent.substring(0, 20000)} // Limit length to avoid token limits
    `;

    const messages = [
        {
            role: "system",
            content: "You are a helpful project manager AI that extracts tasks from documents. Output JSON."
        },
        {
            role: "user",
            content: prompt
        }
    ];

    return callOpenAI(messages);
};

export const getWisdom = async (pendingTasks: string[]): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key not set");

    const prompt = `You are a wise, ancient cosmic turtle swimming in the sea of code. The user has these remaining tasks: [${pendingTasks.join(", ")}]. Give a short, profound, and slightly humorous piece of advice or motivation for a developer. Keep it under 150 characters. End with a turtle emoji 🐢.`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a mystical and wise persona." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 100
            })
        });

        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error fetching wisdom:", error);
        throw error;
    }
};

export const breakdownTask = async (taskText: string): Promise<string[]> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key not set");

    const prompt = `Break down the following developer task into 3-5 smaller, actionable, technical sub-tasks. Output ONLY the sub-tasks, one per line, starting with nothing (just the text). Do not use markdown bullets. Keep them concise. Task: "${taskText}"`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a senior technical lead helping a developer plan their work." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 200
            })
        });

        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        const content = data.choices[0].message.content;
        return content.split('\n').filter((line: string) => line.trim() !== '').map((line: string) => line.replace(/^- /, '').trim());
    } catch (error) {
        console.error("Error breaking down task:", error);
        throw error;
    }
};
