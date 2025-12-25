

import React from 'react';
import type { FC, Dispatch, SetStateAction } from 'react';
// FIX: Import the `Conversation` type to correctly type the items from `Object.values(conversations)`.
import type { Language, Conversations, Conversation } from '../types';
import { LANGUAGES } from '../types';
import { XIcon, LogoutIcon, ProBadgeIcon, PlusIcon, ChatIcon, SettingsIcon } from './Icons';
import { handleSignOut, type User } from '../services/firebaseService';

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

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  // FIX: Cast Object.values to Conversation[] to ensure `sortedConversations` is correctly typed.
  // This resolves errors in the map function where properties of `convo` were inaccessible because it was typed as `unknown`.
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

  return (
    <>
      <aside className={`absolute md:relative z-40 w-72 h-full bg-gray-900 flex flex-col p-4 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">InfinityAI</h1>
            <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-400 rounded-md hover:bg-gray-700">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        
        <button 
          onClick={handleNew}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors mb-4 flex-shrink-0"
        >
          <PlusIcon className="w-5 h-5" />
          New Chat
        </button>

        <div className="flex-grow overflow-y-auto scroll-container pr-1">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">History</h2>
            <nav className="flex flex-col space-y-1">
                {sortedConversations.map(convo => (
                    <button
                        key={convo.id}
                        onClick={() => handleSwitch(convo.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 text-left ${
                        convo.id === currentChatId ? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        }`}
                    >
                        <ChatIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium truncate">{convo.title}</span>
                    </button>
                ))}
            </nav>
        </div>
        
        <div className="mt-auto space-y-4 pt-4 flex-shrink-0">
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-gray-400 mb-2">Chat Language</label>
              <select 
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 overflow-hidden">
                    <img src={user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${displayName}`} alt="User" className="w-8 h-8 rounded-full bg-gray-700"/>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-sm font-medium truncate">{displayName}</span>
                        <ProBadgeIcon className="w-4 h-4 flex-shrink-0" title="Pro Member" />
                    </div>
                </div>
                <div className="flex items-center">
                    <button onClick={onOpenSettings} className="p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white" title="Settings">
                        <SettingsIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={handleSignOut} className="p-2 text-gray-400 rounded-md hover:bg-red-500/20 hover:text-red-400" title="Sign Out">
                        <LogoutIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
      </aside>
       {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 z-30 md:hidden"></div>}
    </>
  );
};
