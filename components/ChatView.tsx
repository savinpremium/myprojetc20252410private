import React, { useRef, useEffect } from 'react';
import type { FC } from 'react';
import type { Message, Source } from '../types';
import { ClipboardIcon, LinkIcon, SpeakerIcon } from './Icons';
import { generateSpeech } from '../services/geminiService';

interface ChatViewProps {
    messages: Message[];
    isLoading: boolean;
}

const CodeBlock: FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900/80 rounded-2xl my-3 border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-800/50 backdrop-blur-md">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Logic Stream</span>
                <button onClick={handleCopy} className="flex items-center gap-2 text-xs text-white/70 hover:text-blue-400 transition-colors">
                    <ClipboardIcon className="w-4 h-4" />
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="p-5 overflow-x-auto text-sm text-gray-100 font-mono leading-relaxed scroll-container"><code>{code}</code></pre>
        </div>
    );
};

const SourcePill: FC<{ source: Source }> = ({ source }) => (
    <a 
        href={source.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all rounded-full text-[10px] text-blue-300 px-3 py-1 font-bold uppercase tracking-wider"
    >
        <LinkIcon className="w-3 h-3 flex-shrink-0" />
        <span className="truncate max-w-[120px]">{source.title}</span>
    </a>
);

export const ChatView: FC<ChatViewProps> = ({ messages, isLoading }) => {
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const [playingAudio, setPlayingAudio] = React.useState<string | null>(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Handle speaking using Gemini TTS. Fix: Correctly decode raw PCM audio data.
    const handleSpeak = async (text: string) => {
        if (playingAudio === text) return;
        try {
            setPlayingAudio(text);
            const base64 = await generateSpeech(text);
            
            // Decode base64 to bytes
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
            
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            
            // The audio bytes returned by the API is raw PCM data. 
            // We must manually decode it and load it into an AudioBuffer.
            const dataInt16 = new Int16Array(bytes.buffer);
            const numChannels = 1;
            const frameCount = dataInt16.length / numChannels;
            const audioBuffer = audioCtx.createBuffer(numChannels, frameCount, 24000);

            for (let channel = 0; channel < numChannels; channel++) {
                const channelData = audioBuffer.getChannelData(channel);
                for (let i = 0; i < frameCount; i++) {
                    channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
                }
            }

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start();
            source.onended = () => {
                setPlayingAudio(null);
                audioCtx.close();
            };
        } catch (e) {
            console.error("Audio failed", e);
            setPlayingAudio(null);
        }
    };

    return (
        <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-container">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 max-w-5xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg ${msg.role === 'model' ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-gray-800 border border-white/10'}`}>
                        {msg.role === 'model' ? 'AI' : 'U'}
                    </div>
                    <div className={`group relative p-5 rounded-3xl max-w-[85%] space-y-4 ${msg.role === 'model' ? 'bg-gray-800/40 border border-white/5 backdrop-blur-xl' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/10'}`}>
                        <div className="space-y-4">
                            {msg.parts.map((part, partIndex) => {
                                if (part.isThinking) {
                                    return <div key={partIndex} className="text-xs font-mono text-blue-400 italic opacity-70 animate-pulse"># Deep Reasoning Active...</div>;
                                }
                                if (part.imageUrl && msg.role === 'user') {
                                    return <img key={partIndex} src={part.imageUrl} alt="Analysis Target" className="rounded-2xl max-w-sm h-auto border border-white/10" />;
                                }
                                if (part.text) {
                                    return (
                                        <div key={partIndex} className="text-[15px] leading-relaxed whitespace-pre-wrap">
                                            {part.text.replace('▌', '')}
                                            {part.text.endsWith('▌') && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />}
                                        </div>
                                    );
                                }
                                if (part.code) return <CodeBlock key={partIndex} code={part.code} />;
                                if (part.imageUrl && msg.role === 'model') return <img key={partIndex} src={part.imageUrl} alt="AI Generation" className="rounded-2xl max-w-full h-auto shadow-2xl" />;
                                return null;
                            })}
                        </div>
                        {msg.role === 'model' && msg.parts.some(p => p.text) && (
                            <button 
                                onClick={() => handleSpeak(msg.parts.find(p => p.text)?.text || "")}
                                className={`absolute -right-12 top-0 p-2 rounded-full transition-all ${playingAudio ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            >
                                <SpeakerIcon className="w-5 h-5" />
                            </button>
                        )}
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="pt-4 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Live Citations</h4>
                                <div className="flex flex-wrap gap-2">
                                    {msg.sources.map((source, i) => <SourcePill key={i} source={source} />)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
             {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
                <div className="flex items-start gap-4 max-w-5xl mx-auto">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse">AI</div>
                    <div className="p-5 rounded-3xl bg-gray-800/40 border border-white/5 backdrop-blur-xl">
                       <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                       </div>
                    </div>
                </div>
             )}
        </div>
    );
};