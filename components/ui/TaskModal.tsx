import React, { useState } from 'react';
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


  const handleSubmit = (e: React.FormEvent) => {
    console.log('handleSubmit called');
    e.preventDefault();
    if (taskText.trim()) {
      let taskDeadline: Date;

      if (columnType === 'daily') {
        const now = new Date();
        const endOfDayLocal = new Date(now);
        endOfDayLocal.setHours(23, 59, 59, 999);
        taskDeadline = endOfDayLocal
      } else if (deadline) {
        taskDeadline = deadline;
      } else {
        return;
      }

      onAddTask(taskText, columnType, taskDeadline);
      setTaskText('');
      setDeadline(null);
      setColumnType('short');
      onClose();
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-indigo-200 mb-4">Добавить новую задачу</h2>

          <form onSubmit={handleSubmit}>
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
            </div>

            <div className="mb-4">
              <label htmlFor="columnType" className="block text-sm font-medium text-gray-300 mb-1">
                Колонка
              </label>
              <CustomSelect
                value={columnType}
                onChange={(value) => setColumnType(value as 'short' | 'medium' | 'long' | 'daily')}
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
                  Срок выполнения
                </label>
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
                  placeholderText="Выберите дату и время"
                  required
                  minDate={new Date()}
                  filterTime={(time) => {
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

                    // Check if any task has the same time slot
                    return !allTasks.some(task => {
                      const taskDeadline = new Date(task.deadline);
                      // Compare both date and time (hours/minutes)
                      return taskDeadline.getFullYear() === selectedDateTime.getFullYear() &&
                        taskDeadline.getMonth() === selectedDateTime.getMonth() &&
                        taskDeadline.getDate() === selectedDateTime.getDate() &&
                        taskDeadline.getHours() === selectedDateTime.getHours() &&
                        taskDeadline.getMinutes() === selectedDateTime.getMinutes();
                    });
                  }}
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
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
