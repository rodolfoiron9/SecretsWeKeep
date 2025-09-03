import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

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
            model: 'imagen-4.0-generate-001',
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
 * Generates a video from a text prompt.
 * Returns a mock video URL if the API key is not available.
 */
export const generateVideoFromPrompt = async (prompt: string, onProgress: (message: string) => void): Promise<string> => {
    if (!ai || !API_KEY) {
        console.log(`Mocking video generation for prompt: "${prompt}"`);
        onProgress("Starting mock video generation...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        onProgress("This would normally take a few minutes...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        onProgress("Finalizing mock video.");
        return "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }

    try {
        onProgress("Sending request to video generation model...");
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: `${prompt}, 5 seconds long, cinematic`,
            config: { numberOfVideos: 1 }
        });

        onProgress("Video generation started. This may take a few minutes. Polling for status...");
        let pollCount = 0;
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            pollCount++;
            onProgress(`Checking status... (Attempt ${pollCount})`);
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            onProgress("Video generated! Fetching video data...");
            const response = await fetch(`${downloadLink}&key=${API_KEY}`);
            const videoBlob = await response.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            onProgress("Video ready!");
            return videoUrl;
        } else {
            throw new Error("Video generation finished but no download link was provided.");
        }
    } catch (error) {
        console.error("Error generating video:", error);
        alert("Failed to generate video. Please check the console for details.");
        onProgress("An error occurred during video generation.");
        return "";
    }
};


/**
 * Generates text content from a prompt.
 * Returns mock text if the API key is not available.
 */
export const generateTextFromPrompt = async (prompt: string, systemInstruction?: string): Promise<string> => {
    if (!ai) {
        console.log(`Mocking text generation for prompt: "${prompt}"`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `This is MOCK AI-generated text based on the prompt: "${prompt}". System instruction was: "${systemInstruction || 'None'}". To use the real Gemini API, please provide an API_KEY.`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: systemInstruction ? { systemInstruction } : undefined,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
        alert("Failed to generate text. This could be due to an invalid API key or a safety policy violation. Please check the console for details.");
        return "Error: Could not generate text.";
    }
};

/**
 * Generates structured JSON data from a prompt based on a provided schema.
 */
export const generateJsonFromPrompt = async <T>(prompt: string, schema: any): Promise<T | null> => {
    if (!ai) {
        console.log(`Mocking JSON generation for prompt: "${prompt}"`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // This is tricky to mock generically, returning null for now.
        // A real implementation would need to generate mock data matching the schema.
        return null;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as T;

    } catch (error) {
        console.error("Error generating JSON:", error);
        alert("Failed to generate JSON data. Please check the console for details.");
        return null;
    }
};