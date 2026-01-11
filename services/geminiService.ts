
import { GoogleGenAI, Chat, Part, Modality } from "@google/genai";
import { Level, Grade, Subject } from '../types';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT') {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });
    }
    return ai;
};

export const startGeneralChatSession = (level: Level, grade: Grade | null, subject: Subject | null) => {
    const aiInstance = getAI();
    const gradeText = level === 'SD' && grade ? `kelas ${grade}` : (level === 'SMP' ? 'SMP' : '');
    
    let systemInstruction: string;
    const homeworkHelpInstruction = "Kamu juga bisa membantu mengerjakan tugas dan PR. Jika murid mengirim foto soal, analisis gambarnya dan bantu jelaskan cara menyelesaikannya. Jangan hanya berikan jawaban, tapi bimbing mereka langkah demi langkah.";

    if (subject) {
        systemInstruction = `Kamu adalah Fadel, seorang asisten belajar AI yang ramah, sabar, dan ahli dalam mata pelajaran ${subject.name} untuk murid ${level} ${gradeText} di Indonesia, didukung oleh Gemini. Fokuslah untuk menjawab pertanyaan yang berkaitan dengan ${subject.name}. Jelaskan konsep yang sulit dengan cara yang mudah dimengerti, berikan contoh, dan bantu murid mengerjakan soal. ${homeworkHelpInstruction} Jawab dalam Bahasa Indonesia dengan gaya yang positif dan memotivasi.`;
    } else {
        systemInstruction = `Kamu adalah Fadel, seorang asisten belajar AI umum yang ramah, sabar, dan cerdas untuk murid ${level} ${gradeText} di Indonesia, didukung oleh Gemini. Kamu bisa menjawab pertanyaan umum, memberikan motivasi, atau membantu murid memilih pelajaran yang ingin mereka pelajari. ${homeworkHelpInstruction} Jawab dalam Bahasa Indonesia dengan gaya yang positif dan memotivasi.`;
    }

    // FIX: Corrected the structure for chats.create. `systemInstruction` and other parameters should be inside a `config` object.
    chat = aiInstance.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            topP: 0.9,
        }
    });
};

export const sendMessageToFadel = async (message: string, imagePart: Part | null) => {
    if (!chat) {
        throw new Error("Chat session not started. Call startGeneralChatSession first.");
    }
    try {
        const parts: Part[] = [{ text: message }];
        if (imagePart) {
            parts.push(imagePart);
        }
        
        // FIX: The `sendMessageStream` method expects an object with a `message` property containing the parts array.
        const stream = await chat.sendMessageStream({ message: parts });
        return stream;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        throw error;
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const aiInstance = getAI();
    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in the response.");
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw error;
    }
};

// FIX: Added 'generateVideoFromImage' function to handle video generation with Veo.
export const generateVideoFromImage = async (
    base64ImageData: string,
    mimeType: string,
    aspectRatio: '16:9' | '9:16'
): Promise<string> => {
    // Per Veo guidelines, create a new instance to ensure it uses the latest selected API key.
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

    let operation = await aiInstance.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        image: {
            imageBytes: base64ImageData,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await aiInstance.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Video generation failed: No download link found.");
    }
    
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT'}`);
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to download video:", errorBody);
        if (errorBody.includes("Requested entity was not found")) {
             throw new Error("Requested entity was not found. Your API key may be invalid or missing permissions.");
        }
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};