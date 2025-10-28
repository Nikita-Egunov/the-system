"use client"

import React, { useState, useEffect, useRef } from 'react';

interface DoubleClickCheckboxProps {
  label?: string;
  state: 'idle' | 'in_progress' | 'done';
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
}

export const DoubleClickCheckbox: React.FC<DoubleClickCheckboxProps> = ({ label, state, isAnimating, setIsAnimating }) => {

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const getStateColor = () => {
    switch (state) {
      case 'idle':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'done':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStateLabel = () => {
    switch (state) {
      case 'idle':
        return 'не начата';
      case 'in_progress':
        return 'в работе';
      case 'done':
        return 'готово';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-500 ease-in-out transform ${isAnimating ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
          } ${getStateColor()}`}
      >
        {state === 'in_progress' && isAnimating && (
          <div className="w-full h-full rounded-full border-2 border-white border-t-transparent animate-spin"></div>
        )}
      </div>
      <span className="text-sm">
        {label} {getStateLabel() && <span className="text-gray-400">({getStateLabel()})</span>}
      </span>
    </div>
  );
};