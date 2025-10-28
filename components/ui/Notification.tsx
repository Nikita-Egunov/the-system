import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export default function Notification({ message, onUndo, onDismiss }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 10000); // Исчезает через 10 секунд

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg border border-gray-700 flex items-center space-x-4 z-50"
    >
      <div className="flex-1">
        <p className="text-gray-200">{message}</p>
      </div>
              <button
                onClick={onUndo}
                className="text-indigo-300 hover:text-indigo-200 transition-colors text-sm font-medium"
              >
                Отменить
              </button>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </motion.div>
  );
}
