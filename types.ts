
export type ViewMode = 'chat' | 'image' | 'code' | 'vision' | 'video';
export type Language = 'en-US' | 'si-LK';

export interface Source {
  uri: string;
  title: string;
}

export interface Part {
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  code?: string;
  isThinking?: boolean;
}

export interface Message {
  role: 'user' | 'model';
  parts: Part[];
  sources?: Source[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export type Conversations = Record<string, Conversation>;

export const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en-US', name: 'English' },
  { code: 'si-LK', name: 'සිංහල' },
];

export type ImageStyle = 'photorealistic' | 'anime' | 'cartoon' | 'fantasy' | 'cyberpunk';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export const IMAGE_STYLES: { value: ImageStyle; label: string }[] = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'anime', label: 'Anime' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: 'Square' },
  { value: '16:9', label: 'Landscape' },
  { value: '9:16', label: 'Portrait' },
  { value: '4:3', label: 'Wide' },
  { value: '3:4', label: 'Tall' },
];

export type AIPersona = 'friendly' | 'helpful' | 'very-friendly' | 'very-helpful';

export const AI_PERSONAS: { value: AIPersona; label: string, description: string }[] = [
    { value: 'friendly', label: 'Friendly', description: 'Conversational and approachable.' },
    { value: 'helpful', label: 'Helpful', description: 'Direct, efficient, and to-the-point.' },
    { value: 'very-friendly', label: 'Very Friendly', description: 'Enthusiastic, encouraging, and warm.' },
    { value: 'very-helpful', label: 'Very Helpful', description: 'Detailed, thorough, and proactive.' },
];
