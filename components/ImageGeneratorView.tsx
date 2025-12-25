
import React from 'react';
import type { FC } from 'react';
import { DownloadIcon, ImageIcon, WarningIcon } from './Icons';

interface ImageGeneratorViewProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  prompt: string;
}

export const ImageGeneratorView: FC<ImageGeneratorViewProps> = ({ imageUrl, isLoading, error, prompt }) => {

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${prompt.slice(0, 30).replace(/\s/g, '_') || 'generated_image'}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto scroll-container">
      <div className="w-full max-w-4xl text-center">
        {isLoading && (
          <div className="space-y-4 animate-pulse w-full">
            <div className="bg-gray-700/50 rounded-lg aspect-square w-full max-w-md mx-auto"></div>
            <div className="h-4 bg-gray-700/50 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-700/50 rounded w-1/2 mx-auto"></div>
          </div>
        )}
        {!isLoading && error && (
            <div className="text-red-400 space-y-4 flex flex-col items-center max-w-md mx-auto">
                <WarningIcon className="w-24 h-24 mx-auto text-red-500/80" />
                <h1 className="text-2xl font-bold">Generation Failed</h1>
                <p className="bg-red-900/40 p-3 rounded-lg text-sm">{error}</p>
            </div>
        )}
        {!isLoading && !error && imageUrl && (
          <div className="space-y-4 animate-fadeIn">
            <img src={imageUrl} alt={prompt} className="rounded-lg shadow-2xl max-w-full max-h-[60vh] mx-auto" />
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors glowing-btn"
              >
                <DownloadIcon className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
        )}
        {!isLoading && !error && !imageUrl && (
          <div className="text-gray-500 space-y-4 animate-fadeIn">
            <ImageIcon className="w-24 h-24 mx-auto text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-400">AI Image Generation</h1>
            <p>Describe the image you want to create in the input below.</p>
            <p className="text-sm">For example: "A majestic lion wearing a crown, cinematic lighting"</p>
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
