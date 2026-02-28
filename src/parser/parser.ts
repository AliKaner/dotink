import { Token, TokenType, tokenize } from './lexer';
import { InkBook, InkChapter, InkScene, InkNode, ParseResult, InkBlockNode, InkNotes, InkRevision, InkTextNode } from './types';

export function parseInk(input: string): ParseResult {
  const { tokens, errors } = tokenize(input);
  let currentTokenIdx = 0;

  function advance(): Token {
    const token = tokens[currentTokenIdx];
    currentTokenIdx++;
    return token;
  }

  function peek(): Token {
    return tokens[currentTokenIdx];
  }

  function match(type: TokenType): boolean {
    if (peek().type === type) {
      advance();
      return true;
    }
    return false;
  }

  function consume(type: TokenType, errorMsg: string): Token | null {
    if (peek().type === type) return advance();
    errors.push(`Parse Error Line ${peek().line}: ${errorMsg}. Expected ${type}, got ${peek().type}`);
    return null;
  }

  const result: ParseResult = { errors };

  // Parse @BOOK Header
  if (!match(TokenType.AT_BOOK)) {
    errors.push('File must start with @BOOK');
    return result;
  }

  const title = consume(TokenType.KEY_TITLE, 'Missing TITLE in header')?.value || '';
  const author = consume(TokenType.KEY_AUTHOR, 'Missing AUTHOR in header')?.value || '';
  const genre = consume(TokenType.KEY_GENRE, 'Missing GENRE in header')?.value || '';
  const lang = consume(TokenType.KEY_LANG, 'Missing LANG in header')?.value || '';
  const version = consume(TokenType.KEY_VERSION, 'Missing VERSION in header')?.value || '';
  const created = consume(TokenType.KEY_CREATED, 'Missing CREATED in header')?.value || '';
  const updated = consume(TokenType.KEY_UPDATED, 'Missing UPDATED in header')?.value || '';

  const book: InkBook = {
    type: 'BOOK',
    metadata: { title, author, genre, lang, version, created, updated },
    chapters: []
  };

  result.ast = book;

  function parseTextNode(token: Token): InkTextNode {
    const content = token.value;
    const formatting: any = {};
    const tags: string[] = [];

    // Parse specific tags and formatting here...
    const tagRegex = /<<([^>]+)>>/g;
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    if (/\*\*(.*?)\*\*/.test(content)) formatting.bold = true;
    if (/\*(.*?)\*/.test(content) && !formatting.bold) formatting.italic = true;

    return { type: 'TEXT', content, formatting, tags };
  }

  function parseContentBlocks(stopTokens: TokenType[]): InkNode[] {
    const nodes: InkNode[] = [];
    while (peek().type !== TokenType.EOF && !stopTokens.includes(peek().type)) {
      const type = peek().type;
      
      if (type === TokenType.EMPTY_LINE) {
        advance();
        continue;
      }

      if (type === TokenType.TEXT) {
        nodes.push(parseTextNode(advance()));
        continue;
      }

      if (type === TokenType.LIST_ITEM) {
        nodes.push({ type: 'TEXT', content: '- ' + advance().value });
        continue;
      }

      const isBlock = [TokenType.BLOCK_THOUGHT_START, TokenType.BLOCK_DREAM_START, TokenType.BLOCK_FLASHBACK_START].includes(type);
      if (isBlock) {
        const startToken = advance();
        const blockType = startToken.type === TokenType.BLOCK_THOUGHT_START ? 'THOUGHT' : 
                          startToken.type === TokenType.BLOCK_DREAM_START ? 'DREAM' : 'FLASHBACK';
        const endTypePattern = startToken.type === TokenType.BLOCK_THOUGHT_START ? TokenType.BLOCK_THOUGHT_END : 
                          startToken.type === TokenType.BLOCK_DREAM_START ? TokenType.BLOCK_DREAM_END : TokenType.BLOCK_FLASHBACK_END;
        
        const children = parseContentBlocks([endTypePattern, TokenType.EOF]);
        consume(endTypePattern, `Missing end block for ${blockType}`);
        nodes.push({ type: blockType, children } as InkBlockNode);
        continue;
      }

      // If scene is encountered inside content, that's fine
      if (type === TokenType.AT_SCENE) {
        nodes.push(parseScene());
        continue;
      }

      advance(); // Consume unknown
    }
    return nodes;
  }

  function parseScene(): InkScene {
    consume(TokenType.AT_SCENE, 'Expected @SCENE');
    const location = consume(TokenType.KEY_LOCATION, 'Missing LOCATION for scene')?.value || '';
    const time = consume(TokenType.KEY_TIME, 'Missing TIME for scene')?.value || '';
    const pov = consume(TokenType.KEY_POV, 'Missing POV for scene')?.value || '';
    const mood = consume(TokenType.KEY_MOOD, 'Missing MOOD for scene')?.value || '';

    const children = parseContentBlocks([TokenType.AT_ENDSCENE, TokenType.EOF]);
    consume(TokenType.AT_ENDSCENE, 'Missing @ENDSCENE');

    return { type: 'SCENE', location, time, pov, mood, children };
  }

  function parseChapter(): InkChapter {
    const chapterStart = consume(TokenType.AT_CHAPTER, 'Expected @CHAPTER');
    const chapterNum = parseInt(chapterStart?.value || '0', 10);
    const chapterTitle = consume(TokenType.KEY_TITLE, 'Missing TITLE for chapter')?.value || '';

    const children = parseContentBlocks([TokenType.AT_ENDCHAPTER, TokenType.EOF]);
    consume(TokenType.AT_ENDCHAPTER, 'Missing @ENDCHAPTER');

    return { type: 'CHAPTER', number: chapterNum, title: chapterTitle, children };
  }

  while (peek().type !== TokenType.EOF) {
    const type = peek().type;
    
    if (type === TokenType.EMPTY_LINE) advance();
    else if (type === TokenType.AT_CHAPTER) book.chapters.push(parseChapter());
    else if (type === TokenType.AT_NOTES) {
      advance();
      const items: string[] = [];
      while (peek().type !== TokenType.AT_ENDNOTES && peek().type !== TokenType.EOF) {
        const t = advance();
        if (t.type === TokenType.LIST_ITEM) items.push(t.value);
        else if (t.type !== TokenType.EMPTY_LINE) items.push(t.value);
      }
      consume(TokenType.AT_ENDNOTES, 'Missing @ENDNOTES');
      book.notes = { type: 'NOTES', items };
    }
    else if (type === TokenType.AT_REVISION) {
      advance();
      const items: string[] = [];
      while (peek().type !== TokenType.AT_ENDREVISION && peek().type !== TokenType.EOF) {
        const t = advance();
        if (t.type === TokenType.LIST_ITEM) items.push(t.value);
        else if (t.type !== TokenType.EMPTY_LINE) items.push(t.value);
      }
      consume(TokenType.AT_ENDREVISION, 'Missing @ENDREVISION');
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
