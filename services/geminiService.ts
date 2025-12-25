
import { GoogleGenAI, Modality } from "@google/genai";
import type { Message, ViewMode, ImageStyle, AspectRatio } from '../types';

const getAIClient = () => {
    // Priority: process.env.API_KEY -> User Provided Fallback
    const apiKey = process.env.API_KEY || 'AIzaSyBll12h2t9UU_5fqjk2VopsG4OkAKdWKHU';
    
    if (!apiKey) {
        console.error("Critical: No API Key detected in environment or fallback.");
    }
    
    return new GoogleGenAI({ apiKey: apiKey || "" });
};

const dataUrlToGeminiPart = (url: string) => {
    const match = url.match(/^data:(.+);base64,(.+)$/);
    if (!match) return { text: "[Invalid Media Data]" };
    return {
        inlineData: {
            mimeType: match[1],
            data: match[2],
        },
    };
};

export const getChatResponseStream = async (history: Message[], systemInstruction: string, mode: ViewMode, useThinking: boolean = false) => {
  const ai = getAIClient();
  const contents = history.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(p => {
          if (p.imageUrl) return dataUrlToGeminiPart(p.imageUrl);
          return { text: p.text || p.code || '' };
      })
  }));

  // Standardize on flash-preview for maximum reliability across different environments
  const model = (mode === 'code' || useThinking) ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    systemInstruction,
  };

  if (model === 'gemini-3-pro-preview' && (mode === 'chat' || mode === 'vision')) {
    config.tools = [{googleSearch: {}}];
  }

  if (useThinking && model === 'gemini-3-pro-preview') {
    config.thinkingConfig = { thinkingBudget: 16000 };
  }

  try {
      return await ai.models.generateContentStream({
        model,
        contents: contents,
        config,
      });
  } catch (err: any) {
      console.warn(`Primary model (${model}) failed, attempting fallback...`, err);
      
      return await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: { systemInstruction },
      });
  }
};

export const generateImage = async (prompt: string, style: ImageStyle, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAIClient();
    const fullPrompt = `A ${style} style image of ${prompt}, ultra-high quality, masterpiece, 2026 aesthetics.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: [{ parts: [{ text: fullPrompt }] }],
            config: {
              imageConfig: {
                  aspectRatio: aspectRatio as any,
                  imageSize: "1K"
              }
            },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("Visual data stream empty.");
    } catch (err: any) {
        throw new Error(`Visual Synthesis Error: ${err.message}`);
    }
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
    const ai = getAIClient();
    
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt + ", cinematic 4k, 2026 movie style",
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("No download link returned.");
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY || 'AIzaSyBll12h2t9UU_5fqjk2VopsG4OkAKdWKHU'}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (err: any) {
        throw new Error(`Video Engine Error: ${err.message}`);
    }
};

export const generateCode = async (prompt: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert software engineer. Output ONLY the code. Do not use markdown backticks unless requested."
            },
        });
        return response.text;
    } catch (err: any) {
        const fallback = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return fallback.text;
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error("Voice synthesis failure.");
  return audioData;
};

export const generateChatTitle = async (prompt: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Summarize this as a 3-word title: "${prompt}"`,
        });
        return (response.text || "New Session").replace(/"/g, '').trim();
    } catch {
        return "New Session";
    }
};
