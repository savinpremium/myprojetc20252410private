
import React from 'react';
import type { FC, Dispatch, SetStateAction } from 'react';
import { XIcon, TrashIcon, DownloadIcon } from './Icons';
import type { AIPersona } from '../types';
import { AI_PERSONAS } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClearHistory: () => void;
    onExportHistory: () => void;
    currentPersona: AIPersona;
    setPersona: Dispatch<SetStateAction<AIPersona>>;
}

export const SettingsModal: FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onClearHistory,
    onExportHistory,
    currentPersona,
    setPersona
}) => {
    if (!isOpen) return null;

    const SettingButton: FC<{ icon: React.ReactNode; label: string; onClick: () => void; destructive?: boolean }> = ({ icon, label, onClick, destructive }) => (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                destructive 
                ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' 
                : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md m-4 p-6 rounded-2xl glass-effect"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Chat Settings</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-400 rounded-full hover:bg-gray-700">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Section: AI Personality */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">AI Personality</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {AI_PERSONAS.map(persona => (
                                <button 
                                    key={persona.value}
                                    onClick={() => setPersona(persona.value)}
                                    className={`p-3 rounded-lg text-left transition-all duration-200 border-2 ${
                                        currentPersona === persona.value 
                                        ? 'bg-blue-600/30 border-blue-500' 
                                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                                    }`}
                                >
                                    <p className="font-semibold text-white">{persona.label}</p>
                                    <p className="text-xs text-gray-400">{persona.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section: Chat Management */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Chat Management</h3>
                        <div className="space-y-3">
                            <SettingButton 
                                icon={<DownloadIcon className="w-5 h-5"/>}
                                label="Export History as JSON"
                                onClick={onExportHistory}
                            />
                             <SettingButton 
                                icon={<TrashIcon className="w-5 h-5"/>}
                                label="Clear All Conversations"
                                onClick={onClearHistory}
                                destructive
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
