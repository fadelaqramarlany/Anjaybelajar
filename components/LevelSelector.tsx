
import React from 'react';
import { Level } from '../types';

interface LevelSelectorProps {
    onSelect: (level: Level) => void;
}

const LevelCard: React.FC<{ level: Level, title: string, description: string, onClick: () => void }> = ({ level, title, description, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-4 border-transparent hover:border-primary"
    >
        <h3 className="text-4xl font-bold text-center text-primary mb-2">{title}</h3>
        <p className="text-gray-600 text-center">{description}</p>
    </div>
);

const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelect }) => {
    return (
        <div className="text-center max-w-4xl mx-auto pt-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Selamat Datang di Belajar Yuk!</h2>
            <p className="text-lg text-gray-600 mb-12">Pilih jenjang pendidikanmu untuk memulai.</p>
            <div className="grid md:grid-cols-2 gap-8">
                <LevelCard 
                    level="SD"
                    title="SD"
                    description="Sekolah Dasar (Kelas 1-6)"
                    onClick={() => onSelect('SD')}
                />
                <LevelCard 
                    level="SMP"
                    title="SMP"
                    description="Sekolah Menengah Pertama"
                    onClick={() => onSelect('SMP')}
                />
            </div>
        </div>
    );
};

export default LevelSelector;
