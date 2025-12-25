
import React, { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Sidebar } from './Sidebar';
import { ChatView } from './ChatView';
import { ImageGeneratorView } from './ImageGeneratorView';
import { VideoGeneratorView } from './VideoGeneratorView';
import { CodeCanvasView } from './CodeCanvasView';
import { InputArea } from './InputArea';
import { SettingsModal } from './SettingsModal';
import { MenuIcon } from './Icons';
import type { Language, ViewMode, Conversations, Message, Conversation, Source, ImageStyle, AspectRatio, AIPersona } from '../types';
import { ParticleBackground } from './ParticleBackground';
import type { User } from '../services/firebaseService';
import { getChatResponseStream, generateImage, generateVideo, generateCode, generateChatTitle } from '../services/geminiService';

interface MainLayoutProps {
    user: User;
}

export const MainLayout: FC<MainLayoutProps> = ({ user }) => {
  const [view, setView] = useState<ViewMode>('chat');
  const [language, setLanguage] = useState<Language>('en-US');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversations>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiPersona, setAiPersona] = useState<AIPersona>('helpful');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState('');

  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(`conversations_${user.uid}`);
      if (savedConversations) {
        const parsedConvos = JSON.parse(savedConversations);
        setConversations(parsedConvos);
        const sortedIds = Object.keys(parsedConvos).sort((a, b) => parsedConvos[b].timestamp - parsedConvos[a].timestamp);
        if (sortedIds.length > 0) setCurrentChatId(sortedIds[0]);
        else handleNewChat();
      } else handleNewChat();
    } catch { handleNewChat(); }
  }, [user.uid]);

  const saveConversations = useCallback((updatedConversations: Conversations) => {
    localStorage.setItem(`conversations_${user.uid}`, JSON.stringify(updatedConversations));
  }, [user.uid]);

  const updateMessages = (chatId: string, messages: Message[]) => {
      setConversations(prev => {
          const updated = { ...prev, [chatId]: { ...prev[chatId], messages } };
          saveConversations(updated);
          return updated;
      });
  };

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newConversation: Conversation = {
      id: newChatId,
      title: "New 2026 Session",
      messages: [{ role: 'model', parts: [{ text: "System Online. InfinityAI v3.0 (2026 Edition) ready for instructions." }] }],
      timestamp: Date.now(),
    };
    setConversations(prev => {
        const updated = { ...prev, [newChatId]: newConversation };
        saveConversations(updated);
        return updated;
    });
    setCurrentChatId(newChatId);
    setView('chat');
  };

  const handleSubmit = async (prompt: string, mode: ViewMode, options: { image?: string; imageStyle?: ImageStyle; aspectRatio?: AspectRatio; useThinking?: boolean }) => {
    if (!prompt.trim() && !options.image || isLoading || !currentChatId) return;

    setLastUserPrompt(prompt);
    const userParts = [];
    if(options.image) userParts.push({ imageUrl: options.image });
    if(prompt.trim()) userParts.push({ text: prompt });

    const userMessage: Message = { role: 'user', parts: userParts };
    const currentMessages = conversations[currentChatId]?.messages || [];
    const newMessages = [...currentMessages, userMessage];

    updateMessages(currentChatId, newMessages);
    setIsLoading(true);
    setError(null);
    if (mode === 'image') setGeneratedImageUrl(null);
    if (mode === 'video') setGeneratedVideoUrl(null);
    if (mode === 'code') setGeneratedCode(null);

    try {
        if (mode === 'chat' || mode === 'vision') {
            const systemInstruction = `You are InfinityAI 2026 by Infinity Team. Persona: ${aiPersona}. Language: ${language === 'si-LK' ? 'Sinhala' : 'English'}. NEVER mention Google. Use Search for latest facts.`;
            const stream = await getChatResponseStream(newMessages, systemInstruction, mode, options.useThinking);
            let modelResponse = '';
            const sources = new Map<string, Source>();
            
            updateMessages(currentChatId, [...newMessages, { role: 'model', parts: [{ text: '', isThinking: options.useThinking }] }]);
            
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                chunk.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach(sc => {
                    if (sc.web?.uri) sources.set(sc.web.uri, sc.web);
                });
                
                setConversations(prev => {
                    const prevConvo = prev[currentChatId];
                    const updatedMessages = [...(prevConvo?.messages || [])];
                    const lastMsg = updatedMessages[updatedMessages.length - 1];
                    if (lastMsg?.role === 'model') {
                        lastMsg.parts = [{ text: modelResponse + '▌', isThinking: options.useThinking }];
                    }
                    return { ...prev, [currentChatId]: { ...prevConvo, messages: updatedMessages } };
                });
            }

            const finalMessage: Message = { 
                role: 'model', 
                parts: [{ text: modelResponse }],
                sources: Array.from(sources.values())
            };
            updateMessages(currentChatId, [...newMessages, finalMessage]);

        } else if (mode === 'image') {
            const imageUrl = await generateImage(prompt, options.imageStyle || 'photorealistic', options.aspectRatio || '1:1');
            setGeneratedImageUrl(imageUrl);
            updateMessages(currentChatId, [...newMessages, { role: 'model', parts: [{ imageUrl }] }]);
        } else if (mode === 'video') {
            const videoUrl = await generateVideo(prompt, options.aspectRatio === '9:16' ? '9:16' : '16:9');
            setGeneratedVideoUrl(videoUrl);
            updateMessages(currentChatId, [...newMessages, { role: 'model', parts: [{ videoUrl }] }]);
        } else if (mode === 'code') {
            const code = await generateCode(prompt);
            setGeneratedCode(code);
            updateMessages(currentChatId, [...newMessages, { role: 'model', parts: [{ code }] }]);
        }
        
        if (currentMessages.length <= 1) {
           const title = await generateChatTitle(prompt || "Session");
           setConversations(prev => {
                const updated = { ...prev, [currentChatId]: { ...prev[currentChatId], title } };
                saveConversations(updated);
                return updated;
           });
        }
    } catch (err: any) {
        setError(err.message || "2026 Core Interface Failure. Retry later.");
        updateMessages(currentChatId, [...newMessages, { role: 'model', parts: [{ text: "Error syncing with 2026 Core." }] }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#050505] text-gray-200 flex overflow-hidden font-inter tracking-tight">
      <ParticleBackground />
      <Sidebar
        user={user}
        language={language}
        setLanguage={setLanguage}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        conversations={conversations}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSwitchChat={setCurrentChatId}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <main className="flex-1 flex flex-col h-full relative bg-[#0a0a0a]/80 backdrop-blur-3xl">
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-transparent md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-3 bg-gray-800 rounded-2xl">
            <MenuIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest">{currentChatId ? conversations[currentChatId]?.title : 'InfinityAI'}</h1>
        </header>
        <div className="flex flex-col h-full pt-20 md:pt-0">
             { (view === 'chat' || view === 'vision') && <ChatView messages={conversations[currentChatId!]?.messages || []} isLoading={isLoading} /> }
             { view === 'image' && <ImageGeneratorView imageUrl={generatedImageUrl} isLoading={isLoading} error={error} prompt={lastUserPrompt} /> }
             { view === 'video' && <VideoGeneratorView videoUrl={generatedVideoUrl} isLoading={isLoading} error={error} prompt={lastUserPrompt} /> }
             { view === 'code' && <CodeCanvasView code={generatedCode} isLoading={isLoading} error={error} /> }
             <InputArea
                currentView={view}
                setCurrentView={setView}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
                language={language}
             />
        </div>
      </main>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={() => { setConversations({}); localStorage.removeItem(`conversations_${user.uid}`); handleNewChat(); setIsSettingsOpen(false); }}
        onExportHistory={() => {}}
        currentPersona={aiPersona}
        setPersona={setAiPersona}
      />
    </div>
  );
};
