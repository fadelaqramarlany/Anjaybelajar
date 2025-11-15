
import React, { useState, useCallback } from 'react';
import { Level, Grade, Subject } from './types';
import Header from './components/Header';
import LevelSelector from './components/LevelSelector';
import GradeSelector from './components/GradeSelector';
import SubjectGrid from './components/SubjectGrid';
import LearningPortal from './components/LearningPortal';
import GeneralAssistantModal from './components/GeneralAssistantModal';
import { SUBJECTS_BY_LEVEL_AND_GRADE } from './constants';

const App: React.FC = () => {
    const [level, setLevel] = useState<Level | null>(null);
    const [grade, setGrade] = useState<Grade | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [isGeneralAssistantOpen, setIsGeneralAssistantOpen] = useState(false);

    const handleLevelSelect = useCallback((selectedLevel: Level) => {
        setLevel(selectedLevel);
        setGrade(null);
        setSelectedSubject(null);
    }, []);

    const handleGradeSelect = useCallback((selectedGrade: Grade) => {
        setGrade(selectedGrade);
        setSelectedSubject(null);
    }, []);

    const handleSubjectSelect = useCallback((subject: Subject) => {
        setSelectedSubject(subject);
    }, []);

    const goBack = useCallback(() => {
        if (selectedSubject) {
            setSelectedSubject(null);
        } else if (grade) {
            setGrade(null);
        } else if (level) {
            setLevel(null);
        }
    }, [selectedSubject, grade, level]);
    
    const resetToHome = useCallback(() => {
        setLevel(null);
        setGrade(null);
        setSelectedSubject(null);
        setIsGeneralAssistantOpen(false);
    }, []);

    const renderContent = () => {
        if (!level) {
            return <LevelSelector onSelect={handleLevelSelect} />;
        }
        if (level === 'SD' && !grade) {
            return <GradeSelector onSelect={handleGradeSelect} onBack={goBack} />;
        }
        if (!selectedSubject) {
            const subjects = SUBJECTS_BY_LEVEL_AND_GRADE[level][grade || 'default'];
            return <SubjectGrid subjects={subjects} onSelect={handleSubjectSelect} onBack={goBack} onAskFadel={() => setIsGeneralAssistantOpen(true)} />;
        }
        return <LearningPortal subject={selectedSubject} level={level} grade={grade} onBack={goBack} onAskFadel={() => setIsGeneralAssistantOpen(true)} />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 font-sans text-gray-800">
            <Header onHomeClick={resetToHome} />
            <main className="container mx-auto px-4 py-8">
                {renderContent()}
            </main>
            {level && (
                 <GeneralAssistantModal 
                    isOpen={isGeneralAssistantOpen}
                    onClose={() => setIsGeneralAssistantOpen(false)}
                    level={level}
                    grade={grade}
                    subject={selectedSubject}
                />
            )}
        </div>
    );
};

export default App;
