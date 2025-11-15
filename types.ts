import React from 'react';

export type Level = 'SD' | 'SMP';
export type Grade = '1' | '2' | '3' | '4' | '5' | '6';

export interface Subject {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    imageUrl?: string;
}