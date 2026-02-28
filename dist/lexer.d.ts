export declare enum TokenType {
    AT_BOOK = "@BOOK",
    AT_CHAPTER = "@CHAPTER",
    AT_ENDCHAPTER = "@ENDCHAPTER",
    AT_SCENE = "@SCENE",
    AT_ENDSCENE = "@ENDSCENE",
    AT_NOTES = "@NOTES",
    AT_ENDNOTES = "@ENDNOTES",
    AT_REVISION = "@REVISION",
    AT_ENDREVISION = "@ENDREVISION",
    KEY_TITLE = "TITLE:",
    KEY_AUTHOR = "AUTHOR:",
    KEY_GENRE = "GENRE:",
    KEY_LANG = "LANG:",
    KEY_VERSION = "VERSION:",
    KEY_CREATED = "CREATED:",
    KEY_UPDATED = "UPDATED:",
    KEY_LOCATION = "LOCATION:",
    KEY_TIME = "TIME:",
    KEY_POV = "POV:",
    KEY_MOOD = "MOOD:",
    BLOCK_THOUGHT_START = "[[THOUGHT]]",
    BLOCK_THOUGHT_END = "[[ENDTHOUGHT]]",
    BLOCK_FLASHBACK_START = "[[FLASHBACK]]",
    BLOCK_FLASHBACK_END = "[[ENDFLASHBACK]]",
    BLOCK_DREAM_START = "[[DREAM]]",
    BLOCK_DREAM_END = "[[ENDDREAM]]",
    TEXT = "TEXT",
    LIST_ITEM = "LIST_ITEM",
    EMPTY_LINE = "EMPTY_LINE",
    EOF = "EOF"
}
export interface Token {
    type: TokenType;
    value: string;
    line: number;
}
export declare function tokenize(input: string): {
    tokens: Token[];
    errors: string[];
};
