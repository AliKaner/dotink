'use client';

import { useState } from 'react';
import { parseInk, ParseResult, jsonToInk } from '../parser/index';

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

type Mode = 'INK_TO_JSON' | 'JSON_TO_INK';

export default function Home() {
  const [mode, setMode] = useState<Mode>('INK_TO_JSON');
  
  // INK to JSON State
  const [inkText, setInkText] = useState(DEFAULT_INK);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  // JSON to INK State
  const [jsonText, setJsonText] = useState('{\n  "type": "BOOK",\n  "metadata": {\n    "title": "New Story",\n    "author": "Author",\n    "genre": "Fiction",\n    "lang": "English",\n    "version": "1.0",\n    "created": "2026-02-28",\n    "updated": "2026-02-28"\n  },\n  "chapters": [],\n  "revision": {\n    "type": "REVISION",\n    "items": [\n      "v1.0 First Draft"\n    ]\n  }\n}');
  const [exportResult, setExportResult] = useState<{ result: string; errors: string[] } | null>(null);

  const handleParse = () => {
    const res = parseInk(inkText);
    setParseResult(res);
  };

  const handleExport = () => {
    try {
      const ast = JSON.parse(jsonText);
      const res = jsonToInk(ast);
      setExportResult(res);
    } catch (e) {
      setExportResult({ result: '', errors: ['Invalid JSON format: ' + (e as Error).message] });
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-mono">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-teal-400 tracking-tight mb-2">INK FORMAT v1.0</h1>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          The strict, fast, plain-text syntax for writing structured stories and documents.
        </p>

        <div className="inline-flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button 
            onClick={() => setMode('INK_TO_JSON')}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-bold \${mode === 'INK_TO_JSON' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            INK to AST
          </button>
          <button 
            onClick={() => setMode('JSON_TO_INK')}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-bold \${mode === 'JSON_TO_INK' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            AST to INK Export
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ========================================================= */}
        {/* INK -> JSON MODE */}
        {/* ========================================================= */}
        {mode === 'INK_TO_JSON' && (
          <>
            {/* Editor Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
                <h2 className="text-sm font-semibold tracking-wide text-slate-300">EDITOR (.ink)</h2>
                <div className="flex gap-2">
                  <button
                     onClick={() => downloadFile('story.ink', inkText)}
                     className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-1 px-4 rounded text-sm transition-colors"
                  >
                     Save .ink
                  </button>
                  <button
                    onClick={handleParse}
                    className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-1 px-4 rounded text-sm transition-colors"
                  >
                    Validate & Parse
                  </button>
                </div>
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
              
              {/* Validation Errors */}
              {parseResult && parseResult.errors.length > 0 && (
                <div className="p-4 rounded-xl border shadow-lg bg-rose-950/30 border-rose-900">
                  <h2 className="text-lg font-bold mb-2 text-rose-400">
                    Validation Errors
                  </h2>
                  <ul className="list-disc list-inside text-rose-300 space-y-1 text-sm">
                    {parseResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AST Viewer */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                  <h2 className="text-sm font-semibold tracking-wide text-slate-300">ABSTRACT SYNTAX TREE (AST)</h2>
                  {parseResult?.ast && parseResult.errors.length === 0 && (
                     <button
                        onClick={() => downloadFile('ast.json', JSON.stringify(parseResult.ast, null, 2))}
                        className="text-teal-400 hover:text-teal-300 text-sm font-semibold"
                     >
                        Export JSON
                     </button>
                  )}
                </div>
                <div className="p-4 overflow-auto flex-1 h-[400px]">
                  {parseResult?.ast ? (
                    <pre className="text-xs text-slate-400 whitespace-pre-wrap word-break">
                      {JSON.stringify(parseResult.ast, null, 2)}
                    </pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                      Click 'Validate & Parse' to generate AST
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* JSON -> INK MODE */}
        {/* ========================================================= */}
        {mode === 'JSON_TO_INK' && (
          <>
            {/* Editor Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
                <h2 className="text-sm font-semibold tracking-wide text-slate-300">AST JSON EDITOR (.json)</h2>
                <button
                  onClick={handleExport}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-1 px-4 rounded text-sm transition-colors"
                >
                  Generate .ink
                </button>
              </div>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="flex-1 w-full bg-slate-900 text-slate-300 p-4 resize-none focus:outline-none placeholder-slate-600 min-h-[500px]"
                spellCheck="false"
              />
            </div>

            {/* Output Section */}
            <div className="flex flex-col gap-6">
              
              {/* Validation Errors */}
              {exportResult && exportResult.errors.length > 0 && (
                <div className="p-4 rounded-xl border shadow-lg bg-rose-950/30 border-rose-900">
                  <h2 className="text-lg font-bold mb-2 text-rose-400">
                    AST Validation Errors
                  </h2>
                  <ul className="list-disc list-inside text-rose-300 space-y-1 text-sm">
                    {exportResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* INK Viewer */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-wide text-slate-300">GENERATED INK FORMAT (.ink)</h2>
                  {exportResult?.result && exportResult.errors.length === 0 && (
                     <button
                        onClick={() => downloadFile('exported.ink', exportResult.result)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
                     >
                        Download .ink File
                     </button>
                  )}
                </div>
                <div className="p-4 overflow-auto flex-1 h-[400px]">
                  {exportResult?.result && exportResult.errors.length === 0 ? (
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap word-break font-mono">
                      {exportResult.result}
                    </pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 text-sm text-center px-8">
                      {exportResult?.errors.length ? 'Fix the AST JSON errors to generate the format.' : "Click 'Generate .ink' to build the file from JSON AST"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
