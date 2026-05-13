import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import classNames from 'classnames';
import type { Vocabulary } from '../data/vocabulary';

interface WordFilterProps {
  isOpen: boolean;
  onClose: () => void;
  vocabularyList: Vocabulary[];
  excludedWords: string[];
  onToggleExclude: (romaji: string) => void;
  onToggleAll: (selectAll: boolean) => void;
  lessonName: string;
}

export const WordFilter = ({
  isOpen,
  onClose,
  vocabularyList,
  excludedWords,
  onToggleExclude,
  onToggleAll,
  lessonName
}: WordFilterProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" 
        onClick={onClose} 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-paper-cream w-full max-w-2xl max-h-[85vh] flex flex-col torn-paper-1 shadow-[12px_12px_0px_#080808] border-4 border-bg-dark z-10"
      >
        <div className="p-6 border-b-4 border-bg-dark flex justify-between items-center bg-accent-red text-white shrink-0">
          <h2 className="text-3xl font-marker">{lessonName.replace('_', ' ')} Settings</h2>
          <button onClick={onClose} className="hover:scale-110 transition-transform focus:outline-none">
            <X size={32} strokeWidth={3} />
          </button>
        </div>

        <div className="p-4 flex gap-4 border-b-4 border-bg-dark bg-bg-forest text-paper-cream overflow-x-auto shrink-0">
           <button 
             onClick={() => onToggleAll(true)}
             className="px-4 py-2 bg-paper-cream text-bg-dark font-bold font-grotesk whitespace-nowrap hover:bg-accent-green hover:text-bg-dark transition-colors shrink-0"
           >
             Include All
           </button>
           <button 
             onClick={() => onToggleAll(false)}
             className="px-4 py-2 border-2 border-paper-cream font-bold font-grotesk whitespace-nowrap hover:bg-paper-cream hover:text-bg-dark transition-colors shrink-0"
           >
             Exclude All
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3 custom-scrollbar min-h-0">
          <p className="text-sm font-bold font-serif-custom italic text-bg-dark/60 text-center mb-2">Uncheck items you want to skip during practice.</p>
          {vocabularyList.map((vocab) => {
            const isExcluded = excludedWords.includes(vocab.romaji);
            return (
              <label 
                key={vocab.romaji} 
                className={classNames(
                  "flex items-center gap-4 p-4 border-4 transition-all cursor-pointer",
                  isExcluded ? "bg-bg-dark text-paper-cream border-bg-dark opacity-60" : "bg-white text-bg-dark border-bg-dark hover:-translate-y-1 hover:shadow-[4px_4px_0px_#080808]"
                )}
              >
                <div className={classNames(
                  "w-8 h-8 flex items-center justify-center border-4 shrink-0 transition-colors",
                  isExcluded ? "border-paper-cream/20 bg-transparent text-transparent" : "border-bg-dark bg-accent-green text-bg-dark"
                )}>
                  {!isExcluded && <Check strokeWidth={4} size={20} />}
                </div>
                <input 
                  type="checkbox" 
                  checked={!isExcluded}
                  onChange={() => onToggleExclude(vocab.romaji)}
                  className="hidden"
                />
                <div className="flex-1 flex justify-between items-center">
                  <div className={classNames("font-grotesk font-bold text-xl", isExcluded && "line-through opacity-50")}>{vocab.Thai}</div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold tracking-tighter">{vocab.Japanese}</span>
                    <span className="text-sm font-marker text-accent-red opacity-80">{vocab.romaji}</span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
