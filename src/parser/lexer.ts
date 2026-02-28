export enum TokenType {
  AT_BOOK = '@BOOK',
  AT_CHAPTER = '@CHAPTER',
  AT_ENDCHAPTER = '@ENDCHAPTER',
  AT_SCENE = '@SCENE',
  AT_ENDSCENE = '@ENDSCENE',
  AT_NOTES = '@NOTES',
  AT_ENDNOTES = '@ENDNOTES',
  AT_REVISION = '@REVISION',
  AT_ENDREVISION = '@ENDREVISION',

  KEY_TITLE = 'TITLE:',
  KEY_AUTHOR = 'AUTHOR:',
  KEY_GENRE = 'GENRE:',
  KEY_LANG = 'LANG:',
  KEY_VERSION = 'VERSION:',
  KEY_CREATED = 'CREATED:',
  KEY_UPDATED = 'UPDATED:',

  KEY_LOCATION = 'LOCATION:',
  KEY_TIME = 'TIME:',
  KEY_POV = 'POV:',
  KEY_MOOD = 'MOOD:',

  BLOCK_THOUGHT_START = '[[THOUGHT]]',
  BLOCK_THOUGHT_END = '[[ENDTHOUGHT]]',
  BLOCK_FLASHBACK_START = '[[FLASHBACK]]',
  BLOCK_FLASHBACK_END = '[[ENDFLASHBACK]]',
  BLOCK_DREAM_START = '[[DREAM]]',
  BLOCK_DREAM_END = '[[ENDDREAM]]',

  TEXT = 'TEXT',
  LIST_ITEM = 'LIST_ITEM',
  EMPTY_LINE = 'EMPTY_LINE',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
}

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

export function tokenize(input: string): { tokens: Token[], errors: string[] } {
  const lines = input.split(/\r?\n/);
  const tokens: Token[] = [];
  const errors: string[] = [];

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
      const cmd = parts[0] as TokenType;
      
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
      if (isMatched) continue;
    }

    // Check Keywords
    for (const key of KEYS) {
      if (line.startsWith(key)) {
        tokens.push({ type: key, value: line.substring(key.length).trim(), line: lineNum });
        isMatched = true;
        break;
      }
    }
    if (isMatched) continue;

    // Check Blocks
    if (line.startsWith('[[')) {
      for (const block of BLOCKS) {
        if (line === block) {
          tokens.push({ type: block as TokenType, value: line, line: lineNum });
          isMatched = true;
          break;
        }
      }
      if (isMatched) continue;
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
