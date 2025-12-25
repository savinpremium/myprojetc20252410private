
import { GoogleGenAI, Modality } from "@google/genai";
import type { Message, ViewMode, ImageStyle, AspectRatio } from '../types';

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  const model = mode === 'code' || useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    systemInstruction,
  };

  if (mode === 'chat' || mode === 'vision') {
    config.tools = [{googleSearch: {}}];
  }

  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 16000 };
  }

  return await ai.models.generateContentStream({
    model,
    contents: contents,
    config,
  });
};

export const generateImage = async (prompt: string, style: ImageStyle, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAIClient();
    const fullPrompt = `A ${style} style image of ${prompt}, ultra-high quality, masterpiece, Infinity Team proprietary 2026 rendering engine.`;

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

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("Infinity Image Core failed to respond.");
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
    const ai = getAIClient();
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt + ", cinematic 4k, proprietary Infinity cinematic style",
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Infinity Video Core generation failed.");
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

export const generateSpeech = async (text: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Generate clear speech: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Infinity Voice Engine failed");
    return base64Audio;
};

export const generateCode = async (prompt: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 8000 },
            systemInstruction: "You are the Infinity Code Intelligence. An expert software engineer built by Infinity Team. Output ONLY code."
        },
    });
    return response.text;
};

export const generateChatTitle = async (prompt: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Summarize as a 3-word title: "${prompt}"`,
        });
        return response.text.replace(/"/g, '').trim();
    } catch {
        return "Infinity Session";
    }
};
