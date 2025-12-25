
import { useState, useEffect, useRef } from 'react';
import type { Language } from '../types';

// FIX: Add minimal type definitions for the Web Speech API to resolve TypeScript errors.
// The API is not a web standard and types are not included in default TS DOM libs.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: () => void;
    onend: () => void;
    onerror: (event: any) => void;
    onresult: (event: any) => void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

interface VoiceRecognitionOptions {
  language: Language;
}

// Check for SpeechRecognition API
// FIX: Cast window to `any` to access non-standard properties, and rename the variable
// to `SpeechRecognitionAPI` to avoid a name collision with the `SpeechRecognition` interface type.
const SpeechRecognitionAPI: SpeechRecognitionStatic | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;

export const useVoiceRecognition = ({ language }: VoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  // FIX: Use the defined `SpeechRecognition` interface for the ref type.
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    // FIX: Use the renamed constructor.
    const recognition = new SpeechRecognitionAPI!();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
         setTranscript(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
      }
    };
    
    // Cleanup on component unmount
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, [language]);
  
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: isSpeechRecognitionSupported
  };
};
