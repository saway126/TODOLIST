

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
 * Mock implementation for now. In a real app, this would call OpenAI or Gemini API.
 */
export const analyzeImage = async (base64Image: string): Promise<AIAnalysisResult> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key is missing. Please set it in Settings.");
    }

    // TODO: Integrate actual API call here
    // For demonstration, we'll return a mock response after a delay
    console.log("Analyzing image with key:", apiKey, "Length:", base64Image.length);
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        tasks: [
            { text: "Refactor Authentication Logic", description: "The code screenshot shows legacy auth handling. It should be updated to use the new provider pattern." },
            { text: "Fix Type Error in UserProfile", description: "Line 42 has a potential null reference. Add optional chaining." }
        ]
    };
};

export const analyzePdf = async (textContent: string): Promise<AIAnalysisResult> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key is missing. Please set it in Settings.");
    }

    // TODO: Integrate actual API call here
    console.log("Analyzing PDF with key:", apiKey, "Content length:", textContent.length);
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        tasks: [
            { text: "Review System Architecture", description: "Based on the PDF, the system architecture needs a review for scalability." },
            { text: "Update API Documentation", description: "The document mentions new endpoints that are not yet documented." }
        ]
    };
};
