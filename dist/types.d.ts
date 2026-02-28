export type InkNodeType = 'BOOK' | 'CHAPTER' | 'SCENE' | 'TEXT' | 'THOUGHT' | 'FLASHBACK' | 'DREAM' | 'NOTES' | 'REVISION';
export interface InkMetadata {
    title: string;
    author: string;
    genre: string;
    lang: string;
    version: string;
    created: string;
    updated: string;
}
export interface InkNode {
    type: InkNodeType;
    content?: string;
}
export interface InkTextNode extends InkNode {
    type: 'TEXT';
    content: string;
    formatting?: {
        bold?: boolean;
        italic?: boolean;
    };
    tags?: string[];
}
export interface InkBlockNode extends InkNode {
    type: 'THOUGHT' | 'FLASHBACK' | 'DREAM';
    children: InkNode[];
}
export interface InkScene extends InkNode {
    type: 'SCENE';
    location: string;
    time: string;
    pov: string;
    mood: string;
    children: InkNode[];
}
export interface InkChapter extends InkNode {
    type: 'CHAPTER';
    number: number;
    title: string;
    children: InkNode[];
}
export interface InkNotes extends InkNode {
    type: 'NOTES';
    items: string[];
}
export interface InkRevision extends InkNode {
    type: 'REVISION';
    items: string[];
}
export interface InkBook extends InkNode {
    type: 'BOOK';
    metadata: InkMetadata;
    chapters: InkChapter[];
    notes?: InkNotes;
    revision?: InkRevision;
}
export interface ParseResult {
    ast?: InkBook;
    errors: string[];
}
