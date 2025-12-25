
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import type { FC, FormEvent, Dispatch, SetStateAction } from 'react';
import type { Language, ViewMode, ImageStyle, AspectRatio } from '../types';
import { IMAGE_STYLES, ASPECT_RATIOS } from '../types';
import { SendIcon, MicIcon, StopCircleIcon, ChatIcon, ImageIcon, CodeIcon, PaperclipIcon, XIcon, EyeIcon, VideoIcon } from './Icons';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface InputAreaProps {
    currentView: ViewMode;
    setCurrentView: Dispatch<SetStateAction<ViewMode>>;
    onSubmit: (prompt: string, mode: ViewMode, options: { image?: string; imageStyle?: ImageStyle; aspectRatio?: AspectRatio; useThinking?: boolean }) => void;
    isLoading: boolean;
    error: string | null;
    language: Language;
}

const ModeButton: FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
            isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
    >
        {icon}
        {label}
    </button>
);

export const InputArea: FC<InputAreaProps> = ({ currentView, setCurrentView, onSubmit, isLoading, error, language }) => {
    const [input, setInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageStyle, setImageStyle] = useState<ImageStyle>('photorealistic');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [useThinking, setUseThinking] = useState(false);
    const { isListening, transcript, startListening, stopListening } = useVoiceRecognition({ language });
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (transcript) setInput(transcript);
    }, [transcript]);
    
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [input]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setCurrentView('vision');
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
        setCurrentView('chat');
    };

    const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        onSubmit(input, currentView, { 
            image: imagePreview || undefined,
            imageStyle,
            aspectRatio,
            useThinking
        });
        setInput('');
        removeImage();
    };
    
    return (
        <div className="p-6 border-t border-white/5 bg-gray-900/50 backdrop-blur-3xl">
            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex justify-center items-center gap-3 flex-wrap">
                    <ModeButton label="Chat" icon={<ChatIcon className="w-4 h-4" />} isActive={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
                    <ModeButton label="Vision" icon={<EyeIcon className="w-4 h-4" />} isActive={currentView === 'vision'} onClick={() => setCurrentView('vision')} />
                    <ModeButton label="Image" icon={<ImageIcon className="w-4 h-4" />} isActive={currentView === 'image'} onClick={() => setCurrentView('image')} />
                    <ModeButton label="Code" icon={<CodeIcon className="w-4 h-4" />} isActive={currentView === 'code'} onClick={() => setCurrentView('code')} />
                    <ModeButton label="Video" icon={<VideoIcon className="w-4 h-4" />} isActive={currentView === 'video'} onClick={() => setCurrentView('video')} />
                </div>

                <div className="flex items-center justify-between px-2">
                    <button 
                        onClick={() => setUseThinking(!useThinking)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${useThinking ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-500 border border-transparent'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${useThinking ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />
                        Deep Thinking Mode
                    </button>
                    {currentView === 'image' && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gemini 3 Pro Image</span>}
                    {currentView === 'video' && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Veo 3.1 Fast</span>}
                </div>

                <div className="bg-gray-800/80 rounded-[2.5rem] border border-white/5 p-3 shadow-2xl transition-all hover:border-indigo-500/20">
                    {imagePreview && (
                        <div className="relative inline-block m-2">
                            <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-2xl ring-2 ring-indigo-500/50"/>
                            <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white shadow-lg">
                                <XIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-end gap-3 px-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-4 rounded-full hover:bg-gray-700 text-gray-400 transition-colors self-center"
                            disabled={isLoading}
                        >
                            <PaperclipIcon className="w-6 h-6" />
                        </button>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                            }}
                            placeholder={isListening ? "Listening..." : "Unlock your next big idea..."}
                            className="flex-1 bg-transparent resize-none outline-none py-3 text-lg scroll-container placeholder:text-gray-600"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={isListening ? stopListening : startListening}
                            className={`p-4 rounded-full transition-all self-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-700 text-gray-400'}`}
                            disabled={isLoading}
                        >
                            {isListening ? <StopCircleIcon className="w-6 h-6"/> : <MicIcon className="w-6 h-6"/>}
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:bg-gray-700 self-center" 
                        disabled={isLoading || (!input.trim() && !imagePreview)}>
                            <SendIcon className="w-6 h-6"/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
