import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SpeakingAvatarProps {
  text?: string;
  isSpeaking?: boolean;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export const SpeakingAvatar: React.FC<SpeakingAvatarProps> = ({
  text,
  isSpeaking: externalIsSpeaking,
  onSpeechStart,
  onSpeechEnd
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [expression, setExpression] = useState<'neutral' | 'happy' | 'listening' | 'thinking' | 'focused'>('neutral');
  const [breathe, setBreathe] = useState(0);
  const [blinkFrame, setBlinkFrame] = useState(0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const breatheRef = useRef<number | null>(null);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing animation
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame += 0.02;
      setBreathe(Math.sin(frame) * 3);
      breatheRef.current = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      if (breatheRef.current) cancelAnimationFrame(breatheRef.current);
    };
  }, []);

  // Random blinking
  useEffect(() => {
    const blink = () => {
      setBlinkFrame(1);
      setTimeout(() => setBlinkFrame(2), 100);
      setTimeout(() => setBlinkFrame(0), 180);
      
      const nextBlink = 1500 + Math.random() * 4000;
      blinkTimerRef.current = setTimeout(blink, nextBlink);
    };
    
    blinkTimerRef.current = setTimeout(blink, 2000);
    
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Start speaking
  const startSpeaking = useCallback(() => {
    if (!text) return;
    
    window.speechSynthesis?.cancel();
    setIsSpeaking(true);
    setExpression('listening');
    setDisplayedText(text);
    onSpeechStart?.();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to get a natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Victoria') || 
      v.name.includes('Karen') ||
      v.name.includes('Female')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    utterance.onstart = () => {
      setExpression('focused');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setExpression('happy');
      setTimeout(() => setExpression('neutral'), 3000);
      onSpeechEnd?.();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setExpression('neutral');
      onSpeechEnd?.();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, onSpeechStart, onSpeechEnd]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setExpression('neutral');
    onSpeechEnd?.();
  }, [onSpeechEnd]);

  // Handle external state
  useEffect(() => {
    if (externalIsSpeaking && text) {
      startSpeaking();
    } else if (!externalIsSpeaking) {
      stopSpeaking();
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [externalIsSpeaking, text, startSpeaking, stopSpeaking]);

  // Load voices
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.getVoices();
      synth.onvoiceschanged = () => {
        synth.getVoices();
      };
    }
  }, []);

  // Update text
  useEffect(() => {
    if (text) setDisplayedText(text);
  }, [text]);

  return (
    <div className="flex flex-col items-center">
      {/* Main Avatar Container */}
      <div 
        className="relative"
        style={{ 
          transform: `translateY(${breathe}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Avatar Image with Effects */}
        <div className="relative w-72 h-72 md:w-80 md:h-80">
          {/* Glow effect when speaking */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-400/30 blur-xl transition-opacity duration-500 ${isSpeaking ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Main image container */}
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ring-white">
            <img
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&crop=face&faces=center"
              alt="HR Manager"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay for expressions */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
            
            {/* Speaking mouth animation overlay */}
            {isSpeaking && (
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-16 h-8">
                <div className="w-full h-full relative animate-pulse">
                  <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-sm" />
                  <div className="absolute inset-2 bg-teal-500/40 rounded-full blur-md animate-ping" />
                </div>
              </div>
            )}
          </div>

          {/* Eyes layer for blinking */}
          <div 
            className={`absolute top-1/3 left-0 right-0 flex justify-center gap-16 md:gap-20 pointer-events-none ${blinkFrame > 0 ? 'scale-y-0' : ''} transition-transform duration-100`}
          >
            <div className="w-8 h-4 md:w-10 md:h-5 bg-slate-800 rounded-full" />
            <div className="w-8 h-4 md:w-10 md:h-5 bg-slate-800 rounded-full" />
          </div>

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 h-6 md:h-8 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full"
                  style={{
                    animation: `soundBars 0.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Expression badge */}
        <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
          <span className="text-2xl">
            {expression === 'happy' && '😊'}
            {expression === 'listening' && '👂'}
            {expression === 'thinking' && '🤔'}
            {expression === 'focused' && '🎯'}
            {expression === 'neutral' && '🙂'}
          </span>
        </div>

        {/* Name badge */}
        <div className="absolute -bottom-2 -left-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
          <p className="font-bold text-slate-800 text-sm">Sarah Mitchell</p>
          <p className="text-xs text-slate-500">HR Manager</p>
        </div>

        {/* Live indicator */}
        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Speech Bubble */}
      {displayedText && (
        <div className="relative max-w-lg w-full mt-8">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-xl border border-slate-100">
            <div className="absolute -top-2 left-10 w-4 h-4 bg-white border-l border-t border-slate-100 transform rotate-45" />
            <p className="text-slate-700 text-base md:text-lg leading-relaxed">
              {displayedText}
              {isSpeaking && (
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="w-1.5 h-4 bg-teal-500 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-5 bg-teal-500 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-3 bg-teal-500 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 mt-8">
        {!isSpeaking && text && (
          <button
            onClick={startSpeaking}
            className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Ask Question
            </span>
          </button>
        )}
        
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm" />
            </div>
            Stop
          </button>
        )}
      </div>

      {/* Status */}
      <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
        <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
        {isSpeaking ? 'Speaking...' : 'Ready to interview'}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes soundBars {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default SpeakingAvatar;
