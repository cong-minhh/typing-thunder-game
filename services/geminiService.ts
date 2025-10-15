import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getPromptForLevel = (level: number): string => {
    let description = '';
    const wordCount = 200;

    if (level === 1) {
        description = "4 and 5 characters long, very common";
    } else if (level <= 3) {
        description = "5 to 7 characters long, common nouns and verbs";
    } else if (level <= 5) {
        description = "6 to 8 characters long, moderately complex";
    } else {
        description = "7 to 10 characters long, from advanced vocabulary (e.g., science, literature, technology)";
    }

    return `Generate a JSON array of ${wordCount} unique English words suitable for a typing game. The words should be ${description}, lowercase, and contain no special characters.`;
};

export const fetchWords = async (level: number): Promise<string[]> => {
    try {
        const prompt = getPromptForLevel(level);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
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