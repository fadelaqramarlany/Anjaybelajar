
import React from 'react';
import { Subject } from '../types';
import { ChatBubbleIcon } from './IconComponents';

interface SubjectGridProps {
    subjects: Subject[];
    onSelect: (subject: Subject) => void;
    onBack: () => void;
    onAskFadel: () => void;
}

const SubjectGrid: React.FC<SubjectGridProps> = ({ subjects, onSelect, onBack, onAskFadel }) => {
    return (
        <div className="max-w-6xl mx-auto">
            <button onClick={onBack} className="absolute top-24 left-4 md:left-8 text-primary font-semibold hover:underline">
                &larr; Kembali
            </button>
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Pilih Mata Pelajaran</h2>
                <p className="text-md text-gray-600">Klik salah satu pelajaran untuk mulai bertanya pada Fadel!</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {subjects.map((subject) => (
                    <div
                        key={subject.id}
                        onClick={() => onSelect(subject)}
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center aspect-square"
                    >
                        <subject.icon className="w-12 h-12 mb-3 text-primary" />
                        <h3 className="text-md font-semibold text-center text-gray-700">{subject.name}</h3>
                    </div>
                ))}
            </div>
            <button 
                onClick={onAskFadel}
                className="fixed bottom-8 right-8 bg-gradient-to-tr from-primary to-secondary text-white w-16 h-16 rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-50"
                aria-label="Tanya Fadel"
            >
                <ChatBubbleIcon className="w-8 h-8" />
            </button>
        </div>
    );
};

export default SubjectGrid;
