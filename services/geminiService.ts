
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const fetchWords = async (): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a JSON array of 100 common English words suitable for a typing game. The words should be between 4 and 8 characters long, lowercase, and contain no special characters.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        words: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A common English word"
                            }
                        }
                    },
                    required: ["words"]
                },
            },
        });

        const jsonString = response.text;
        const parsed = JSON.parse(jsonString);

        if (parsed && Array.isArray(parsed.words)) {
            return parsed.words;
        } else {
            console.error("Unexpected JSON structure:", parsed);
            return ["error", "parsing", "json", "response"];
        }

    } catch (error) {
        console.error("Error fetching words from Gemini API:", error);
        // Provide fallback words in case of an API error
        return ["hello", "world", "react", "typescript", "game", "speed", "typing", "thunder", "falling", "words"];
    }
};
