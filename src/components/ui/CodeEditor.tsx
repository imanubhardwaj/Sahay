"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string | number;
  placeholder?: string;
}

// Keywords and built-ins for different languages
const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  javascript: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "try", "catch", "finally", "throw",
    "class", "extends", "new", "this", "super", "import", "export", "default",
    "async", "await", "yield", "typeof", "instanceof", "in", "of", "true", "false", "null", "undefined"
  ],
  typescript: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "try", "catch", "finally", "throw",
    "class", "extends", "new", "this", "super", "import", "export", "default",
    "async", "await", "yield", "typeof", "instanceof", "in", "of", "true", "false", "null", "undefined",
    "interface", "type", "enum", "implements", "public", "private", "protected", "readonly", "abstract"
  ],
  python: [
    "def", "return", "if", "elif", "else", "for", "while", "break", "continue",
    "try", "except", "finally", "raise", "class", "import", "from", "as", "with",
    "lambda", "yield", "pass", "True", "False", "None", "and", "or", "not", "in", "is"
  ]
};

const BUILTIN_FUNCTIONS: Record<string, string[]> = {
  javascript: [
    "console", "log", "parseInt", "parseFloat", "Math", "JSON", "Array", "Object",
    "String", "Number", "Boolean", "Date", "Promise", "Map", "Set", "filter", "map",
    "reduce", "forEach", "find", "some", "every", "push", "pop", "shift", "unshift",
    "slice", "splice", "split", "join", "length", "toString", "stringify", "parse"
  ],
  typescript: [
    "console", "log", "parseInt", "parseFloat", "Math", "JSON", "Array", "Object",
    "String", "Number", "Boolean", "Date", "Promise", "Map", "Set", "filter", "map",
    "reduce", "forEach", "find", "some", "every", "push", "pop", "shift", "unshift",
    "slice", "splice", "split", "join", "length", "toString", "stringify", "parse"
  ],
  python: [
    "print", "len", "range", "str", "int", "float", "list", "dict", "set", "tuple",
    "input", "open", "read", "write", "append", "extend", "pop", "remove", "sort",
    "sorted", "reversed", "enumerate", "zip", "map", "filter", "sum", "min", "max"
  ]
};

interface Token {
  text: string;
  type: "keyword" | "builtin" | "string" | "comment" | "number" | "operator" | "function" | "bracket" | "plain";
}

// Tokenize code for syntax highlighting
function tokenizeLine(line: string, language: string): Token[] {
  const keywords = LANGUAGE_KEYWORDS[language] || LANGUAGE_KEYWORDS.javascript;
  const builtins = BUILTIN_FUNCTIONS[language] || BUILTIN_FUNCTIONS.javascript;
  const tokens: Token[] = [];
  
  let i = 0;
  while (i < line.length) {
    // Check for comments
    if (language === "python" && line[i] === "#") {
      tokens.push({ text: line.slice(i), type: "comment" });
      break;
    }
    if (line.slice(i, i + 2) === "//") {
      tokens.push({ text: line.slice(i), type: "comment" });
      break;
    }
    
    // Check for strings
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && (line[j] !== quote || line[j - 1] === "\\")) {
        j++;
      }
      tokens.push({ text: line.slice(i, j + 1), type: "string" });
      i = j + 1;
      continue;
    }
    
    // Check for numbers
    if (/\d/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) {
        j++;
      }
      tokens.push({ text: line.slice(i, j), type: "number" });
      i = j;
      continue;
    }
    
    // Check for identifiers (keywords, builtins, functions)
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) {
        j++;
      }
      const word = line.slice(i, j);
      
      // Check if it's a function call
      const isFunction = line[j] === "(";
      
      if (keywords.includes(word)) {
        tokens.push({ text: word, type: "keyword" });
      } else if (builtins.includes(word)) {
        tokens.push({ text: word, type: "builtin" });
      } else if (isFunction) {
        tokens.push({ text: word, type: "function" });
      } else {
        tokens.push({ text: word, type: "plain" });
      }
      i = j;
      continue;
    }
    
    // Check for operators
    if (/[+\-*/%=!<>&|^~?:]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[+\-*/%=!<>&|^~?:]/.test(line[j])) {
        j++;
      }
      tokens.push({ text: line.slice(i, j), type: "operator" });
      i = j;
      continue;
    }
    
    // Check for brackets
    if (/[()[\]{}]/.test(line[i])) {
      tokens.push({ text: line[i], type: "bracket" });
      i++;
      continue;
    }
    
    // Plain text (whitespace, punctuation, etc.)
    tokens.push({ text: line[i], type: "plain" });
    i++;
  }
  
  return tokens;
}

// Token color classes
const TOKEN_COLORS: Record<Token["type"], string> = {
  keyword: "text-purple-400",
  builtin: "text-cyan-400",
  string: "text-emerald-400",
  comment: "text-gray-500 italic",
  number: "text-orange-400",
  operator: "text-pink-400",
  function: "text-yellow-300",
  bracket: "text-gray-400",
  plain: "text-gray-200",
};

export function CodeEditor({ value, onChange, language, readOnly = false, height, placeholder }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [currentWord, setCurrentWord] = useState("");

  const allSuggestions = useMemo(() => {
    const keywords = LANGUAGE_KEYWORDS[language] || LANGUAGE_KEYWORDS.javascript;
    const builtins = BUILTIN_FUNCTIONS[language] || BUILTIN_FUNCTIONS.javascript;
    return [...new Set([...keywords, ...builtins])].sort();
  }, [language]);

  useEffect(() => {
    const lines = value.split("\n").length;
    setLineCount(lines);
  }, [value]);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current && lineNumbersRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const getCurrentWord = useCallback((text: string, position: number) => {
    const beforeCursor = text.substring(0, position);
    const match = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    return match ? match[0] : "";
  }, []);

  const getCursorCoordinates = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { top: 0, left: 0 };

    const text = textarea.value;
    const position = textarea.selectionStart;
    const lines = text.substring(0, position).split("\n");
    const lineNumber = lines.length;
    const charInLine = lines[lines.length - 1].length;

    return {
      top: lineNumber * 24 + 40,
      left: Math.min(charInLine * 8 + 60, 250)
    };
  }, []);

  const updateSuggestions = useCallback((text: string, position: number) => {
    const word = getCurrentWord(text, position);
    setCurrentWord(word);

    if (word.length >= 2 && !readOnly) {
      const filtered = allSuggestions.filter(s => 
        s.toLowerCase().startsWith(word.toLowerCase()) && s.toLowerCase() !== word.toLowerCase()
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(filtered.length > 0);
      setSuggestionIndex(0);
      setCursorPosition(getCursorCoordinates());
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [allSuggestions, getCurrentWord, getCursorCoordinates, readOnly]);

  const applySuggestion = useCallback((suggestion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const position = textarea.selectionStart;
    const beforeWord = value.substring(0, position - currentWord.length);
    const afterCursor = value.substring(position);
    
    const newValue = beforeWord + suggestion + afterCursor;
    onChange(newValue);
    
    setShowSuggestions(false);
    
    setTimeout(() => {
      const newPosition = beforeWord.length + suggestion.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  }, [value, currentWord, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex(i => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex(i => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        applySuggestion(suggestions[suggestionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === "Tab" && !showSuggestions) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      
      onChange(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    updateSuggestions(newValue, e.target.selectionStart);
  };

  const handleClick = () => {
    setShowSuggestions(false);
  };

  const getLanguageLabel = () => {
    switch (language) {
      case "javascript": return "JAVASCRIPT";
      case "python": return "PYTHON";
      case "typescript": return "TYPESCRIPT";
      default: return "CODE";
    }
  };

  const getLanguageColor = () => {
    switch (language) {
      case "javascript": return "bg-yellow-400";
      case "python": return "bg-blue-400";
      case "typescript": return "bg-blue-500";
      default: return "bg-gray-400";
    }
  };

  const containerStyle = height === "auto" 
    ? { minHeight: "100px" } 
    : typeof height === "number" 
    ? { height: `${height}px` } 
    : height 
    ? { height } 
    : {};

  // Render highlighted code as React elements
  const renderHighlightedCode = useMemo(() => {
    if (!value) {
      return <span className="text-gray-600">{placeholder || ""}</span>;
    }
    
    const lines = value.split("\n");
    return lines.map((line, lineIndex) => {
      const tokens = tokenizeLine(line, language);
      return (
        <div key={lineIndex} className="h-6 leading-6">
          {tokens.length === 0 ? (
            <span>&nbsp;</span>
          ) : (
            tokens.map((token, tokenIndex) => (
              <span key={tokenIndex} className={TOKEN_COLORS[token.type]}>
                {token.text}
              </span>
            ))
          )}
        </div>
      );
    });
  }, [value, language, placeholder]);

  return (
    <div className={`${height === "auto" ? "" : "h-full"} flex flex-col bg-[#1e1e1e] font-mono text-sm relative`} style={containerStyle}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27ca41]" />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getLanguageColor()}`} />
            <span className="text-xs font-semibold text-gray-400">
              {getLanguageLabel()}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {readOnly ? "Read-only" : ""}
        </span>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-[#1e1e1e] text-gray-600 text-right pr-3 py-4 overflow-hidden select-none border-r border-[#3c3c3c] flex-shrink-0"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="leading-6 h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax Highlighted Layer */}
          <div
            ref={highlightRef}
            className="absolute inset-0 p-4 overflow-auto pointer-events-none whitespace-pre"
            style={{ tabSize: 2 }}
          >
            {renderHighlightedCode}
          </div>
          
          {/* Textarea (invisible but interactive) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            readOnly={readOnly}
            spellCheck={false}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white p-4 resize-none outline-none leading-6 overflow-auto font-mono"
            style={{
              caretColor: "#fff",
              tabSize: 2,
            }}
          />

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              className="absolute z-50 bg-[#252526] border border-[#454545] rounded-lg shadow-2xl overflow-hidden min-w-44"
              style={{
                top: cursorPosition.top,
                left: cursorPosition.left,
              }}
            >
              <div className="px-3 py-1.5 text-[10px] text-gray-500 border-b border-[#3c3c3c] uppercase tracking-wider">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  onClick={() => applySuggestion(suggestion)}
                  className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm ${
                    index === suggestionIndex
                      ? "bg-[#094771] text-white"
                      : "text-gray-300 hover:bg-[#2a2d2e]"
                  }`}
                >
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                    LANGUAGE_KEYWORDS[language]?.includes(suggestion) 
                      ? "bg-purple-500/30 text-purple-300" 
                      : "bg-cyan-500/30 text-cyan-300"
                  }`}>
                    {LANGUAGE_KEYWORDS[language]?.includes(suggestion) ? "K" : "F"}
                  </span>
                  <span>{suggestion}</span>
                  {index === suggestionIndex && (
                    <span className="ml-auto text-[10px] text-gray-500">Tab</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
