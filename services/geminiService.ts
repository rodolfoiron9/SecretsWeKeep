import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// In a real app, process.env.API_KEY would be set in the build environment.
// Ensure this is configured for the application to work.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Using mock responses for AI features. Please provide an API key to use the real Gemini API.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Generates an array of image URLs (base64 strings) from a text prompt.
 * Returns mock data if the API key is not available.
 */
export const generateImagesFromPrompt = async (prompt: string): Promise<string[]> => {
    if (!ai) {
        console.log(`Mocking image generation for prompt: "${prompt}"`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Return placeholder images that look different
        return [
            `https://picsum.photos/seed/${prompt.slice(0, 5)}1/512/512`,
            `https://picsum.photos/seed/${prompt.slice(0, 5)}2/512/512`,
            `https://picsum.photos/seed/${prompt.slice(0, 5)}3/512/512`,
            `https://picsum.photos/seed/${prompt.slice(0, 5)}4/512/512`,
        ];
    }
    
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
              numberOfImages: 4,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        }
        return [];
    } catch (error) {
        console.error("Error generating images:", error);
        alert("Failed to generate images. This could be due to an invalid API key or a safety policy violation. Please check the console for details.");
        return [];
    }
};

/**
 * Generates text content from a prompt.
 * Returns mock text if the API key is not available.
 */
export const generateTextFromPrompt = async (prompt: string): Promise<string> => {
    if (!ai) {
        console.log(`Mocking text generation for prompt: "${prompt}"`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `This is MOCK AI-generated text based on the prompt: "${prompt}". It could be a blog post draft, an artist bio snippet, or a creative description. To use the real Gemini API, please provide an API_KEY.`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
        alert("Failed to generate text. This could be due to an invalid API key or a safety policy violation. Please check the console for details.");
        return "Error: Could not generate text.";
    }
};