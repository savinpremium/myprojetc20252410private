import React from 'react';
import type { FC, Dispatch, SetStateAction } from 'react';
import type { Language, Conversations, Conversation } from '../types';
import { LANGUAGES } from '../types';
import { XIcon, LogoutIcon, ProBadgeIcon, PlusIcon, ChatIcon, SettingsIcon } from './Icons';
import { handleSignOut, type User } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  user: User;
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  conversations: Conversations;
  currentChatId: string | null;
  onNewChat: () => void;
  onSwitchChat: (id: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ 
    user, 
    language, setLanguage, 
    isOpen, setIsOpen,
    conversations, currentChatId,
    onNewChat, onSwitchChat,
    onOpenSettings
}) => {
  const { clearGuestMode } = useAuth();
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const sortedConversations = (Object.values(conversations) as Conversation[]).sort((a, b) => b.timestamp - a.timestamp);

  const handleSwitch = (id: string) => {
    onSwitchChat(id);
    if (window.innerWidth < 768) {
        setIsOpen(false);
    }
  }
  
  const handleNew = () => {
    onNewChat();
    if (window.innerWidth < 768) {
        setIsOpen(false);
    }
  }

  const logout = async () => {
    try {
        await handleSignOut();
    } catch (e) {
        console.warn("Firebase signout failed, clearing local state only.");
    }
    clearGuestMode();
  };

  return (
    <>
      <aside className={`absolute md:relative z-40 w-72 h-full bg-gray-900 flex flex-col p-4 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">InfinityAI</h1>
            <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-400 rounded-md hover:bg-gray-700">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        
        <button 
          onClick={handleNew}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-3 rounded-xl transition-all mb-4 flex-shrink-0 shadow-lg shadow-blue-600/20 uppercase text-xs tracking-widest"
        >
          <PlusIcon className="w-5 h-5" />
          New Intelligence
        </button>

        <div className="flex-grow overflow-y-auto scroll-container pr-1">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Neural Nodes</h2>
            <nav className="flex flex-col space-y-1">
                {sortedConversations.map(convo => (
                    <button
                        key={convo.id}
                        onClick={() => handleSwitch(convo.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left ${
                        convo.id === currentChatId ? 'bg-white/5 text-white ring-1 ring-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <ChatIcon className={`w-5 h-5 flex-shrink-0 ${convo.id === currentChatId ? 'text-blue-400' : ''}`} />
                        <span className="font-bold truncate text-sm">{convo.title}</span>
                    </button>
                ))}
            </nav>
        </div>
        
        <div className="mt-auto space-y-4 pt-4 flex-shrink-0">
            <div>
              <label htmlFor="language-select" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Output Modality</label>
              <select 
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full bg-gray-800 border border-white/5 rounded-xl py-2 px-3 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 overflow-hidden">
                    <img src={user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${displayName}`} alt="User" className="w-8 h-8 rounded-lg bg-gray-800 border border-white/10"/>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-xs font-black truncate text-gray-200">{displayName}</span>
                        <ProBadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onOpenSettings} className="p-2 text-gray-500 rounded-lg hover:bg-white/5 hover:text-white transition-colors" title="Settings">
                        <SettingsIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={logout} className="p-2 text-gray-500 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Sign Out">
                        <LogoutIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
      </aside>
       {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"></div>}
    </>
  );
};