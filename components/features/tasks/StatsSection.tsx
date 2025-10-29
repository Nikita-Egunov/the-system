import React, { useState, useEffect } from 'react';
import CircularProgress from '../../ui/CircularProgress';

interface StatsSectionProps {
  totalTasks: number;
  completedTasks: number;
  totalShortTasks?: number;
  completedShortTasks?: number;
  totalDailyTasks?: number;
  completedDailyTasks?: number;
  totalOverdueTasks?: number;
  overdueTasks?: number;
  className?: string;
}

export default function StatsSection({ totalTasks, completedTasks, totalShortTasks, completedShortTasks, totalOverdueTasks, overdueTasks, completedDailyTasks, totalDailyTasks, className = '' }: StatsSectionProps) {
  const [timeProgress, setTimeProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [yearProgress, setYearProgress] = useState(0);
  const [remainingYearTime, setRemainingYearTime] = useState(0);

  // Рассчитываем прогресс времени (сколько прошло с начала дня)
  useEffect(() => {
    const updateTimeProgress = () => {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const totalDayMs = endOfDay.getTime() - startOfDay.getTime();
      const elapsedMs = now.getTime() - startOfDay.getTime();
      const progress = (elapsedMs / totalDayMs) * 100;
      const remainingMs = endOfDay.getTime() - now.getTime();

      setTimeProgress(Math.round(progress));
      setRemainingTime(remainingMs);

      // Рассчитываем прогресс года
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      const totalYearMs = endOfYear.getTime() - startOfYear.getTime();
      const elapsedYearMs = now.getTime() - startOfYear.getTime();
      const yearProgress = (elapsedYearMs / totalYearMs) * 100;
      const remainingYearMs = endOfYear.getTime() - now.getTime();

      setYearProgress(Math.round(yearProgress));
      setRemainingYearTime(remainingYearMs);
    };

    updateTimeProgress();
    const interval = setInterval(updateTimeProgress, 1000); // обновляем каждую минуту

    return () => clearInterval(interval);
  }, []);

  // Рассчитываем прогресс задач
  // Функция для вычисления динамического цвета на основе прогресса времени
  const getDynamicColor = (progress: number): string => {
    // Чем больше прогресс (ближе к концу дня), тем краснее цвет
    // Чем меньше прогресс (ближе к началу дня), тем зеленее цвет
    const redRatio = Math.min(100, progress) / 100; // от 0 до 1
    const greenRatio = 1 - redRatio; // от 1 до 0

    // Конвертируем в RGB значения (красный увеличивается, зеленый уменьшается)
    const red = Math.round(255 * redRatio);
    const green = Math.round(255 * greenRatio);
    const blue = 0; // Синий компонент не используем для чистого перехода от зеленого к красному

    return `rgb(${red}, ${green}, ${blue})`;
  };

  // Форматирование оставшегося времени в удобочитаемый формат
  const formatRemainingTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}д ${hours}ч ${minutes}м`;
    }
    return `${hours}ч ${minutes}м ${seconds}с`;
  };

  // Рассчитываем прогресс задач только для коротких задач
  const taskProgress = totalShortTasks && totalShortTasks > 0
    ? Math.round((completedShortTasks! / totalShortTasks) * 100)
    : 0;

  // Рассчитываем прогресс задач для всех задач
  const allProgress = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const dailyProgress = totalDailyTasks && totalDailyTasks > 0 && completedDailyTasks
    ? Math.round((totalDailyTasks / completedDailyTasks) * 100)
    : 0;
  return (
    <div className={`bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Статистика</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Прогресс времени */}
        <div className="flex flex-col items-center">
          <CircularProgress
            rings={[
              {
                value: timeProgress,
                color: getDynamicColor(timeProgress),
                strokeWidth: 6
              },
              {
                value: yearProgress,
                color: getDynamicColor(yearProgress), // purple-500
                strokeWidth: 4
              }
            ]}
            size={140}
            trackColor="#374151" // gray-700
            showTimer={true}
            timerValue={formatRemainingTime(remainingTime)}
          />
          <div className="mt-4 text-center flex items-center gap-4.5">
            <div className='flex flex-col justify-center'>
              <h3 className="text-gray-300 font-medium">День</h3>
              <p className="text-gray-400 text-sm">
                Осталось: {formatRemainingTime(remainingTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Прогресс задач */}
        <div className="flex flex-col items-center">
          <CircularProgress
            rings={[
              {
                value: dailyProgress,
                color: "#3b82f6",
                strokeWidth: 6
              },
              {
                value: taskProgress,
                color: "#10b981", // emerald-500
                strokeWidth: 4
              },
              {
                value: allProgress,
                color: "#f59e0b", // yellow-500
                strokeWidth: 3
              },
              {
                value: totalOverdueTasks && totalOverdueTasks > 0 ? (overdueTasks! / totalOverdueTasks) * 100 : 0,
                color: "#ef4444", // red-500
                strokeWidth: 2.5
              },
            ]}
            size={140}
            trackColor="#374151" // gray-700
          />
          <div className="mt-4 text-center">
            <h3 className="text-gray-300 font-medium">Задачи</h3>
            <p className="text-gray-400 text-sm">
              {completedTasks} из {totalTasks} выполнено
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
