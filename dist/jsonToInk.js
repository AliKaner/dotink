"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonToInk = jsonToInk;
function jsonToInk(ast) {
    let result = '';
    const errors = [];
    try {
        if (!ast || ast.type !== 'BOOK') {
            errors.push('Root node must be a BOOK object');
            return { result, errors };
        }
        const book = ast;
        // Validate required metadata
        if (!book.metadata || !book.metadata.title || !book.metadata.author || !book.metadata.genre || !book.metadata.lang || !book.metadata.version || !book.metadata.created || !book.metadata.updated) {
            errors.push('BOOK metadata is missing required fields (title, author, genre, lang, version, created, updated)');
        }
        result += `@BOOK\n`;
        result += `TITLE: ${book.metadata?.title || ''}\n`;
        result += `AUTHOR: ${book.metadata?.author || ''}\n`;
        result += `GENRE: ${book.metadata?.genre || ''}\n`;
        result += `LANG: ${book.metadata?.lang || ''}\n`;
        result += `VERSION: ${book.metadata?.version || ''}\n`;
        result += `CREATED: ${book.metadata?.created || ''}\n`;
        result += `UPDATED: ${book.metadata?.updated || ''}\n\n`;
        function renderNode(node) {
            let r = '';
            if (node.type === 'TEXT') {
                r += node.content + '\n\n';
            }
            else if (node.type === 'THOUGHT') {
                r += `[[THOUGHT]]\n`;
                node.children.forEach(c => r += renderNode(c));
                r += `[[ENDTHOUGHT]]\n\n`;
            }
            else if (node.type === 'FLASHBACK') {
                r += `[[FLASHBACK]]\n`;
                node.children.forEach(c => r += renderNode(c));
                r += `[[ENDFLASHBACK]]\n\n`;
            }
            else if (node.type === 'DREAM') {
                r += `[[DREAM]]\n`;
                node.children.forEach(c => r += renderNode(c));
                r += `[[ENDDREAM]]\n\n`;
            }
            else if (node.type === 'SCENE') {
                const s = node;
                r += `@SCENE\n`;
                r += `LOCATION: ${s.location}\n`;
                r += `TIME: ${s.time}\n`;
                r += `POV: ${s.pov}\n`;
                r += `MOOD: ${s.mood}\n\n`;
                s.children?.forEach(c => r += renderNode(c));
                r += `@ENDSCENE\n\n`;
            }
            return r;
        }
        if (book.chapters) {
            book.chapters.forEach(c => {
                const ch = c;
                result += `@CHAPTER ${ch.number}\n`;
                result += `TITLE: ${ch.title}\n\n`;
                ch.children?.forEach(child => result += renderNode(child));
                result += `@ENDCHAPTER\n\n`;
            });
        }
        if (book.notes && book.notes.items && book.notes.items.length > 0) {
            result += `@NOTES\n\n`;
            book.notes.items.forEach(i => result += `- ${i}\n`);
            result += `\n@ENDNOTES\n\n`;
        }
        if (!book.revision || !book.revision.items || book.revision.items.length === 0) {
            errors.push('Missing @REVISION block (MANDATORY)');
        }
        else {
            result += `@REVISION\n\n`;
            book.revision.items.forEach(i => result += `- ${i}\n`);
            result += `\n@ENDREVISION\n`;
        }
    }
    catch (err) {
        errors.push(`JSON to INK Mapping Error: ${err.message}`);
    }
    // Remove trailing newlines and ensure exactly one at the end
    return { result: result.trim() + '\n', errors };
}
