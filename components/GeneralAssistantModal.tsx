import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Level, Grade, ChatMessage, Subject } from '../types';
import ChatInterface from './ChatInterface';
import { startGeneralChatSession, sendMessageToFadel, generateImage } from '../services/geminiService';
import { Part } from '@google/genai';

interface GeneralAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    level: Level;
    grade: Grade | null;
    subject: Subject | null;
}

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // remove the prefix 'data:image/jpeg;base64,'
        resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
});

const GeneralAssistantModal: React.FC<GeneralAssistantModalProps> = ({ isOpen, onClose, level, grade, subject }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ file: File; dataUrl: string; } | null>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (isOpen && !hasInitialized.current) {
            startGeneralChatSession(level, grade, subject);
            
            const imageGenInstruction = "Kamu juga bisa membuat gambar dari teks! Coba ketik `/gambar` diikuti deskripsi, contohnya: `/gambar kucing astronot di bulan`.";

            const initialText = subject
                ? `Halo! Aku Fadel. Kamu sedang di pelajaran ${subject.name}. Ada yang ingin kamu tanyakan tentang pelajaran ini? Kamu juga bisa kirim foto PR-mu, lho! ${imageGenInstruction}`
                : `Halo! Aku Fadel, asisten belajarmu. Ada yang bisa kubantu? Kamu bisa bertanya apa saja, minta rekomendasi pelajaran, kirim foto PR-mu, atau membuat gambar! ${imageGenInstruction}`;
            
            setMessages([
                {
                    id: 'initial-general-fadel',
                    role: 'assistant',
                    text: initialText
                }
            ]);
            hasInitialized.current = true;
        }
        if (!isOpen) {
            // Reset on close
            hasInitialized.current = false;
            setMessages([]);
            setSelectedImage(null);
        }
    }, [isOpen, level, grade, subject]);
    
    const handleImageSelected = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setSelectedImage({ file, dataUrl: e.target?.result as string });
        };
        reader.readAsDataURL(file);
    };
    
    const handleClearImage = () => {
        setSelectedImage(null);
    };

    const handleSendMessage = useCallback(async (text: string) => {
        const isImageGenerationCommand = text.trim().startsWith('/gambar');
        const userMessage: ChatMessage = { 
            id: Date.now().toString(), 
            role: 'user', 
            text,
            imageUrl: !isImageGenerationCommand ? selectedImage?.dataUrl : undefined
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        
        const imageToSend = selectedImage;
        handleClearImage();

        if (isImageGenerationCommand) {
            const prompt = text.trim().substring('/gambar'.length).trim();
            
            if (!prompt) {
                setMessages(prev => [...prev, { 
                    id: (Date.now() + 1).toString(), 
                    role: 'assistant', 
                    text: "Tolong berikan deskripsi untuk gambar yang ingin kamu buat setelah perintah /gambar." 
                }]);
                setIsLoading(false);
                return;
            }

            const assistantMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', text: `Membuat gambar dengan deskripsi: "${prompt}"...` }]);

            try {
                const imageUrl = await generateImage(prompt);
                setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId ? { ...msg, text: `Ini gambar yang kubuat, berdasarkan deskripsimu.`, imageUrl: imageUrl } : msg
                ));
            } catch (error) {
                console.error("Failed to generate image", error);
                setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId ? { ...msg, text: "Maaf, aku gagal membuat gambar. Coba lagi dengan deskripsi lain ya." } : msg
                ));
            } finally {
                setIsLoading(false);
            }
        } else {
            let imagePart: Part | null = null;
            if (imageToSend) {
                try {
                    const base64Data = await toBase64(imageToSend.file);
                    imagePart = {
                        inlineData: {
                            data: base64Data,
                            mimeType: imageToSend.file.type,
                        }
                    };
                } catch (error) {
                    console.error("Error converting image to base64:", error);
                }
            }
            
            const assistantMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', text: "" }]);

            try {
                const stream = await sendMessageToFadel(text, imagePart);
                
                for await (const chunk of stream) {
                    const chunkText = chunk.text;
                    setMessages(prev => prev.map(msg => 
                        msg.id === assistantMessageId ? { ...msg, text: msg.text + chunkText } : msg
                    ));
                }
            } catch (error) {
                console.error("Failed to get response from Fadel", error);
                setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId ? { ...msg, text: "Maaf, ada sedikit gangguan. Coba lagi ya." } : msg
                ));
            } finally {
                setIsLoading(false);
            }
        }
    }, [selectedImage]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl h-[85vh] bg-base-100 rounded-2xl flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold text-primary">Tanya Fadel</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ChatInterface 
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        onImageSelected={handleImageSelected}
                        selectedImagePreview={selectedImage?.dataUrl ?? null}
                        onClearImage={handleClearImage}
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralAssistantModal;