import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateVideoFromImage } from '../services/geminiService';
import { MovieIcon } from './IconComponents';

// Helper function to convert file to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
});

// Loading messages
const loadingMessages = [
    "Fadel sedang membawa gambarmu ke dunia animasi...",
    "Merender setiap piksel menjadi gerakan...",
    "Sedikit lagi, keajaiban sedang dibuat!",
    "Hampir selesai, videomu sedang dipoles...",
];

type AspectRatio = '16:9' | '9:16';

const VeoAnimate: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ file: File; dataUrl: string } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const loadingIntervalRef = useRef<number | null>(null);

    // Check for API key on mount
    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setIsKeySelected(true);
            }
        };
        checkApiKey();
    }, []);

    // Cycle through loading messages
    useEffect(() => {
        if (isLoading) {
            let i = 0;
            loadingIntervalRef.current = window.setInterval(() => {
                i = (i + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[i]);
            }, 5000);
        } else if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
        }
        return () => {
            if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        };
    }, [isLoading]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success to avoid race condition, the API call will confirm it
            setIsKeySelected(true);
            setError(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage({ file, dataUrl: event.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!selectedImage || !aspectRatio || !isKeySelected) return;

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            const base64Data = await toBase64(selectedImage.file);
            const videoUrl = await generateVideoFromImage(base64Data, selectedImage.file.type, aspectRatio);
            setGeneratedVideoUrl(videoUrl);
        } catch (err: any) {
            console.error(err);
            let errorMessage = "Terjadi kesalahan saat membuat video. Silakan coba lagi.";
            if (err.message?.includes("Requested entity was not found")) {
                errorMessage = "Kunci API tidak valid. Silakan pilih kunci API yang benar.";
                setIsKeySelected(false); // Reset key state
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartOver = () => {
        setSelectedImage(null);
        setAspectRatio(null);
        setGeneratedVideoUrl(null);
        setError(null);
        setIsLoading(false);
    };

    const renderContent = () => {
        if (!isKeySelected) {
            return (
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <h3 className="text-2xl font-bold text-primary mb-4">Pilih Kunci API</h3>
                    <p className="text-gray-600 mb-6">Untuk menggunakan fitur Veo, kamu perlu memilih kunci API Google AI Studio terlebih dahulu. Pastikan penagihan telah diaktifkan untuk proyekmu.</p>
                    <button
                        onClick={handleSelectKey}
                        className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Pilih Kunci API
                    </button>
                     <p className="text-xs text-gray-500 mt-4">
                        Informasi lebih lanjut tentang penagihan: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">ai.google.dev/gemini-api/docs/billing</a>
                    </p>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
                    <h3 className="text-2xl font-bold text-primary mb-4">Membuat Video...</h3>
                    <p className="text-gray-600">{loadingMessage}</p>
                    <p className="text-sm text-gray-500 mt-2">(Ini bisa memakan waktu beberapa menit)</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-8 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 font-semibold mb-4">{error}</p>
                    <button
                        onClick={handleGenerate}
                        className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors mr-2"
                    >
                        Coba Lagi
                    </button>
                    <button
                        onClick={handleStartOver}
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Mulai Ulang
                    </button>
                </div>
            );
        }

        if (generatedVideoUrl) {
            return (
                <div>
                    <video src={generatedVideoUrl} controls autoPlay loop className="w-full max-w-lg mx-auto rounded-lg shadow-lg mb-6"></video>
                    <div className="text-center">
                        <button
                            onClick={handleStartOver}
                            className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Buat Video Lain
                        </button>
                    </div>
                </div>
            );
        }

        return (
             <div>
                {!selectedImage ? (
                    <div className="border-4 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                        <input type="file" id="imageUpload" accept="image/*" className="hidden" onChange={handleFileChange} />
                        <label htmlFor="imageUpload" className="cursor-pointer">
                            <p className="text-gray-500">Klik atau seret gambar ke sini untuk diunggah</p>
                        </label>
                    </div>
                ) : (
                    <div className="text-center">
                        <img src={selectedImage.dataUrl} alt="Preview" className="max-h-60 mx-auto rounded-lg shadow-md mb-6" />
                        <div className="mb-6">
                            <h4 className="font-semibold text-lg mb-3">Pilih Rasio Aspek Video</h4>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setAspectRatio('16:9')}
                                    className={`py-2 px-6 rounded-lg border-2 ${aspectRatio === '16:9' ? 'bg-primary text-white border-primary' : 'border-gray-300'}`}
                                >
                                    16:9 Landscape
                                </button>
                                <button
                                    onClick={() => setAspectRatio('9:16')}
                                    className={`py-2 px-6 rounded-lg border-2 ${aspectRatio === '9:16' ? 'bg-primary text-white border-primary' : 'border-gray-300'}`}
                                >
                                    9:16 Portrait
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={!aspectRatio}
                            className="bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Buat Video!
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
         <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center mb-8 relative">
                <button onClick={onBack} className="text-primary font-semibold hover:underline mr-4">
                    &larr; Kembali ke Halaman Utama
                </button>
            </div>
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl">
                 <header className="flex items-start md:items-center gap-4 border-b border-base-200 pb-6 mb-6 flex-col md:flex-row">
                    <div className="bg-secondary/10 p-3 rounded-lg">
                       <MovieIcon className="w-12 h-12 text-secondary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Animasikan Gambar dengan Veo</h1>
                        <p className="text-md text-gray-600">Unggah foto dan hidupkan dengan AI. Pilih rasio aspek dan biarkan keajaiban terjadi!</p>
                    </div>
                </header>
                {renderContent()}
            </div>
        </div>
    );
};

export default VeoAnimate;
