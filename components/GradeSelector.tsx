
import React from 'react';
import { Grade } from '../types';

interface GradeSelectorProps {
    onSelect: (grade: Grade) => void;
    onBack: () => void;
}

const grades: Grade[] = ['1', '2', '3', '4', '5', '6'];

const GradeSelector: React.FC<GradeSelectorProps> = ({ onSelect, onBack }) => {
    return (
        <div className="max-w-4xl mx-auto text-center">
            <button onClick={onBack} className="absolute top-24 left-4 md:left-8 text-primary font-semibold hover:underline">
                &larr; Kembali
            </button>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pilih Kelas Kamu</h2>
            <p className="text-md text-gray-600 mb-10">Setiap kelas punya materi yang disesuaikan untukmu!</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {grades.map((grade) => (
                    <div
                        key={grade}
                        onClick={() => onSelect(grade)}
                        className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                        <p className="text-2xl font-bold text-secondary">Kelas</p>
                        <p className="text-6xl font-bold text-primary">{grade}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GradeSelector;
