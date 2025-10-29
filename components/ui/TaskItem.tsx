"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { DoubleClickCheckbox } from '@/lib/ui/DoubleClickCheckbox';
import { TaskProgress } from '@/lib/types';

interface TaskItemProps {
  id: string;
  text: string;
  status: 'idle' | 'in_progress' | 'done';
  setStatus: (taskId: string, status: 'idle' | 'in_progress' | 'done') => void;
  deadline: Date;
}

export default function TaskItem({ id, text, status, setStatus, deadline }: TaskItemProps) {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Загружаем сохраненный прогресс из localStorage при монтировании
  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('tasksProgress') || '[]') as TaskProgress[] | [];

    const taskProgress = savedProgress.filter((task) => task.id === id) as TaskProgress[] | undefined;

    if (taskProgress) {
      requestAnimationFrame(() => {
        setProgress(taskProgress[0].progress);
        console.log('taskProgress[0].progress:', taskProgress[0].progress);
      });
    }
  }, [id]);

  useEffect(() => {
    console.log('progress:', progress);
  }, [progress]);

  function getTaskDate(deadline: Date) {
    const now = new Date();
    const deadlineDate = new Date(deadline);

    const createdAt = new Date(localStorage.getItem(`taskCreatedAt_${id}`) as string)

    console.log('createdAt:', createdAt);


    const totalTime = deadlineDate.getTime() - createdAt.getTime();
    const elapsedTime = now.getTime() - createdAt.getTime();

    return {
      totalTime,
      elapsedTime,
      deadlineDate,
      now
    }
  }

  // Рассчитываем прогресс на основе дедлайна
  useEffect(() => {
    if (!deadline) return;

    const calculateProgress = () => {
      console.log('calculateProgress called');
      const taskDates = getTaskDate(deadline)
      const deadlineDate = taskDates.deadlineDate

      // Если дедлайн уже прошел
      if (taskDates.now > deadlineDate) {
        return 100; // Возвращаем 100, чтобы скрыть прогресс бар
      }

      // Рассчитываем общее время и оставшееся время
      const totalTime = taskDates.totalTime
      const remainingTime = deadlineDate.getTime() - taskDates.now.getTime();
      console.log(`totalTime: ${totalTime} && remainingTime: ${remainingTime}`);


      // Рассчитываем прогресс (чем меньше времени осталось, тем больше прогресс)
      const progressPercentage = (remainingTime / totalTime) * 100;
      console.log('progressPercentage:', progressPercentage);

      return Math.min(Math.max(progressPercentage, 0), 100);
    };

    // Устанавливаем начальное значение прогресса через requestAnimationFrame
    // чтобы избежать синхронного вызова setState
    requestAnimationFrame(() => {
      const initialProgress = calculateProgress();
      setProgress(initialProgress);
    });

    // Обновляем прогресс каждую минуту
    const progressInterval = setInterval(() => {
      const updatedProgress = calculateProgress();
      setProgress(updatedProgress);

      // Обновляем в localStorage
      const tasksProgress = JSON.parse(localStorage.getItem('tasksProgress') || '{}');
      tasksProgress[id] = updatedProgress;
      localStorage.setItem('tasksProgress', JSON.stringify(tasksProgress));

      // Проверяем, если время вышло
      if (updatedProgress === 100) {
        setProgress(0); // Скрываем прогресс бар
      }
    }, 60000);

    return () => clearInterval(progressInterval);
  }, [deadline, id]);

  // Рассчитываем оставшееся время до дедлайна
  useEffect(() => {
    if (!deadline) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diff = deadlineDate.getTime() - now.getTime();

      if (diff <= 0) {
        return "Время вышло";
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let timeString = "";
      if (days > 0) timeString += `${days}д `;
      if (hours > 0 || days > 0) timeString += `${hours}ч `;
      if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}м `;
      timeString += `${seconds}с`;

      return timeString.trim();
    };

    // Устанавливаем начальное значение времени через requestAnimationFrame
    requestAnimationFrame(() => {
      setTimeLeft(calculateTimeLeft());
    });

    // Обновляем оставшееся время каждую секунду
    const timeInterval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [deadline]);

  // Функция для определения цвета прогрессбара в зависимости от близости к дедлайну
  const getProgressBarColor = () => {
    console.log('getProgressBarColor called');
    if (progress === 0) {
      return 'bg-red-500'; // Красный - время вышло
    } else if (progress > 70) {
      return 'bg-green-500'; // Зеленый - много времени
    } else if (progress >= 30 && progress <= 70) {
      return 'bg-yellow-500'; // Желтый - среднее время
    } else {
      return 'bg-red-500'; // Красный - мало времени
    }
  };

  const getTimerBarColor = () => {
    console.log('getProgressBarColor called');
    if (progress === 0) {
      return 'bg-red-500/20'; // Красный - время вышло
    } else if (progress > 70) {
      return 'bg-green-500/20'; // Зеленый - много времени
    } else if (progress >= 30 && progress <= 70) {
      return 'bg-yellow-500/20'; // Желтый - среднее время
    } else {
      return 'bg-red-500/20'; // Красный - мало времени
    }
  };

  function getNewState() {
    if (status === 'idle') {
      setIsAnimating(true)
      return 'in_progress';
    } else {
      return 'done';
    }
  }

  function handleClick() {
    const newStatus = getNewState()

    setStatus(id, newStatus)
  }

  return (
    <AnimatePresence>
      <motion.li
        layout
        className={clsx('')}
      >
        <label
          className={clsx(
            'flex flex-col-reverse gap-y-2 p-3 pt-5 rounded-lg transition-colors cursor-pointer relative overflow-hidden',
            (status === 'done') && 'bg-green-900/30 border border-green-900/50',
            (status === 'in_progress') && 'bg-yellow-500/30 border border-yellow-500/50',
            (status === 'idle') && 'bg-gray-700/50 hover:bg-gray-700'
          )}
          onClick={handleClick}
        >
          {status !== 'done' &&
            <div className={`absolute top-0 right-0 px-2 py-1 rounded-bl-lg text-xs text-gray-200 bg-gray-400/20 ${getTimerBarColor()}`}>
              {timeLeft}
            </div>
          }
          <DoubleClickCheckbox
            isAnimating={isAnimating}
            setIsAnimating={setIsAnimating}
            state={status}
          />
          <div className='flex items-center'>
            <span className={`flex-1 ${(status === 'done') ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
              {text}
            </span>
            <svg className={clsx("w-4 h-4 text-green-400 ml-2 shrink-0",
              (status === 'done') ? '' : 'opacity-0',
            )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {(status !== 'done' && progress > 0) && (
              <div className="bg-gray-700 rounded-full overflow-hidden absolute bottom-0 left-0 w-full">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ease-out ${getProgressBarColor()}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </label>
      </motion.li>
    </AnimatePresence>
  );
}
