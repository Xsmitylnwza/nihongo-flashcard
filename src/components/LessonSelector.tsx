import { motion } from 'framer-motion';
import classNames from 'classnames';

interface LessonSelectorProps {
  lessons: string[];
  activeLesson: string;
  onSelect: (lesson: string) => void;
}

export const LessonSelector = ({ lessons, activeLesson, onSelect }: LessonSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center my-8">
      {lessons.map((lesson, i) => (
        <motion.button
          key={lesson}
          onClick={() => onSelect(lesson)}
          className={classNames(
            "px-6 py-2 font-grotesk font-bold uppercase tracking-wider text-sm sm:text-base transition-colors",
            "border-2 pointer-events-auto z-10",
            activeLesson === lesson 
              ? "bg-accent-red text-white border-accent-red torn-text-bg shadow-[4px_4px_0px_rgba(255,255,255,0.2)]" 
              : "bg-transparent text-paper-cream border-paper-cream hover:bg-paper-cream hover:text-bg-dark torn-text-bg"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {lesson.replace('_', ' ')}
        </motion.button>
      ))}
    </div>
  );
};
