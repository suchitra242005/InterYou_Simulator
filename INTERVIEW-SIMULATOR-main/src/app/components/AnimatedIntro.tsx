import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface AnimatedIntroProps {
  onComplete: () => void;
}

export function AnimatedIntro({ onComplete }: AnimatedIntroProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Let's get you ready for your interview.";

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 12500); // 12.5 seconds total - faster fade out for logo

    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    // Start typing at 6.5s (52% of 12.5s animation)
    const startDelay = 6500;
    // Type over 1 second
    const typingDuration = 1000;
    const charDelay = typingDuration / fullText.length;

    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, charDelay);

      return () => clearInterval(typeInterval);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, []);

  // Audio bars with different heights and colors
  const audioBars = [
    { id: 1, height: 200, color: 'from-sky-400 to-blue-500' },
    { id: 2, height: 140, color: 'from-emerald-400 to-green-500' },
    { id: 3, height: 280, color: 'from-sky-300 to-sky-400' },
    { id: 4, height: 180, color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 overflow-visible"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-visible">
        
        {/* Audio bars - stay visible for 3s with InterYou, THEN zoom in and disappear FIRST */}
        <motion.div
          className="absolute flex items-center justify-center gap-6"
          initial={{ scale: 1, y: 0 }}
          animate={{ 
            scale: [1, 1, 1, 1, 1, 1, 8],
            y: [0, 0, -250, -250, -250, -250, -250],
            opacity: [1, 1, 1, 1, 1, 1, 0],
          }}
          transition={{
            duration: 11.5,
            times: [0, 0.18, 0.25, 0.4, 0.57, 0.75, 1],
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
        >
          {audioBars.map((bar, index) => (
            <motion.div
              key={bar.id}
              className={`w-24 bg-gradient-to-b ${bar.color} rounded-full shadow-2xl`}
              style={{ 
                height: `${bar.height}px`,
                transformOrigin: 'center',
              }}
              initial={{ opacity: 0.9 }}
              animate={{
                scaleY: [1, 1.2, 0.9, 1.1, 0.95, 1.05, 1, 1, 0],
                opacity: [0.9, 1, 1, 1, 1, 1, 1, 1, 0],
              }}
              transition={{
                scaleY: {
                  duration: 11.5,
                  times: [0, 0.055, 0.11, 0.165, 0.22, 0.28, 0.38, 0.75, 1],
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 11.5,
                  times: [0, 0.055, 0.165, 0.28, 0.35, 0.42, 0.49, 0.75, 1],
                  ease: "easeInOut",
                }
              }}
            />
          ))}
        </motion.div>

        {/* "Interview" - rises upward as one word, then disappears */}
        <motion.h1
          className="absolute text-8xl font-bold text-slate-800 tracking-tight"
          style={{ 
            fontFamily: "'Inter', sans-serif",
            top: '50%',
            marginTop: '-3.5rem',
          }}
          initial={{ y: 200, opacity: 0 }}
          animate={{ 
            y: [200, 0, 0, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 9.5,
            times: [0, 0.14, 0.33, 0.38],
            ease: "easeOut",
          }}
        >
          Interview
        </motion.h1>

        {/* Split logo container - stays fully visible for 3s with InterYou, AFTER bars disappear, then FASTER fade */}
        <motion.div
          className="absolute flex items-center"
          style={{ top: '50%', marginTop: '-3.5rem', left: '50%', transform: 'translateX(-50%)' }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0, 0, 1, 1, 1, 1, 0],
          }}
          transition={{
            duration: 12.5,
            times: [0, 0.29, 0.31, 0.325, 0.64, 0.92, 0.96, 1],
          }}
        >
          {/* "Inter" - appears, merges, stays visible for 3s, stays after bars disappear, then FASTER fade */}
          <motion.h1
            className="text-8xl font-bold text-slate-800 tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
            initial={{ x: 0, opacity: 0 }}
            animate={{ 
              x: [0, 0, -30, -30, -30, -30, 0, 0, 0, 0],
              opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
            }}
            transition={{
              duration: 12.5,
              times: [0, 0.31, 0.35, 0.49, 0.52, 0.56, 0.64, 0.92, 0.96, 1],
              ease: "easeInOut",
            }}
          >
            Inter
          </motion.h1>
          
          {/* Dot - appears after split, disappears during merge */}
          <motion.div
            className="w-3 h-3 bg-emerald-600 rounded-full mx-1"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 0, 1.5, 1, 1, 1, 0],
              opacity: [0, 0, 1, 1, 1, 1, 0],
            }}
            transition={{
              duration: 12.5,
              times: [0, 0.31, 0.34, 0.35, 0.52, 0.56, 0.6],
              ease: "backOut",
            }}
          />
          
          {/* "View" - appears, stays visible, then rotates away */}
          <motion.h1
            className="text-8xl font-bold text-slate-800 tracking-tight"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              transformStyle: 'preserve-3d',
            }}
            initial={{ x: 0, opacity: 0, rotateY: 0 }}
            animate={{ 
              x: [0, 0, 30, 30, 30, 30],
              opacity: [0, 0, 1, 1, 1, 0],
              rotateY: [0, 0, 0, 0, 0, 90],
            }}
            transition={{
              duration: 12.5,
              times: [0, 0.31, 0.35, 0.41, 0.45, 0.48],
              ease: "easeInOut",
            }}
          >
            View
          </motion.h1>

          {/* "You" - rotates in, merges with Inter, stays visible for 3s, stays after bars disappear, then FASTER fade, green color */}
          <motion.h1
            className="text-8xl font-bold tracking-tight absolute"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              color: '#10b981',
              transformStyle: 'preserve-3d',
              left: '50%',
              marginLeft: '0.5rem',
            }}
            initial={{ x: 30, opacity: 0, rotateY: -90 }}
            animate={{ 
              x: [30, 30, 30, 30, 30, 30, 0, 0, 0, 0],
              opacity: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
              rotateY: [-90, -90, -90, -90, 0, 0, 0, 0, 0, 0],
            }}
            transition={{
              duration: 12.5,
              times: [0, 0.41, 0.45, 0.47, 0.49, 0.56, 0.64, 0.92, 0.96, 1],
              ease: "easeInOut",
            }}
          >
            You
          </motion.h1>
        </motion.div>

        {/* Tagline - stays visible for 3s with InterYou, stays after bars disappear, then FASTER fade */}
        <motion.p
          className="absolute text-slate-600 text-2xl tracking-wide italic"
          style={{ 
            fontFamily: "'Georgia', 'Times New Roman', serif",
            top: '50%',
            marginTop: '5rem',
            fontWeight: 300,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: [0, 0, 0, 1, 1, 1, 1, 0],
            y: [30, 30, 30, 0, 0, 0, 0, 0],
          }}
          transition={{
            duration: 12.5,
            times: [0, 0.45, 0.49, 0.52, 0.64, 0.92, 0.96, 1],
            ease: "easeOut",
          }}
        >
          {displayedText}
        </motion.p>

        {/* Loading dots - visible with InterYou for 3s, stay after bars disappear, then FASTER fade */}
        <motion.div
          className="absolute flex gap-2"
          style={{ bottom: '15%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1, 1, 0] }}
          transition={{ 
            duration: 12.5,
            times: [0, 0.5, 0.52, 0.92, 0.96, 1],
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 bg-sky-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}