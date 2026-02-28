'use client';

import { useState } from 'react';
import { parseInk, ParseResult } from '../parser/index';

const DEFAULT_INK = `@BOOK
TITLE: The Dark Mansion
AUTHOR: John Doe
GENRE: Mystery
LANG: English
VERSION: 1.0
CREATED: 2026-02-28
UPDATED: 2026-02-28

@CHAPTER 1
TITLE: The Arrival

@SCENE
LOCATION: The Dark Mansion
TIME: Evening
POV: First Person
MOOD: Eerie

The mansion loomed ahead, its windows like empty eyes staring at me.

<<IDEA>> Maybe the windows could be described as glowing?

[[THOUGHT]]
I should turn back. Nothing good can come from this place.
[[ENDTHOUGHT]]

@ENDSCENE
@ENDCHAPTER

@REVISION
- v1.0 Initial Draft
@ENDREVISION`;

export default function Home() {
  const [inkText, setInkText] = useState(DEFAULT_INK);
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleParse = () => {
    const res = parseInk(inkText);
    setResult(res);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-mono">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-teal-400 tracking-tight mb-2">INK FORMAT v1.0</h1>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          The strict, fast, plain-text syntax for writing structured stories and documents.
        </p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
            <h2 className="text-sm font-semibold tracking-wide text-slate-300">EDITOR (.ink)</h2>
            <button
              onClick={handleParse}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-1 px-4 rounded text-sm transition-colors"
            >
              Parse
            </button>
          </div>
          <textarea
            value={inkText}
            onChange={(e) => setInkText(e.target.value)}
            className="flex-1 w-full bg-slate-900 text-slate-300 p-4 resize-none focus:outline-none placeholder-slate-600 min-h-[500px]"
            spellCheck="false"
          />
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-6">
          
          {/* Validation Result */}
          {result && (
            <div className={`p-4 rounded-xl border shadow-lg \${result.errors.length > 0 ? 'bg-rose-950/30 border-rose-900' : 'bg-teal-950/30 border-teal-900'}`}>
              <h2 className={`text-lg font-bold mb-2 \${result.errors.length > 0 ? 'text-rose-400' : 'text-teal-400'}`}>
                {result.errors.length > 0 ? 'Validation Errors' : 'Success! Valid INK Format'}
              </h2>
              {result.errors.length > 0 ? (
                <ul className="list-disc list-inside text-rose-300 space-y-1 text-sm">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-teal-300 text-sm">The document strictly follows the INK FORMAT v1.0 specification.</p>
              )}
            </div>
          )}

          {/* AST Viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
              <h2 className="text-sm font-semibold tracking-wide text-slate-300">ABSTRACT SYNTAX TREE (AST)</h2>
            </div>
            <div className="p-4 overflow-auto flex-1 h-[400px]">
              {result?.ast ? (
                <pre className="text-xs text-slate-400 whitespace-pre-wrap word-break">
                  {JSON.stringify(result.ast, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                  Click 'Parse' to generate AST
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
