import clsx from 'clsx';
import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
  progressBarClasses?: string;
}

export default function ProgressBar({ completed, total, className = '', progressBarClasses = '' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={clsx(
      '',
      className
    )}>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">Прогресс</span>
        <span className="text-gray-400">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-500 ease-out",
            progressBarClasses == '' ? 'bg-indigo-500' : progressBarClasses
          )}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
