
import { Level, Grade, Subject } from './types';
import {
    BookIcon, LanguageIcon, PEIcon, HistoryIcon, ReligionIcon, EnglishIcon
} from './components/IconComponents';

const fadelSubjectsBase: Omit<Subject, 'id'>[] = [
    { name: 'SKI', icon: HistoryIcon },
    { name: 'Akhlak', icon: ReligionIcon },
    { name: 'Fikih', icon: ReligionIcon },
    { name: 'Al-Qur\'an Hadist', icon: BookIcon },
    { name: 'Bahasa Indonesia', icon: LanguageIcon },
    { name: 'PJOK', icon: PEIcon },
];

const fadelSubjectsWithEnglish: Omit<Subject, 'id'>[] = [
    { name: 'SKI', icon: HistoryIcon },
    { name: 'Akhlak', icon: ReligionIcon },
    { name: 'Fikih', icon: ReligionIcon },
    { name: 'Al-Qur\'an Hadist', icon: BookIcon },
    { name: 'Bahasa Indonesia', icon: LanguageIcon },
    { name: 'Bahasa Inggris', icon: EnglishIcon },
    { name: 'PJOK', icon: PEIcon },
];


const generateSubjectsWithIds = (subjects: Omit<Subject, 'id'>[]): Subject[] => 
    subjects.map(s => ({ ...s, id: s.name.toLowerCase().replace(/\s/g, '-').replace(/'/g, '') }));

export const SUBJECTS_BY_LEVEL_AND_GRADE: Record<Level, Record<Grade | 'default', Subject[]>> = {
    SD: {
        '1': generateSubjectsWithIds(fadelSubjectsBase),
        '2': generateSubjectsWithIds(fadelSubjectsBase),
        '3': generateSubjectsWithIds(fadelSubjectsBase),
        '4': generateSubjectsWithIds(fadelSubjectsWithEnglish),
        '5': generateSubjectsWithIds(fadelSubjectsWithEnglish),
        '6': generateSubjectsWithIds(fadelSubjectsWithEnglish),
        'default': []
    },
    SMP: {
        'default': generateSubjectsWithIds(fadelSubjectsWithEnglish),
        '1': [], '2': [], '3': [], '4': [], '5': [], '6': []
    }
};
