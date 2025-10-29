"use client";

import React, { useState, useEffect } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskColumnData, DeletedTask, LocalStorageData, TaskProgress } from '@/lib/types';
import TaskColumn from './TaskColumn';
import AddTaskButton from '@/components/ui/AddTaskButton';
import TaskModal from '@/components/ui/TaskModal';
import StatsSection from './StatsSection';
import Link from 'next/link';

const initialTasks: TaskColumnData[] = [
  {
    id: "4",
    title: 'Дэйлики',
    type: 'daily',
    tasks: []
  },
  {
    id: "1",
    title: 'Короткие таски',
    type: 'short',
    tasks: [
      // { id: "1", text: 'Купить продукты: молоко, хлеб, яйца', status: 'idle', deadline: new Date('2026-12-15') },
      // { id: "2", text: 'Позвонить бабушке и спросить о её самочувствии', status: 'idle', deadline: new Date('2026-12-10') }
    ]
  },
  {
    id: "2",
    title: 'Средние таски',
    type: 'medium',
    tasks: [
      // { id: "3", text: 'Подготовить презентацию для встречи с командой', status: 'idle', deadline: new Date('2026-12-20') },
      // { id: "4", text: 'Сделать резервную копию важных файлов на внешний диск', status: 'idle', deadline: new Date('2026-12-18') }
    ]
  },
  {
    id: "3",
    title: 'Длинные таски',
    type: 'long',
    tasks: [
      // { id: "5", text: 'Написать статью для блога о новых технологиях в фронтенде', status: 'idle', deadline: new Date('2026-01-15') },
      // { id: "6", text: 'Изучить новый фреймворк и создать тестовый проект', status: 'idle', deadline: new Date('2026-01-30') }
    ]
  },
];

export default function TasksContainer() {
  const [columns, setColumns] = useState<TaskColumnData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletedTasks, setDeletedTasks] = useState<DeletedTask[]>([]);
  const [tasksProgress, setTasksProgress] = useState<TaskProgress[]>([]);
  const [timeProgress, setTimeProgress] = useState<number>(0);

  // Загрузка данных при монтировании
  useEffect(() => {
    const loadInitialData = () => {
      console.log('🔄 Loading data from localStorage...');
      try {
        const savedData = localStorage.getItem('todoTasks');
        if (savedData) {
          const parsedData: LocalStorageData = JSON.parse(savedData);
          console.log('📥 Loaded data from localStorage:', parsedData);
          return parsedData;
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
      console.log('📥 No saved data, using defaults');
      return null;
    };

    const data = loadInitialData();

    // Используем setTimeout для отложенного обновления состояния
    const timeoutId = setTimeout(() => {
      if (data && data?.columns?.length > 0) {
        console.log('🎯 Setting columns from localStorage');
        setColumns(data.columns);
        setDeletedTasks(data.deletedTasks || []);
        setTasksProgress(data.tasksProgress || []);
      } else {
        console.log('🎯 Setting default columns');
        setColumns(initialTasks);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Отслеживание изменений
  useEffect(() => {
    console.log('📊 COLUMNS UPDATED - total tasks:', columns.reduce((acc, col) => acc + col.tasks.length, 0));
  }, [columns]);

  // Автосохранение
  useEffect(() => {
    if (columns.length === 0) return;

    const saveData = () => {
      console.log('💾 Saving to localStorage');
      const dataToSave: LocalStorageData = { columns, deletedTasks, tasksProgress };
      localStorage.setItem('todoTasks', JSON.stringify(dataToSave));
    };

    const timer = setTimeout(saveData, 500);
    return () => clearTimeout(timer);
  }, [columns, deletedTasks, tasksProgress]);

  // Форматирование времени в ЧЧ:ММ:СС
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Расчет прогресса времени до конца дня и сброс задач в начале нового дня
  useEffect(() => {
    const updateTimeProgress = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const remainingTimeMs = endOfDay.getTime() - now.getTime();
      const totalDayTimeMs = 24 * 60 * 60 * 1000;
      const progress = 100 - (remainingTimeMs / totalDayTimeMs) * 100;
      setTimeProgress(Math.min(100, Math.max(0, progress)));
    };

    // Проверка на начало нового дня
    const checkForNewDay = () => {
      const now = new Date();
      const lastCheckDate = localStorage.getItem('lastCheckDate');

      // Если это первый запуск или день изменился
      if (!lastCheckDate || new Date(lastCheckDate).getDate() !== now.getDate()) {
        // Сбрасываем статус дэйликов и удаляем выполненные задачи
        setColumns(prevColumns =>
          prevColumns.map(column => ({
            ...column,
            tasks: column.type === 'daily'
              ? column.tasks.map(task => ({ ...task, status: 'idle' }))
              : column.tasks.filter(task => task.status !== 'done')
          }))
        );

        // Сохраняем текущую дату для следующей проверки
        localStorage.setItem('lastCheckDate', now.toISOString());
      }
    };

    updateTimeProgress();
    checkForNewDay();

    const intervalId = setInterval(updateTimeProgress, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Получение оставшегося времени до конца дня
  const getRemainingTime = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const remainingTimeMs = endOfDay.getTime() - now.getTime();
    return formatTime(remainingTimeMs);
  };

  // Добавление задачи
  const handleAddNewTask = (taskText: string, columnType: 'short' | 'medium' | 'long' | 'daily', deadline: Date) => {
    console.log('➕ Adding new task:', { taskText, columnType, deadline });

    const newTask: Task = {
      id: uuidv4(),
      text: taskText,
      status: 'idle',
      deadline: deadline
    };

    setColumns(prevColumns =>
      prevColumns.map(column =>
        column.type === columnType
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )
    );
    const oldTasksProgress = JSON.parse(localStorage.getItem('tasksProgress') || '[]') as TaskProgress[] | [];

    if (columnType === 'daily') {
      localStorage.setItem('tasksProgress', JSON.stringify([
        ...oldTasksProgress, {
          id: newTask.id,
          progress: 0
        }
      ]))

      const dayStart = new Date();

      // Устанавливаем начало дня (00:00:00.000)
      dayStart.setUTCHours(0, 0, 0, 0);

      localStorage.setItem(`taskCreatedAt_${newTask.id}`, dayStart.toISOString())
    } else {
      localStorage.setItem('tasksProgress', JSON.stringify([
        ...oldTasksProgress, {
          id: newTask.id,
          progress: 0
        }
      ]))

      localStorage.setItem(`taskCreatedAt_${newTask.id}`, new Date().toISOString())
    }
  };

  // Удаление задачи
  const handleDeleteTask = (taskId: string, columnId: string) => {
    console.log('🗑️ Deleting task:', { taskId, columnId });

    setColumns(prevColumns =>
      prevColumns.map(column => {
        if (column.id === columnId) {
          const deletedTask = column.tasks.find(task => task.id === taskId);
          if (deletedTask) {
            // Добавляем в архив удаленных
            const newDeletedTask: DeletedTask = {
              id: deletedTask.id,
              text: deletedTask.text,
              columnType: column.type,
              deletedAt: new Date().toISOString(),
              deadline: deletedTask.deadline || new Date()
            };
            setDeletedTasks(prev => [...prev, newDeletedTask]);
          }

          return {
            ...column,
            tasks: column.tasks.filter(task => task.id !== taskId)
          };
        }
        return column;
      })
    );
  };

  // Изменение статуса задачи
  const handleTaskStateChange = (taskId: string, newStatus: Task['status'], columnId: string) => {
    console.log('🔄 Changing task state:', { taskId, newStatus, columnId });

    setColumns(prevColumns =>
      prevColumns.map(column => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: column.tasks.map(task =>
              task.id === taskId ? { ...task, status: newStatus } : task
            )
          };
        }
        return column;
      })
    );
  };

  // Перемещение задачи между колонками
  const handleMoveTask = (taskId: string, fromColumnId: string, toColumnId: string) => {
    console.log('🚚 Moving task:', { taskId, fromColumnId, toColumnId });

    setColumns(prevColumns => {
      let movedTask: Task | null = null;

      // Удаляем задачу из исходной колонки
      const columnsWithTaskRemoved = prevColumns.map(column => {
        if (column.id === fromColumnId) {
          const taskToMove = column.tasks.find(task => task.id === taskId);
          if (taskToMove) {
            movedTask = { ...taskToMove };
          }
          return {
            ...column,
            tasks: column.tasks.filter(task => task.id !== taskId)
          };
        }
        return column;
      });

      // Добавляем задачу в целевую колонку
      if (movedTask) {
        return columnsWithTaskRemoved.map(column =>
          column.id === toColumnId
            ? { ...column, tasks: [...column.tasks, movedTask!] }
            : column
        );
      }

      return columnsWithTaskRemoved;
    });
  };

  // Восстановление удаленной задачи
  const handleRestoreTask = (deletedTaskId: string) => {
    console.log('♻️ Restoring task:', deletedTaskId);

    setDeletedTasks(prevDeleted => {
      const taskToRestore = prevDeleted.find(task => task.id === deletedTaskId);
      if (!taskToRestore) return prevDeleted;

      // Добавляем задачу обратно в соответствующую колонку
      setColumns(prevColumns =>
        prevColumns.map(column =>
          column.type === taskToRestore.columnType
            ? {
              ...column, tasks: [...column.tasks, {
                id: taskToRestore.id,
                text: taskToRestore.text,
                status: 'idle',
                deadline: taskToRestore.deadline
              }]
            }
            : column
        )
      );

      // Удаляем из архива
      return prevDeleted.filter(task => task.id !== deletedTaskId);
    });
  };

  // Очистка архива удаленных задач
  const handleClearDeletedTasks = () => {
    console.log('🧹 Clearing deleted tasks');
    setDeletedTasks([]);
  };

  // Сброс к начальным данным
  const handleResetToDefault = () => {
    console.log('🔄 Resetting to default tasks');
    setColumns(initialTasks);
    setDeletedTasks([]);
  };

  // Получение статистики задач
  const getTasksStats = () => {
    const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);
    const completedTasks = columns.reduce((acc, col) =>
      acc + col.tasks.filter(task => task.status === 'done').length, 0
    );
    return { totalTasks, completedTasks };
  };

  // Получение статистики только для коротких задач
  const getShortTasksStats = () => {
    const shortColumn = columns.find(col => col.type === 'short');
    const totalShortTasks = shortColumn ? shortColumn.tasks.length : 0;
    const completedShortTasks = shortColumn
      ? shortColumn.tasks.filter(task => task.status === 'done').length
      : 0;
    return { totalShortTasks, completedShortTasks };
  };

  // Получение статистики по просроченным задачам
  const getOverdueTasksStats = () => {
    const now = new Date();
    const allTasks = columns.flatMap(col => col.tasks);
    const totalTasks = allTasks.length;
    const overdueTasks = allTasks.filter(task =>
      task.deadline && new Date(task.deadline) < now && task.status !== 'done'
    ).length;
    return { totalTasks, overdueTasks };
  };

  const handleAddTask = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  function getDayProgress() {
    if (timeProgress < 50) {
      return 'bg-red-500';
    } else if (timeProgress < 80) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  }
  function getDayTimerProgress() {
    if (timeProgress < 50) {
      return 'text-red-500';
    } else if (timeProgress < 80) {
      return 'text-yellow-500';
    } else {
      return 'text-green-500';
    }
  }

  return (
    <div className="relative">
      <section className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700">
        <div className='flex justify-between items-center mb-6'>
          <h2 className="text-2xl font-semibold text-indigo-200 pb-2 border-b border-gray-700">Мои задачи</h2>
          <Link href={'/settings'} className='flex flex-col justify-between h-3.5'>
            <span className='border-b border-gray-300 w-4.5'></span>
            <span className='border-b border-gray-300 w-4.5'></span>
            <span className='border-t border-gray-300 w-4.5'></span>
          </Link>
        </div>

        {/* Секция со статистикой */}
        <StatsSection
          totalTasks={getTasksStats().totalTasks}
          completedTasks={getTasksStats().completedTasks}
          totalShortTasks={getShortTasksStats().totalShortTasks}
          completedShortTasks={getShortTasksStats().completedShortTasks}
          totalOverdueTasks={getOverdueTasksStats().totalTasks}
          overdueTasks={getOverdueTasksStats().overdueTasks}
          className="mb-6"
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <TaskColumn
              key={column.id}
              title={column.title}
              tasks={column.tasks}
              columnType={column.type}
              setColumns={setColumns}
              handleTaskStateChange={handleTaskStateChange}
              id={column.id}
            />
          )
          )}
        </div>
      </section>

      <AddTaskButton onClick={handleAddTask} />

      {/* Кнопка для добавления базовых тасков, видна только в режиме разработки */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            console.log('🎯 Adding basic tasks');
            const basicTasks = [
              { id: uuidv4(), text: 'Базовая задача 1', status: 'idle', deadline: new Date('2026-01-01') },
              { id: uuidv4(), text: 'Базовая задача 2', status: 'idle', deadline: new Date('2026-01-01') },
              { id: uuidv4(), text: 'Базовая задача 3', status: 'idle', deadline: new Date('2026-01-01') },
            ] as Task[];

            setColumns(prevColumns =>
              prevColumns.map(column =>
                column.type === 'short'
                  ? { ...column, tasks: [...column.tasks, ...basicTasks] }
                  : column
              )
            );
          }}
          className="fixed bottom-6 left-6 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Добавить базовые задачи
        </button>
      )}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddNewTask}
      />
    </div>
  );
}
