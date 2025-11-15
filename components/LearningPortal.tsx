
import React from 'react';
import { Subject, Level, Grade } from '../types';
import { LEARNING_CONTENT } from '../content';
import { ChatBubbleIcon } from './IconComponents';

interface LearningPortalProps {
    subject: Subject;
    level: Level;
    grade: Grade | null;
    onBack: () => void;
    onAskFadel: () => void;
}

const LearningPortal: React.FC<LearningPortalProps> = ({ subject, level, grade, onBack, onAskFadel }) => {
    const gradeText = level === 'SD' ? `Kelas ${grade}` : 'SMP';
    
    const gradeKey = grade || 'default';
    const content = LEARNING_CONTENT[level]?.[gradeKey]?.[subject.id];

    return (
        <>
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="flex items-center mb-8 relative">
                    <button onClick={onBack} className="text-primary font-semibold hover:underline mr-4">
                        &larr; Kembali ke Daftar Pelajaran
                    </button>
                </div>
                
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl">
                    <header className="flex items-start md:items-center gap-4 border-b border-base-200 pb-6 mb-6 flex-col md:flex-row">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <subject.icon className="w-12 h-12 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-secondary">{level} - {gradeText}</p>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{subject.name}</h1>
                        </div>
                    </header>

                    <article className="prose prose-lg max-w-none text-gray-700">
                        {content ? (
                            <>
                                <h2 className="text-2xl font-semibold">{content.title}</h2>
                                {content.paragraphs.map((p, index) => (
                                    <p key={index}>{p}</p>
                                ))}
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-semibold">Selamat Datang di Pelajaran {subject.name}!</h2>
                                <p>
                                    Ini adalah ruang belajarmu untuk mata pelajaran <strong>{subject.name}</strong>.
                                    Silakan jelajahi topik-topik yang akan datang. Selamat belajar!
                                </p>
                                <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md my-6">
                                    <p className="font-bold">Segera Hadir!</p>
                                    <p>Konten lengkap untuk pelajaran ini sedang dalam persiapan dan akan segera tersedia. Terima kasih sudah sabar menunggu!</p>
                                </div>
                            </>
                        )}
                    </article>
                </div>
            </div>
            <button 
                onClick={onAskFadel}
                className="fixed bottom-8 right-8 bg-gradient-to-tr from-primary to-secondary text-white w-16 h-16 rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-50"
                aria-label={`Tanya Fadel tentang ${subject.name}`}
            >
                <ChatBubbleIcon className="w-8 h-8" />
            </button>
        </>
    );
};

export default LearningPortal;
