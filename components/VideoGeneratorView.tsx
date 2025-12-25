
import React from 'react';
import type { FC } from 'react';
import { DownloadIcon, VideoIcon, WarningIcon } from './Icons';

interface VideoGeneratorViewProps {
  videoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  prompt: string;
}

export const VideoGeneratorView: FC<VideoGeneratorViewProps> = ({ videoUrl, isLoading, error, prompt }) => {
  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = "infinity_ai_video.mp4";
    link.click();
  };

  const messages = [
    "Synthesizing motion vectors...",
    "Injecting cinematic lighting...",
    "Calibrating temporal coherence...",
    "Finalizing pixels for 2026 standards..."
  ];
  const [msgIdx, setMsgIdx] = React.useState(0);

  React.useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => setMsgIdx(prev => (prev + 1) % messages.length), 3000);
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto scroll-container">
      <div className="w-full max-w-4xl text-center">
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-gray-800 rounded-3xl aspect-video w-full max-w-2xl mx-auto flex items-center justify-center border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                <VideoIcon className="w-16 h-16 text-blue-500 animate-bounce" />
            </div>
            <div className="space-y-2">
                <p className="text-blue-400 font-bold text-xl">{messages[msgIdx]}</p>
                <p className="text-gray-500 text-sm italic">Video generation takes about 30-60 seconds.</p>
            </div>
          </div>
        )}
        {!isLoading && error && (
            <div className="text-red-400 space-y-4">
                <WarningIcon className="w-20 h-20 mx-auto opacity-50" />
                <h1 className="text-2xl font-bold">Director's Cut Failed</h1>
                <p className="bg-red-950/30 p-4 rounded-2xl border border-red-500/20">{error}</p>
            </div>
        )}
        {!isLoading && !error && videoUrl && (
          <div className="space-y-6 animate-fadeIn">
            <video src={videoUrl} controls autoPlay loop className="rounded-3xl shadow-2xl max-w-full max-h-[60vh] mx-auto border border-white/10" />
            <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-indigo-600/20"
            >
                <DownloadIcon className="w-5 h-5" />
                Export 2026 Cinema
            </button>
          </div>
        )}
        {!isLoading && !error && !videoUrl && (
          <div className="text-gray-500 space-y-6 animate-fadeIn">
            <VideoIcon className="w-24 h-24 mx-auto text-gray-700" />
            <h1 className="text-4xl font-black text-gray-400 tracking-tighter uppercase">Veo Video Engine</h1>
            <p className="text-lg">Turn your imagination into cinematic clips.</p>
            <div className="flex justify-center gap-2 text-xs font-mono text-gray-600">
                <span className="bg-gray-900 px-3 py-1 rounded-full border border-gray-800">1080P</span>
                <span className="bg-gray-900 px-3 py-1 rounded-full border border-gray-800">60 FPS</span>
                <span className="bg-gray-900 px-3 py-1 rounded-full border border-gray-800">2026 VEO 3.1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
