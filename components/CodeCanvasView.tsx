
import React from 'react';
import type { FC } from 'react';
import { CodeIcon, ClipboardIcon, WarningIcon } from './Icons';

interface CodeCanvasViewProps {
  code: string | null;
  isLoading: boolean;
  error: string | null;
}

const CodeBlock: FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900 rounded-lg w-full animate-fadeIn">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-700 rounded-t-lg">
                <span className="text-xs font-semibold text-gray-300">Generated Code</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-white hover:text-blue-300">
                    <ClipboardIcon className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm text-white scroll-container max-h-[65vh]"><code>{code}</code></pre>
        </div>
    );
};


export const CodeCanvasView: FC<CodeCanvasViewProps> = ({ code, isLoading, error }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto scroll-container">
      <div className="w-full max-w-4xl flex items-center justify-center">
        {isLoading && (
          <div className="space-y-2 w-full animate-pulse">
            <div className="h-10 bg-gray-700/50 rounded-t-lg w-full"></div>
            <div className="h-64 bg-gray-700/50 rounded-b-lg w-full"></div>
          </div>
        )}
        {!isLoading && error && (
            <div className="text-red-400 space-y-4 flex flex-col items-center text-center max-w-md mx-auto">
                <WarningIcon className="w-24 h-24 mx-auto text-red-500/80" />
                <h1 className="text-2xl font-bold">Generation Failed</h1>
                <p className="bg-red-900/40 p-3 rounded-lg text-sm">{error}</p>
            </div>
        )}
        {!isLoading && !error && code && (
          <CodeBlock code={code} />
        )}
        {!isLoading && !error && !code && (
          <div className="text-gray-500 space-y-4 text-center animate-fadeIn">
            <CodeIcon className="w-24 h-24 mx-auto text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-400">Code Canvas</h1>
            <p>Describe the code you need in the input below.</p>
            <p className="text-sm">For example: "A React hook for debouncing input"</p>
          </div>
        )}
      </div>
      <style>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fadeIn {
                animation: fadeIn 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};
