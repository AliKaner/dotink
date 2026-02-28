"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInk = parseInk;
const lexer_1 = require("./lexer");
function parseInk(input) {
    const { tokens, errors } = (0, lexer_1.tokenize)(input);
    let currentTokenIdx = 0;
    function advance() {
        const token = tokens[currentTokenIdx];
        currentTokenIdx++;
        return token;
    }
    function peek() {
        return tokens[currentTokenIdx];
    }
    function match(type) {
        if (peek().type === type) {
            advance();
            return true;
        }
        return false;
    }
    function consume(type, errorMsg) {
        if (peek().type === type)
            return advance();
        errors.push(`Parse Error Line ${peek().line}: ${errorMsg}. Expected ${type}, got ${peek().type}`);
        return null;
    }
    const result = { errors };
    // Parse @BOOK Header
    if (!match(lexer_1.TokenType.AT_BOOK)) {
        errors.push('File must start with @BOOK');
        return result;
    }
    const title = consume(lexer_1.TokenType.KEY_TITLE, 'Missing TITLE in header')?.value || '';
    const author = consume(lexer_1.TokenType.KEY_AUTHOR, 'Missing AUTHOR in header')?.value || '';
    const genre = consume(lexer_1.TokenType.KEY_GENRE, 'Missing GENRE in header')?.value || '';
    const lang = consume(lexer_1.TokenType.KEY_LANG, 'Missing LANG in header')?.value || '';
    const version = consume(lexer_1.TokenType.KEY_VERSION, 'Missing VERSION in header')?.value || '';
    const created = consume(lexer_1.TokenType.KEY_CREATED, 'Missing CREATED in header')?.value || '';
    const updated = consume(lexer_1.TokenType.KEY_UPDATED, 'Missing UPDATED in header')?.value || '';
    const book = {
        type: 'BOOK',
        metadata: { title, author, genre, lang, version, created, updated },
        chapters: []
    };
    result.ast = book;
    function parseTextNode(token) {
        const content = token.value;
        const formatting = {};
        const tags = [];
        // Parse specific tags and formatting here...
        const tagRegex = /<<([^>]+)>>/g;
        let match;
        while ((match = tagRegex.exec(content)) !== null) {
            tags.push(match[1]);
        }
        if (/\*\*(.*?)\*\*/.test(content))
            formatting.bold = true;
        if (/\*(.*?)\*/.test(content) && !formatting.bold)
            formatting.italic = true;
        return { type: 'TEXT', content, formatting, tags };
    }
    function parseContentBlocks(stopTokens) {
        const nodes = [];
        while (peek().type !== lexer_1.TokenType.EOF && !stopTokens.includes(peek().type)) {
            const type = peek().type;
            if (type === lexer_1.TokenType.EMPTY_LINE) {
                advance();
                continue;
            }
            if (type === lexer_1.TokenType.TEXT) {
                nodes.push(parseTextNode(advance()));
                continue;
            }
            if (type === lexer_1.TokenType.LIST_ITEM) {
                nodes.push({ type: 'TEXT', content: '- ' + advance().value });
                continue;
            }
            const isBlock = [lexer_1.TokenType.BLOCK_THOUGHT_START, lexer_1.TokenType.BLOCK_DREAM_START, lexer_1.TokenType.BLOCK_FLASHBACK_START].includes(type);
            if (isBlock) {
                const startToken = advance();
                const blockType = startToken.type === lexer_1.TokenType.BLOCK_THOUGHT_START ? 'THOUGHT' :
                    startToken.type === lexer_1.TokenType.BLOCK_DREAM_START ? 'DREAM' : 'FLASHBACK';
                const endTypePattern = startToken.type === lexer_1.TokenType.BLOCK_THOUGHT_START ? lexer_1.TokenType.BLOCK_THOUGHT_END :
                    startToken.type === lexer_1.TokenType.BLOCK_DREAM_START ? lexer_1.TokenType.BLOCK_DREAM_END : lexer_1.TokenType.BLOCK_FLASHBACK_END;
                const children = parseContentBlocks([endTypePattern, lexer_1.TokenType.EOF]);
                consume(endTypePattern, `Missing end block for ${blockType}`);
                nodes.push({ type: blockType, children });
                continue;
            }
            // If scene is encountered inside content, that's fine
            if (type === lexer_1.TokenType.AT_SCENE) {
                nodes.push(parseScene());
                continue;
            }
            advance(); // Consume unknown
        }
        return nodes;
    }
    function parseScene() {
        consume(lexer_1.TokenType.AT_SCENE, 'Expected @SCENE');
        const location = consume(lexer_1.TokenType.KEY_LOCATION, 'Missing LOCATION for scene')?.value || '';
        const time = consume(lexer_1.TokenType.KEY_TIME, 'Missing TIME for scene')?.value || '';
        const pov = consume(lexer_1.TokenType.KEY_POV, 'Missing POV for scene')?.value || '';
        const mood = consume(lexer_1.TokenType.KEY_MOOD, 'Missing MOOD for scene')?.value || '';
        const children = parseContentBlocks([lexer_1.TokenType.AT_ENDSCENE, lexer_1.TokenType.EOF]);
        consume(lexer_1.TokenType.AT_ENDSCENE, 'Missing @ENDSCENE');
        return { type: 'SCENE', location, time, pov, mood, children };
    }
    function parseChapter() {
        const chapterStart = consume(lexer_1.TokenType.AT_CHAPTER, 'Expected @CHAPTER');
        const chapterNum = parseInt(chapterStart?.value || '0', 10);
        const chapterTitle = consume(lexer_1.TokenType.KEY_TITLE, 'Missing TITLE for chapter')?.value || '';
        const children = parseContentBlocks([lexer_1.TokenType.AT_ENDCHAPTER, lexer_1.TokenType.EOF]);
        consume(lexer_1.TokenType.AT_ENDCHAPTER, 'Missing @ENDCHAPTER');
        return { type: 'CHAPTER', number: chapterNum, title: chapterTitle, children };
    }
    while (peek().type !== lexer_1.TokenType.EOF) {
        const type = peek().type;
        if (type === lexer_1.TokenType.EMPTY_LINE)
            advance();
        else if (type === lexer_1.TokenType.AT_CHAPTER)
            book.chapters.push(parseChapter());
        else if (type === lexer_1.TokenType.AT_NOTES) {
            advance();
            const items = [];
            while (peek().type !== lexer_1.TokenType.AT_ENDNOTES && peek().type !== lexer_1.TokenType.EOF) {
                const t = advance();
                if (t.type === lexer_1.TokenType.LIST_ITEM)
                    items.push(t.value);
                else if (t.type !== lexer_1.TokenType.EMPTY_LINE)
                    items.push(t.value);
            }
            consume(lexer_1.TokenType.AT_ENDNOTES, 'Missing @ENDNOTES');
            book.notes = { type: 'NOTES', items };
        }
        else if (type === lexer_1.TokenType.AT_REVISION) {
            advance();
            const items = [];
            while (peek().type !== lexer_1.TokenType.AT_ENDREVISION && peek().type !== lexer_1.TokenType.EOF) {
                const t = advance();
                if (t.type === lexer_1.TokenType.LIST_ITEM)
                    items.push(t.value);
                else if (t.type !== lexer_1.TokenType.EMPTY_LINE)
                    items.push(t.value);
            }
            consume(lexer_1.TokenType.AT_ENDREVISION, 'Missing @ENDREVISION');
            book.revision = { type: 'REVISION', items };
        }
        else {
            advance();
        }
    }
    if (!book.revision && !errors.includes('Missing @REVISION block (MANDATORY)')) {
        errors.push('Missing @REVISION block (MANDATORY)');
    }
    return result;
}
