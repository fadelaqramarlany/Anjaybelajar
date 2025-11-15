import { Level, Grade } from './types';

export interface LearningContent {
    title: string;
    paragraphs: string[];
}

type ContentStructure = Record<Level, Partial<Record<Grade | 'default', Record<string, LearningContent>>>>;


const createSubjectContent = (subjectName: string): LearningContent => ({
    title: `Selamat Datang di Pelajaran ${subjectName}!`,
    paragraphs: [
        `Materi belajar untuk ${subjectName} tersedia untukmu 24 jam! Kamu bisa langsung bertanya kepada Fadel untuk memulai.`,
        `Coba tanyakan tentang topik tertentu, minta penjelasan konsep yang sulit, atau bahkan kirim foto PR-mu untuk dibantu! Fadel siap membantumu kapan saja.`
    ]
});

// List all subject IDs from constants.ts to generate content dynamically
// This is a simplified representation. In a real app, this would be more robust.
const allSubjectIds = [
    'ski', 'akhlak', 'fikih', 'al-quran-hadist', 
    'bahasa-indonesia', 'pjok', 'bahasa-inggris'
];

const allSubjectNames: Record<string, string> = {
    'ski': 'SKI',
    'akhlak': 'Akhlak',
    'fikih': 'Fikih',
    'al-quran-hadist': 'Al-Qur\'an Hadist',
    'bahasa-indonesia': 'Bahasa Indonesia',
    'pjok': 'PJOK',
    'bahasa-inggris': 'Bahasa Inggris',
};

const generateAllContent = (): Record<string, LearningContent> => {
    const content: Record<string, LearningContent> = {};
    for (const id of allSubjectIds) {
        content[id] = createSubjectContent(allSubjectNames[id] || 'Pelajaran Ini');
    }
    return content;
};

const generatedContent = generateAllContent();


export const LEARNING_CONTENT: ContentStructure = {
    SD: {
        '1': generatedContent,
        '2': generatedContent,
        '3': generatedContent,
        '4': generatedContent,
        '5': generatedContent,
        '6': generatedContent,
    },
    SMP: {
        'default': generatedContent
    }
};