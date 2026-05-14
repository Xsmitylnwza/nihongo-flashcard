import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import type { Vocabulary } from '../data/vocabulary';

interface FlashcardProps {
  vocabulary: Vocabulary;
}

export const Flashcard = ({ vocabulary }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when vocabulary changes
  useEffect(() => {
    setIsFlipped(false);
  }, [vocabulary]);

  // Handle Enter (and Space) key for flipping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        // Prevent default browser behavior (which triggers focused buttons)
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="relative w-full max-w-sm aspect-[4/5] sm:aspect-[3/4] cursor-pointer group mx-auto"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div 
          className={classNames(
            "absolute inset-0 torn-paper-1 flex flex-col items-center justify-center p-8",
            "bg-paper-cream text-bg-dark border-4 border-transparent shadow-[8px_8px_0px_rgba(255,255,255,0.1)]"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <h2 className="text-4xl sm:text-5xl font-grotesk font-bold text-center leading-tight">{vocabulary.Thai}</h2>
        </div>

        {/* Back */}
        <div 
          className={classNames(
            "absolute inset-0 torn-paper-1 flex flex-col items-center justify-center p-8",
            "bg-bg-dark text-paper-cream border-4 border-accent-red"
          )}
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          <span className="text-xl font-marker mb-2 text-accent-green">{vocabulary.romaji}</span>
          <span className="text-2xl font-serif-custom text-accent-red mb-4">{vocabulary.Kana}</span>
          <h2 className="text-6xl sm:text-7xl font-grotesk font-bold text-center leading-normal pb-2">{vocabulary.Japanese}</h2>
        </div>
      </motion.div>
    </div>
  );
};
