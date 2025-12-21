"use client";

import { useEffect, useState, ReactElement } from "react";
import { CodeEditor } from "./CodeEditor";

interface LessonContentRendererProps {
  content: string;
  topics?: string[];
}

export default function LessonContentRenderer({
  content,
  topics = [],
}: LessonContentRendererProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-800 rounded w-full"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        <div className="h-32 bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  let codeBlockIndex = 0;

  // Parse markdown-like content
  const parseContent = (text: string) => {
    const lines = text.split("\n");
    const elements: ReactElement[] = [];
    let currentCodeBlock: string[] = [];
    let currentCodeLanguage = "";
    let inCodeBlock = false;
    let listItems: string[] = [];
    let inList = false;
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key++} className="my-5 space-y-2.5">
            {listItems.map((item, idx) => {
              const itemText = item.trim().replace(/^[-*]\s+/, "");
              const boldParts = itemText.split(/(\*\*[^*]+\*\*)/);
              return (
                <li key={idx} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                  <span className="flex-shrink-0 w-1 h-1 bg-gray-500 rounded-full mt-2.5" />
                  <span className="text-sm">
                    {boldParts.map((part, pIdx) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={pIdx} className="font-semibold text-white">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    const flushCodeBlock = () => {
      if (currentCodeBlock.length > 0) {
        const code = currentCodeBlock.join("\n").replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");
        const lang = currentCodeLanguage || "javascript";
        const currentIndex = codeBlockIndex++;
        
        elements.push(
          <div key={key++} className="my-6 rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                </div>
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{lang}</span>
              </div>
              <button
                onClick={() => handleCopy(code, currentIndex)}
                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800 cursor-pointer"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto">
              <CodeEditor
                value={code}
                onChange={() => {}}
                language={lang}
                readOnly={true}
                height="auto"
              />
            </div>
          </div>
        );
        currentCodeBlock = [];
        currentCodeLanguage = "";
      }
      inCodeBlock = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Code block detection
      if (trimmedLine.startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          flushList();
          inCodeBlock = true;
          currentCodeLanguage = trimmedLine.replace(/```/, "").trim() || "javascript";
        }
        continue;
      }

      if (inCodeBlock) {
        currentCodeBlock.push(line);
        continue;
      }

      // Headings with clean styling
      if (trimmedLine.startsWith("# ")) {
        flushList();
        const headingText = trimmedLine.replace(/^#+\s+/, "");
        elements.push(
          <h1 key={key++} className="text-2xl font-bold text-white mt-10 mb-4 first:mt-0 tracking-tight">
            {headingText}
          </h1>
        );
        continue;
      }
      if (trimmedLine.startsWith("## ")) {
        flushList();
        const headingText = trimmedLine.replace(/^#+\s+/, "");
        elements.push(
          <h2 key={key++} className="text-xl font-bold text-white mt-8 mb-3 tracking-tight">
            {headingText}
          </h2>
        );
        continue;
      }
      if (trimmedLine.startsWith("### ")) {
        flushList();
        const headingText = trimmedLine.replace(/^#+\s+/, "");
        elements.push(
          <h3 key={key++} className="text-lg font-semibold text-white mt-6 mb-2">
            {headingText}
          </h3>
        );
        continue;
      }
      if (trimmedLine.startsWith("#### ")) {
        flushList();
        const headingText = trimmedLine.replace(/^#+\s+/, "");
        elements.push(
          <h4 key={key++} className="text-base font-semibold text-white mt-5 mb-2">
            {headingText}
          </h4>
        );
        continue;
      }

      // Blockquotes/Notes
      if (trimmedLine.startsWith("> ")) {
        flushList();
        const quoteText = trimmedLine.replace(/^>\s+/, "");
        elements.push(
          <blockquote key={key++} className="my-5 pl-4 border-l-2 border-gray-700 text-gray-400 text-sm italic">
            {quoteText}
          </blockquote>
        );
        continue;
      }

      // Horizontal rule
      if (trimmedLine === "---" || trimmedLine === "***") {
        flushList();
        elements.push(
          <hr key={key++} className="my-8 border-gray-800" />
        );
        continue;
      }

      // Lists
      if (trimmedLine.match(/^[-*]\s+/)) {
        if (!inList) {
          flushList();
          inList = true;
        }
        listItems.push(trimmedLine);
        continue;
      }

      // Numbered lists
      if (trimmedLine.match(/^\d+\.\s+/)) {
        flushList();
        const itemText = trimmedLine.replace(/^\d+\.\s+/, "");
        elements.push(
          <div key={key++} className="flex items-start gap-3 my-2">
            <span className="flex-shrink-0 w-5 h-5 bg-gray-800 text-gray-400 rounded text-xs flex items-center justify-center font-mono">
              {trimmedLine.match(/^\d+/)?.[0]}
            </span>
            <span className="text-sm text-gray-300 leading-relaxed">{itemText}</span>
          </div>
        );
        continue;
      }

      // Tables
      if (trimmedLine.includes("|") && trimmedLine.split("|").length > 2) {
        flushList();
        const cells = trimmedLine.split("|").map(c => c.trim()).filter(c => c);
        if (cells.length > 0 && !cells[0].includes("---")) {
          elements.push(
            <div key={key++} className="my-5 overflow-x-auto rounded-lg border border-gray-800">
              <table className="min-w-full divide-y divide-gray-800">
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  <tr className="bg-gray-800/50">
                    {cells.map((cell, idx) => (
                      <th key={idx} className="px-4 py-2.5 text-left text-xs font-medium text-gray-300">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // Regular paragraphs
      if (trimmedLine.length > 0) {
        flushList();
        const parts = trimmedLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/);
        if (parts.length > 1) {
          const paragraphParts: (string | ReactElement)[] = [];
          parts.forEach((part, idx) => {
            if (part.startsWith("`") && part.endsWith("`")) {
              paragraphParts.push(
                <code key={idx} className="px-1.5 py-0.5 bg-gray-800 text-emerald-400 rounded text-xs font-mono border border-gray-700">
                  {part.slice(1, -1)}
                </code>
              );
            } else if (part.startsWith("**") && part.endsWith("**")) {
              paragraphParts.push(
                <strong key={idx} className="font-semibold text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            } else if (part.trim()) {
              paragraphParts.push(part);
            }
          });
          elements.push(
            <p key={key++} className="my-4 text-sm text-gray-300 leading-relaxed">
              {paragraphParts}
            </p>
          );
        } else {
          elements.push(
            <p key={key++} className="my-4 text-sm text-gray-300 leading-relaxed">
              {trimmedLine}
            </p>
          );
        }
      } else {
        flushList();
      }
    }

    flushList();
    flushCodeBlock();

    return elements;
  };

  return (
    <article className="lesson-content">
      {/* Topics Section - Clean card design */}
      {topics && topics.length > 0 && (
        <div className="mb-8 p-5 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">What you&apos;ll learn</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium border border-gray-700/50"
              >
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        {parseContent(content)}
      </div>
    </article>
  );
}
