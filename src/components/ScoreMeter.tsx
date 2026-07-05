import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface ScoreMeterProps {
  score: number;
}

export function ScoreMeter({ score }: ScoreMeterProps) {
  const [currentScore, setCurrentScore] = useState(0);

  // SVG parameters
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate local state from 0 to target score for numerical counter
    const controls = animate(0, score, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (latest) => setCurrentScore(Math.round(latest))
    });
    return () => controls.stop();
  }, [score]);

  // Color mapping based on score
  const getColor = (s: number) => {
    if (s >= 85) return '#34c759'; // Pass green
    if (s >= 70) return '#ff9f0a'; // Warn yellow
    return '#ff3b30'; // Fail red
  };

  const currentColor = getColor(score);
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div id="score-meter" className="flex flex-col items-center justify-center select-none">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Track Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="#e5e5e7"
            strokeWidth={strokeWidth}
          />
          {/* Animated Progress Circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke={currentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Centered Numerical Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            id="score-number"
            className="text-4xl font-extrabold text-gray-900 tracking-tight"
            style={{ color: currentColor }}
          >
            {currentScore}
          </motion.span>
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
            Score
          </span>
        </div>
      </div>
    </div>
  );
}
