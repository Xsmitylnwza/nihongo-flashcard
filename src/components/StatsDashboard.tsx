import { motion } from 'framer-motion';
import { fadeUp } from '../utils/animations';
import type { LessonStats } from '../data/vocabulary';
import classNames from 'classnames';
import { Trophy, RefreshCcw, Activity } from 'lucide-react';

interface StatsDashboardProps {
  stats: Record<string, LessonStats>;
  onClear: () => void;
}

export const StatsDashboard = ({ stats, onClear }: StatsDashboardProps) => {
  const lessons = Object.keys(stats);

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      className="w-full max-w-4xl mx-auto z-10 pointer-events-auto"
    >
      <motion.div variants={fadeUp} className="flex justify-between items-end mb-12 border-b-4 border-paper-cream pb-4">
        <div>
           <h2 className="text-5xl font-marker text-accent-green mb-2">Performance</h2>
           <p className="font-serif-custom text-xl italic text-paper-cream">Track your learning progress.</p>
        </div>
        <button 
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-bold torn-text-bg hover:opacity-80 transition-opacity pointer-events-auto z-20"
        >
          <RefreshCcw size={18} />
          <span className="hidden sm:inline">Clear Data</span>
        </button>
      </motion.div>

      {lessons.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center text-paper-cream text-lg italic mt-12 bg-bg-forest p-8 torn-paper-1">
          No stats recorded yet. Complete a lesson to see your progress!
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {lessons.map(lesson => {
            const stat = stats[lesson];
            return (
              <motion.div 
                key={lesson}
                variants={fadeUp}
                className={classNames(
                  "bg-paper-cream text-bg-dark p-6 torn-paper-1 shadow-[6px_6px_0px_rgba(255,255,255,0.2)]",
                  "border-4 border-transparent hover:scale-105 transition-transform"
                )}
              >
                <h3 className="text-2xl font-bold font-grotesk mb-4 break-words px-2 py-1 bg-accent-red text-white inline-block shadow-[2px_2px_0px_#000]">
                  {lesson.replace('_', ' ')}
                </h3>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-accent-red font-bold">
                    <Trophy size={20} />
                    <span>Best Score</span>
                  </div>
                  <span className="text-2xl font-marker">{stat.bestScore} <span className="text-sm">/ {stat.totalCards}</span></span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-accent-green font-bold">
                    <Activity size={20} />
                    <span>Last Run</span>
                  </div>
                  <span className="text-2xl font-marker">{stat.lastScore} <span className="text-sm">/ {stat.totalCards}</span></span>
                </div>

                <div className="mt-6 border-t-4 border-bg-dark pt-4 flex justify-between items-center text-sm font-bold font-grotesk tracking-wider">
                  <span className="opacity-60">ATTEMPTS: {stat.attempts}</span>
                  <span className={classNames(
                    "px-2 py-1",
                    stat.lastPercent >= 80 ? "bg-accent-green text-bg-dark" : "bg-bg-dark text-white"
                  )}>
                    {stat.lastPercent}% ACCURACY
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  );
};
