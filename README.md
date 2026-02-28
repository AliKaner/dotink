# INK Format Parser & Documentation Site

A parser, lexer, and live documentation playground for the **INK FORMAT v1.0** specification.

## Features
- **Strict Parsing**: Enforces rules like maximum 120 characters per line, mandatory headers (`@BOOK`, `@REVISION`), and no HTML.
- **AST Generation**: Converts raw `.ink` files into a strongly typed Abstract Syntax Tree (AST).
- **Interactive Playground**: A Next.js web application to test `.ink` files in real-time.

## The `.ink` Format Specification

The `.ink` format is a strict plain-text format designed for writing stories and structured documents.

### Rules:
- **Encoding**: UTF-8 plain text only.
- **No HTML, Emojis, or Special Fonts**.
- **Line Length**: Max 120 characters per line.
- **Headers**: Must start with `@BOOK` and include metadata (TITLE, AUTHOR, etc.).
- **Revisions**: Must end with a `@REVISION` block.
- **Blocks**: Supports `[[THOUGHT]]`, `[[FLASHBACK]]`, and `[[DREAM]]`.
- **Tags**: Supports internal tags like `<<FIX>>`, `<<IDEA>>`, `<<CHECK>>`.

### Example
See `src/examples/dark-path.ink`.

## Getting Started

First, install the dependencies:
```bash
npm install
```

Run the parser tests:
```bash
npx tsx src/parser/test.ts
```

Run the development server for the Playground:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
