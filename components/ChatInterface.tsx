import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { PaperclipIcon } from './IconComponents';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    isLoading: boolean;
    onImageSelected: (file: File) => void;
    selectedImagePreview: string | null;
    onClearImage: () => void;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, onImageSelected, selectedImagePreview, onClearImage }) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if ((inputText.trim() || selectedImagePreview) && !isLoading) {
            onSendMessage(inputText);
            setInputText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageSelected(file);
        }
         // Reset file input to allow selecting the same file again
        event.target.value = '';
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl flex flex-col h-[calc(70vh-50px)]">
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={msg.id + '-' + index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg px-4 py-3 rounded-2xl ${
                            msg.role === 'user' 
                                ? 'bg-primary text-white rounded-br-none' 
                                : 'bg-base-200 text-gray-800 rounded-bl-none'
                        }`}>
                             {msg.imageUrl && <img src={msg.imageUrl} alt="Lampiran pengguna" className="rounded-lg mb-2 max-w-xs" />}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-lg px-4 py-3 rounded-2xl bg-base-200 text-gray-800 rounded-bl-none">
                           <TypingIndicator/>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-base-300 bg-white rounded-b-2xl">
                 {selectedImagePreview && (
                    <div className="relative p-2 mb-2 border rounded-lg w-fit">
                        <img src={selectedImagePreview} alt="Pratinjau" className="h-20 w-20 object-cover rounded" />
                        <button
                            onClick={onClearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                            aria-label="Hapus gambar"
                        >&times;</button>
                    </div>
                )}
                <div className="flex items-center space-x-3">
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="w-12 h-12 border border-base-300 rounded-full text-gray-500 flex items-center justify-center disabled:bg-gray-200 disabled:cursor-not-allowed transform hover:scale-110 transition"
                         aria-label="Lampirkan gambar"
                    >
                       <PaperclipIcon className="w-6 h-6" />
                    </button>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ketik pertanyaanmu atau lampirkan foto..."
                        className="flex-1 p-3 border border-base-300 rounded-full focus:ring-2 focus:ring-primary focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || (!inputText.trim() && !selectedImagePreview)}
                        className="w-12 h-12 bg-primary rounded-full text-white flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-110 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">Powered by Gemini</p>
            </div>
        </div>
    );
};

export default ChatInterface;