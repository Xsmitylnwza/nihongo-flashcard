import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shuffle, Check, X, BarChart2, BookOpen } from 'lucide-react';
import classNames from 'classnames';
import { lessonsData } from './data/vocabulary';
import type { LessonStats } from './data/vocabulary';
import { fadeUp } from './utils/animations';
import { CustomCursor } from './components/CustomCursor';
import { LessonSelector } from './components/LessonSelector';
import { Flashcard } from './components/Flashcard';
import { StatsDashboard } from './components/StatsDashboard';
import { WordFilter } from './components/WordFilter';
import { Settings } from 'lucide-react';

function App() {
  const lessonNames = Object.keys(lessonsData);
  const [currentView, setCurrentView] = useState<'flashcards' | 'stats'>('flashcards');
  const [globalStats, setGlobalStats] = useState<Record<string, LessonStats>>({});
  
  const [activeLesson, setActiveLesson] = useState<string>(lessonNames[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [shuffledList, setShuffledList] = useState(lessonsData[activeLesson as keyof typeof lessonsData]);
  const [isFinished, setIsFinished] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [excludedWords, setExcludedWords] = useState<Record<string, string[]>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const currentCard = shuffledList[currentIndex];

  useEffect(() => {
    const saved = localStorage.getItem('nihongo_flashcards_stats');
    if (saved) {
      try {
        setGlobalStats(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse stats');
      }
    }
    const savedExclusions = localStorage.getItem('nihongo_flashcards_exclusions');
    if (savedExclusions) {
      try {
        setExcludedWords(JSON.parse(savedExclusions));
      } catch (e) {
        console.error('Failed to parse exclusions');
      }
    }
  }, []);

  const clearStats = () => {
    setGlobalStats({});
    localStorage.removeItem('nihongo_flashcards_stats');
  };

  const saveStats = (lesson: string, score: number, total: number) => {
    setGlobalStats(prev => {
      const prevStat = prev[lesson] || { attempts: 0, bestScore: 0, totalCards: total, lastScore: 0, lastPercent: 0 };
      const newPercent = Math.round((score / total) * 100);
      const newStat: LessonStats = {
        attempts: prevStat.attempts + 1,
        bestScore: Math.max(prevStat.bestScore, score),
        totalCards: total,
        lastScore: score,
        lastPercent: newPercent
      };
      const updated = { ...prev, [lesson]: newStat };
      localStorage.setItem('nihongo_flashcards_stats', JSON.stringify(updated));
      return updated;
    });
  };

  const getFilteredLessonList = (lesson: string, currentExclusions: Record<string, string[]> = excludedWords) => {
    const exclusions = currentExclusions[lesson] || [];
    const full = lessonsData[lesson as keyof typeof lessonsData];
    return full.filter(v => !exclusions.includes(v.romaji));
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setCurrentIndex((prev) => (prev + 1) % shuffledList.length);
  };

  const handleScore = (score: 'correct' | 'incorrect') => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const cardKey = currentCard.romaji;
    const nextScores = { ...scores, [cardKey]: score };
    
    setScores(nextScores);
    
    setTimeout(() => {
      if (currentIndex === shuffledList.length - 1) {
        setIsFinished(true);
        const correctCount = shuffledList.filter(card => nextScores[card.romaji] === 'correct').length;
        saveStats(activeLesson, correctCount, shuffledList.length);
      } else {
        setCurrentIndex((prevInd) => (prevInd + 1) % shuffledList.length);
      }
      setIsTransitioning(false);
    }, 400);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setCurrentIndex((prev) => (prev - 1 + shuffledList.length) % shuffledList.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView === 'stats' || isFinished || isTransitioning || isFilterOpen) return;
      if (e.key === '1' || e.code === 'Numpad1') handleScore('incorrect');
      if (e.key === '3' || e.code === 'Numpad3') handleScore('correct');
      if (e.key === 'ArrowLeft' || e.key === '4' || e.code === 'Numpad4') handlePrev();
      if (e.key === 'ArrowRight' || e.key === '6' || e.code === 'Numpad6') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isFinished, isTransitioning, isFilterOpen, handleScore]);

  useEffect(() => {
    // If deck becomes empty due to active filter changes, handle it
    if (shuffledList.length === 0 && !isFinished && getFilteredLessonList(activeLesson).length === 0) {
       // Deck is empty and filtered list is empty. 
    }
  }, [excludedWords, activeLesson]);

  const handleShuffle = () => {
    setScores({});
    setIsFinished(false);
    setShuffledList(() => {
      const fullList = [...getFilteredLessonList(activeLesson)];
      for (let i = fullList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fullList[i], fullList[j]] = [fullList[j], fullList[i]];
      }
      return fullList;
    });
    setCurrentIndex(0);
  };

  const handleRetryIncorrect = () => {
    const incorrectCards = shuffledList.filter(card => scores[card.romaji] === 'incorrect');
    if (incorrectCards.length === 0) return;
    
    setScores({});
    setIsFinished(false);
    setShuffledList(() => {
      const shuffled = [...incorrectCards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentIndex(0);
  };

  const handleSelectLesson = (lesson: string) => {
    setActiveLesson(lesson);
    setScores({});
    setIsFinished(false);
    setShuffledList(getFilteredLessonList(lesson));
    setCurrentIndex(0);
  };

  const handleToggleExclude = (romaji: string) => {
    setExcludedWords(prev => {
      const lessonExclusions = prev[activeLesson] || [];
      const newExclusions = lessonExclusions.includes(romaji)
        ? lessonExclusions.filter(r => r !== romaji)
        : [...lessonExclusions, romaji];
      const updated = { ...prev, [activeLesson]: newExclusions };
      localStorage.setItem('nihongo_flashcards_exclusions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleAll = (selectAll: boolean) => {
    setExcludedWords(prev => {
      const newExclusions = selectAll 
        ? [] 
        : lessonsData[activeLesson as keyof typeof lessonsData].map(v => v.romaji);
      const updated = { ...prev, [activeLesson]: newExclusions };
      localStorage.setItem('nihongo_flashcards_exclusions', JSON.stringify(updated));
      return updated;
    });
  };

  const totalCards = shuffledList.length;
  const correctCount = shuffledList.filter(card => scores[card.romaji] === 'correct').length;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col pt-12 pb-24 px-4 sm:px-8">
      <div className="noise-overlay"></div>
      <CustomCursor />

      <motion.div 
        className="max-w-4xl mx-auto w-full z-10"
        initial="initial"
        animate="animate"
        variants={{
          initial: {},
          animate: { transition: { staggerChildren: 0.1 } }
        }}
      >
        <motion.header variants={fadeUp} className="text-center mb-12 relative">
          <div className="absolute top-0 right-0 z-20 pointer-events-auto">
            <button 
              onClick={() => setCurrentView(v => v === 'stats' ? 'flashcards' : 'stats')}
              className="flex items-center gap-2 px-4 py-2 bg-paper-cream text-bg-dark font-bold hover:bg-accent-green hover:text-bg-dark transition-colors border-2 border-bg-dark shadow-[4px_4px_0px_rgba(255,255,255,0.2)]"
            >
              {currentView === 'stats' ? (
                <>
                  <BookOpen size={20} />
                  <span className="hidden sm:inline">Practice</span>
                </>
              ) : (
                <>
                  <BarChart2 size={20} />
                  <span className="hidden sm:inline">Stats</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-5xl sm:text-7xl font-marker text-paper-cream mb-4 tracking-wider mt-12 sm:mt-0">
            <span className="ransom-letter mr-2">N</span>ihongo
          </h1>
          <p className="font-serif-custom text-xl italic text-accent-green mb-6 sm:mb-0">
            Flashcards for mastering Japanese basics.
          </p>
        </motion.header>

        {currentView === 'stats' ? (
          <StatsDashboard stats={globalStats} onClear={clearStats} />
        ) : (
          <>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 justify-between w-full mb-8 pointer-events-auto">
              <LessonSelector 
                lessons={lessonNames} 
                activeLesson={activeLesson} 
                onSelect={handleSelectLesson} 
              />
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-paper-cream text-paper-cream font-bold hover:bg-paper-cream hover:text-bg-dark transition-colors shrink-0"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">ตั้งค่าคำศัพท์</span>
              </button>
            </motion.div>

        <WordFilter 
          isOpen={isFilterOpen}
          onClose={() => {
            setIsFilterOpen(false);
            handleShuffle();
          }}
          vocabularyList={lessonsData[activeLesson as keyof typeof lessonsData]}
          excludedWords={excludedWords[activeLesson] || []}
          onToggleExclude={handleToggleExclude}
          onToggleAll={handleToggleAll}
          lessonName={activeLesson}
        />

        <motion.div variants={fadeUp} className="flex flex-col items-center mt-4">
          {totalCards === 0 ? (
            <div className="text-center bg-bg-forest p-12 text-paper-cream font-bold text-xl torn-paper-1 pointer-events-auto z-20">
               คุณได้ตั้งค่าปิดการใช้งานคำศัพท์ทุกคำในบทนี้แล้ว! <br /> กรุณากดปุ่ม <b>"ตั้งค่าคำศัพท์"</b> ด้านบนเพื่อเปิดใช้งานอย่างน้อย 1 คำ
            </div>
          ) : isFinished ? (
            <div className="w-full sm:w-[500px] flex flex-col items-center bg-paper-cream text-bg-dark p-12 torn-paper-1 shadow-[8px_8px_0px_rgba(255,255,255,0.1)] mx-auto z-20 pointer-events-auto mt-8">
              <h2 className="text-4xl sm:text-5xl font-marker mb-6 text-accent-red text-center leading-tight">ยอดเยี่ยม!</h2>
              <div className="text-2xl font-grotesk font-bold mb-4 text-center">
                 ทำผ่านทั้งหมด {correctCount} / {totalCards} ข้อ
              </div>
              <div className="text-7xl font-grotesk font-bold text-accent-green mb-8">
                 {Math.round((correctCount / totalCards) * 100)}%
              </div>
              <div className="flex flex-col sm:flex-row justify-center w-full gap-4 mt-8 pointer-events-auto">
                {correctCount < totalCards && (
                  <button 
                    onClick={handleRetryIncorrect} 
                    className="px-8 py-3 bg-accent-red text-white torn-text-bg font-bold hover:bg-bg-dark transition-colors cursor-pointer z-30 shadow-[4px_4px_0px_rgba(255,255,255,0.2)]"
                  >
                    ทวนเฉพาะข้อที่ผิด
                  </button>
                )}
                <button 
                  onClick={handleShuffle} 
                  className="px-8 py-3 bg-bg-dark text-paper-cream torn-text-bg font-bold hover:bg-accent-green hover:text-bg-dark transition-colors cursor-pointer z-30 shadow-[4px_4px_0px_rgba(255,255,255,0.2)]"
                >
                  เริ่มใหม่ทั้งหมด (Shuffle)
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={classNames(
            "mb-6 font-bold tracking-widest text-sm px-4 py-1 torn-text-bg pointer-events-auto transition-colors",
            scores[currentCard?.romaji] === 'correct' ? "bg-accent-green text-bg-dark" :
            scores[currentCard?.romaji] === 'incorrect' ? "bg-accent-red text-white" :
            "bg-bg-forest text-paper-cream"
          )}>
            {currentIndex + 1} / {shuffledList.length}
          </div>

          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={`${currentCard.romaji}-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full pointer-events-auto z-10"
              >
                <Flashcard vocabulary={currentCard} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-8 mt-8">
             <button 
               onClick={() => handleScore('incorrect')} 
               disabled={isTransitioning}
               className={classNames(
                 "group flex flex-col items-center justify-center p-4 rounded-full border-4 border-bg-dark bg-paper-cream text-accent-red transition-all transform pointer-events-auto z-20 shadow-[4px_4px_0px_rgba(255,255,255,0.1)]",
                 isTransitioning ? "opacity-50 cursor-not-allowed" : "hover:bg-accent-red hover:text-white hover:-translate-y-1 hover:scale-105"
               )}
             >
               <X size={32} strokeWidth={3} />
               <span className="font-grotesk font-bold text-sm mt-1 hidden sm:block">ผิด</span>
             </button>
             <button 
               onClick={() => handleScore('correct')} 
               disabled={isTransitioning}
               className={classNames(
                 "group flex flex-col items-center justify-center p-4 rounded-full border-4 border-bg-dark bg-paper-cream text-accent-green transition-all transform pointer-events-auto z-20 shadow-[4px_4px_0px_rgba(255,255,255,0.1)]",
                 isTransitioning ? "opacity-50 cursor-not-allowed" : "hover:bg-accent-green hover:text-bg-dark hover:-translate-y-1 hover:scale-105"
               )}
             >
               <Check size={32} strokeWidth={3} />
               <span className="font-grotesk font-bold text-sm mt-1 hidden sm:block">ถูก</span>
             </button>
          </div>

          <div className="flex gap-6 mt-8">
            <button 
              onClick={handlePrev}
              className="p-4 bg-paper-cream text-bg-dark rounded-full hover:bg-accent-red hover:text-white transition-colors z-20 pointer-events-auto focus:outline-none"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={handleShuffle}
              className="p-4 border-2 border-paper-cream text-paper-cream rounded-full hover:bg-paper-cream hover:text-bg-dark transition-colors z-20 pointer-events-auto focus:outline-none"
            >
              <Shuffle size={20} />
            </button>
            
            <button 
              onClick={handleNext}
              className="p-4 bg-paper-cream text-bg-dark rounded-full hover:bg-accent-red hover:text-white transition-colors z-20 pointer-events-auto focus:outline-none"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          </>
          )}
        </motion.div>
        </>
        )}
        
      </motion.div>
    </div>
  );
}

export default App;
