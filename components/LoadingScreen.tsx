import React from 'react';
import type { FC } from 'react';

export const LoadingScreen: FC = () => (
  <div className="w-screen h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-xl font-medium">Initializing InfinityAI...</p>
  </div>
);
