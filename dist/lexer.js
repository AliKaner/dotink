"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
exports.tokenize = tokenize;
var TokenType;
(function (TokenType) {
    TokenType["AT_BOOK"] = "@BOOK";
    TokenType["AT_CHAPTER"] = "@CHAPTER";
    TokenType["AT_ENDCHAPTER"] = "@ENDCHAPTER";
    TokenType["AT_SCENE"] = "@SCENE";
    TokenType["AT_ENDSCENE"] = "@ENDSCENE";
    TokenType["AT_NOTES"] = "@NOTES";
    TokenType["AT_ENDNOTES"] = "@ENDNOTES";
    TokenType["AT_REVISION"] = "@REVISION";
    TokenType["AT_ENDREVISION"] = "@ENDREVISION";
    TokenType["KEY_TITLE"] = "TITLE:";
    TokenType["KEY_AUTHOR"] = "AUTHOR:";
    TokenType["KEY_GENRE"] = "GENRE:";
    TokenType["KEY_LANG"] = "LANG:";
    TokenType["KEY_VERSION"] = "VERSION:";
    TokenType["KEY_CREATED"] = "CREATED:";
    TokenType["KEY_UPDATED"] = "UPDATED:";
    TokenType["KEY_LOCATION"] = "LOCATION:";
    TokenType["KEY_TIME"] = "TIME:";
    TokenType["KEY_POV"] = "POV:";
    TokenType["KEY_MOOD"] = "MOOD:";
    TokenType["BLOCK_THOUGHT_START"] = "[[THOUGHT]]";
    TokenType["BLOCK_THOUGHT_END"] = "[[ENDTHOUGHT]]";
    TokenType["BLOCK_FLASHBACK_START"] = "[[FLASHBACK]]";
    TokenType["BLOCK_FLASHBACK_END"] = "[[ENDFLASHBACK]]";
    TokenType["BLOCK_DREAM_START"] = "[[DREAM]]";
    TokenType["BLOCK_DREAM_END"] = "[[ENDDREAM]]";
    TokenType["TEXT"] = "TEXT";
    TokenType["LIST_ITEM"] = "LIST_ITEM";
    TokenType["EMPTY_LINE"] = "EMPTY_LINE";
    TokenType["EOF"] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
const KEYS = [
    TokenType.KEY_TITLE, TokenType.KEY_AUTHOR, TokenType.KEY_GENRE,
    TokenType.KEY_LANG, TokenType.KEY_VERSION, TokenType.KEY_CREATED,
    TokenType.KEY_UPDATED, TokenType.KEY_LOCATION, TokenType.KEY_TIME,
    TokenType.KEY_POV, TokenType.KEY_MOOD
];
const BLOCKS = [
    TokenType.BLOCK_THOUGHT_START, TokenType.BLOCK_THOUGHT_END,
    TokenType.BLOCK_FLASHBACK_START, TokenType.BLOCK_FLASHBACK_END,
    TokenType.BLOCK_DREAM_START, TokenType.BLOCK_DREAM_END
];
function tokenize(input) {
    const lines = input.split(/\r?\n/);
    const tokens = [];
    const errors = [];
    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const lineNum = i + 1;
        // RULE: No line should exceed 120 characters
        if (rawLine.length > 120) {
            errors.push(`Line ${lineNum} exceeds 120 characters limit.`);
        }
        // RULE: No tab characters
        if (rawLine.includes('\t')) {
            errors.push(`Line ${lineNum} contains forbidden tab characters.`);
        }
        // RULE: No HTML (but allow our specific tags like <<FIX>>)
        if (/<[a-z][\s\S]*>/i.test(rawLine) && !(/<<\s*(?:FIX|IDEA|CHECK|VERIFY)\s*>>/i.test(rawLine))) {
            errors.push(`Line ${lineNum} contains forbidden HTML tags.`);
        }
        const line = rawLine.trim();
        if (line === '') {
            tokens.push({ type: TokenType.EMPTY_LINE, value: '', line: lineNum });
            continue;
        }
        let isMatched = false;
        // Check AT commands
        if (line.startsWith('@')) {
            const parts = line.split(' ');
            const cmd = parts[0];
            switch (cmd) {
                case TokenType.AT_BOOK:
                case TokenType.AT_ENDCHAPTER:
                case TokenType.AT_SCENE:
                case TokenType.AT_ENDSCENE:
                case TokenType.AT_NOTES:
                case TokenType.AT_ENDNOTES:
                case TokenType.AT_REVISION:
                case TokenType.AT_ENDREVISION:
                    tokens.push({ type: cmd, value: line, line: lineNum });
                    isMatched = true;
                    break;
                case TokenType.AT_CHAPTER:
                    tokens.push({ type: cmd, value: parts[1] || '', line: lineNum });
                    isMatched = true;
                    break;
                default:
                    errors.push(`Line ${lineNum}: Unknown command ${cmd}`);
            }
            if (isMatched)
                continue;
        }
        // Check Keywords
        for (const key of KEYS) {
            if (line.startsWith(key)) {
                tokens.push({ type: key, value: line.substring(key.length).trim(), line: lineNum });
                isMatched = true;
                break;
            }
        }
        if (isMatched)
            continue;
        // Check Blocks
        if (line.startsWith('[[')) {
            for (const block of BLOCKS) {
                if (line === block) {
                    tokens.push({ type: block, value: line, line: lineNum });
                    isMatched = true;
                    break;
                }
            }
            if (isMatched)
                continue;
        }
        // Check list items inside Notes / Revision
        if (line.startsWith('- ')) {
            // It might be text or a list item depending on context, parser will handle it, but we can tokenze it as list item
            tokens.push({ type: TokenType.LIST_ITEM, value: line.substring(2).trim(), line: lineNum });
            continue;
        }
        // Otherwise, text node
        tokens.push({ type: TokenType.TEXT, value: line, line: lineNum });
    }
    tokens.push({ type: TokenType.EOF, value: '', line: lines.length + 1 });
    return { tokens, errors };
}
