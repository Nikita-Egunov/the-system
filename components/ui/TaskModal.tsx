import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import CustomSelect from './CustomSelect';
import { TaskColumnData } from '../../lib/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskText: string, columnType: 'short' | 'medium' | 'long' | 'daily', deadline: Date) => void;
}

export default function TaskModal({ isOpen, onClose, onAddTask }: TaskModalProps) {
  const [taskText, setTaskText] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [columnType, setColumnType] = useState<'short' | 'medium' | 'long' | 'daily'>('short');
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  // Функция для полного сброса состояния
  const resetState = () => {
    setTaskText('');
    setDeadline(null);
    setColumnType('short');
    setCalendarError(null);
    setInputError(null);
  };

  // Обработчик закрытия модального окна
  const handleClose = () => {
    resetState();
    onClose();
  };

  // Обработчик изменения типа колонки
  const handleColumnTypeChange = (value: string) => {
    const newColumnType = value as 'short' | 'medium' | 'long' | 'daily';
    setColumnType(newColumnType);

    // Если выбран daily, сбрасываем deadline
    if (newColumnType === 'daily') {
      setDeadline(null);
      setCalendarError(null);
    }
  };

  const filterTime = (time: Date) => {
    const now = new Date();
    const selectedDate = deadline || new Date();

    // Check if the time is in the past (including hours and minutes)
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

    if (selectedDateTime < now) {
      return false;
    }

    // Get all tasks from localStorage
    const savedData = localStorage.getItem('todoTasks');
    if (!savedData) return true;

    const parsedData: { columns: TaskColumnData[] } = JSON.parse(savedData);
    const allTasks = parsedData.columns.flatMap(col => col.tasks);

    // Check if any task in the same column has overlapping time
    const isTimeSlotTaken = allTasks.some(task => {
      if (task.type !== columnType) return false;

      const taskDeadline = new Date(task.deadline);
      // Check if the time slots overlap
      return !(selectedDateTime < taskDeadline || selectedDateTime > new Date(taskDeadline.getTime() + 15 * 60000));
    });

    return !isTimeSlotTaken;
  };

  const dayClassName = (date: Date) => {
    const now = new Date();
    if (date < now) {
      return 'react-datepicker__day--disabled';
    }

    const savedData = localStorage.getItem('todoTasks');
    if (!savedData) return '';

    const parsedData: { columns: TaskColumnData[] } = JSON.parse(savedData);
    const allTasks = parsedData.columns.flatMap(col => col.tasks);

    const isDateTaken = allTasks.some(task => {
      const taskDeadline = new Date(task.deadline);
      return taskDeadline.getFullYear() === date.getFullYear() &&
        taskDeadline.getMonth() === date.getMonth() &&
        taskDeadline.getDate() === date.getDate() &&
        task.type === columnType; // Добавляем проверку на тип колонки
    });

    return isDateTaken ? 'react-datepicker__day--disabled' : '';
  };

  const timeClassName = (time: Date) => {
    const now = new Date();
    const selectedDate = deadline || new Date();
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

    if (selectedDateTime < now) {
      return 'react-datepicker__time--disabled';
    }

    const savedData = localStorage.getItem('todoTasks');
    if (!savedData) return '';

    const parsedData: { columns: TaskColumnData[] } = JSON.parse(savedData);
    const allTasks = parsedData.columns.flatMap(col => col.tasks);

    const isTimeSlotTaken = allTasks.some(task => {
      const taskDeadline = new Date(task.deadline);
      return taskDeadline.getFullYear() === selectedDateTime.getFullYear() &&
        taskDeadline.getMonth() === selectedDateTime.getMonth() &&
        taskDeadline.getDate() === selectedDateTime.getDate() &&
        taskDeadline.getHours() === selectedDateTime.getHours() &&
        taskDeadline.getMinutes() === selectedDateTime.getMinutes() &&
        task.type === columnType; // Добавляем проверку на тип колонки
    });

    return isTimeSlotTaken ? 'react-datepicker__time--disabled' : '';
  };

  const validateTaskText = (text: string): string | null => {
    if (!text.trim()) {
      return 'Описание задачи не может быть пустым';
    }
    if (text.length < 5) {
      return 'Описание задачи должно содержать минимум 5 символов';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log('handleSubmit called');
    e.preventDefault();

    const validationError = validateTaskText(taskText);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    let taskDeadline: Date;

    if (columnType === 'daily') {
      const now = new Date();
      const endOfDayLocal = new Date(now);
      endOfDayLocal.setHours(23, 59, 59, 999);
      taskDeadline = endOfDayLocal
    } else if (deadline) {
      taskDeadline = deadline;
    } else {
      setCalendarError('Пожалуйста, выберите срок выполнения');
      return;
    }

    setCalendarError('');
    setInputError('');
    onAddTask(taskText, columnType, taskDeadline);
    resetState();
    onClose();
  };

  // Очистка ошибок при изменении deadline или columnType
  useEffect(() => {
    if (deadline && calendarError) {
      setTimeout(() => {
        setCalendarError(null);
      }, 0);
    }
  }, [deadline]);

  useEffect(() => {
    if (taskText && inputError) {
      setTimeout(() => {
        setInputError(null);
      }, 0);
    }
  }, [taskText]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleClose} // Используем handleClose вместо onClose
    >
      <div
        className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3 md:p-6">
          <h2 className="text-xl font-semibold text-indigo-200 mb-4">Добавить новую задачу</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="taskText" className="block text-sm font-medium text-gray-300 mb-1">
                Описание задачи
              </label>
              <textarea
                id="taskText"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Введите описание задачи..."
                required
              />
              {inputError && (
                <div className="mt-2 text-red-500 text-sm">
                  {inputError}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="columnType" className="block text-sm font-medium text-gray-300 mb-1">
                Колонка
              </label>
              <CustomSelect
                value={columnType}
                onChange={handleColumnTypeChange} // Используем новый обработчик
                options={[
                  { value: 'short', label: 'Короткие' },
                  { value: 'medium', label: 'Средние' },
                  { value: 'long', label: 'Длинные' },
                  { value: 'daily', label: 'Дэйлик' }
                ]}
                className="w-full"
              />
            </div>

            {columnType !== 'daily' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Срок выполнения  {deadline && (deadline.toLocaleString())}
                </label>
                {calendarError && (
                  <div className="mb-4 text-red-500 text-sm">
                    {calendarError}
                  </div>
                )}
                <DatePicker
                  selected={deadline}
                  onChange={(date: Date | null) => setDeadline(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="Pp"
                  className="datePicker-me"
                  wrapperClassName="w-full"
                  calendarClassName="datePicker-me__calendar"
                  popperClassName="react-datepicker__popper"
                  popperPlacement="bottom-start"
                  required
                  minDate={new Date()}
                  filterTime={filterTime}
                  dayClassName={dayClassName}
                  timeClassName={timeClassName}
                  key={columnType} // Добавляем key для принудительного перерисовки
                  inline
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose} // Используем handleClose вместо onClose
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Добавить задачу
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
