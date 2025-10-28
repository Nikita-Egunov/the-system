import React from 'react';
import clsx from 'clsx';

interface RingConfig {
  value: number; // значение от 0 до 100
  color?: string; // цвет кольца
  strokeWidth?: number; // толщина линии кольца
}

interface CircularProgressProps {
  rings: RingConfig[]; // массив конфигураций колец
  size?: number; // размер компонента
  trackColor?: string; // цвет трека
  showPercentage?: boolean; // показывать проценты
  showTimer?: boolean; // показывать таймер вместо процентов
  timerValue?: string; // значение таймера для отображения
  className?: string;
}

export default function CircularProgress({
  rings = [],
  size = 120,
  trackColor = '#374151', // gray-700 по умолчанию
  showPercentage = true,
  showTimer = false,
  timerValue = '',
  className = '',
}: CircularProgressProps) {
  const radius = (size - (rings[0]?.strokeWidth || 8)) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90" // начинаем отсчет с верха
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Фоновый круг */}
        <circle
          className="text-gray-700"
          stroke={trackColor}
          strokeWidth={rings[0]?.strokeWidth || 8}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Кольца прогресса */}
        {rings.map((ring, index) => {
          const normalizedValue = Math.min(Math.max(ring.value, 0), 100);
          const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
          const ringRadius = radius - index * ((rings[0]?.strokeWidth || 8) + 2);

          return (
            <circle
              key={index}
              className="transition-all duration-500 ease-in-out"
              stroke={ring.color || '#3b82f6'}
              strokeWidth={ring.strokeWidth || 8}
              strokeLinecap="round"
              fill="transparent"
              r={ringRadius}
              cx={size / 2}
              cy={size / 2}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
              }}
            />
          );
        })}
      </svg>
      {showTimer ? (
        <span className="absolute text-sm font-medium text-gray-400">
          {timerValue}
        </span>
      ) : showPercentage ? (
        <span className="absolute text-sm font-medium text-gray-400">
          {rings[0] ? Math.round(Math.min(Math.max(rings[0].value, 0), 100)) : 0}%
        </span>
      ) : null}
    </div>
  );
}
