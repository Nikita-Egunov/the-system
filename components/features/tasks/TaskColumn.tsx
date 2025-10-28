"use client";

import TaskItem from '@/components/ui/TaskItem';
import ProgressBar from '../../ui/ProgressBar';
import { Task, TaskColumnData } from '@/lib/types';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  setColumns: (columns: TaskColumnData[]) => void;
  handleTaskStateChange: (taskId: string, newStatus: "idle" | "in_progress" | "done", columnId: string) => void
  columnType: 'short' | 'medium' | 'long' | 'daily';
  id: string;
}

export default function TaskColumn({ title, tasks, handleTaskStateChange, id }: TaskColumnProps) {
  // Рассчитываем прогресс выполнения задач
  const completedTasksLength = tasks.filter((task) => task.status === 'done').length;

  const handleTaskStateChangeLocal = (taskId: string, newStatus: "idle" | "in_progress" | "done") => {
    handleTaskStateChange(taskId, newStatus, id)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-indigo-300 border-b border-gray-600 pb-1 mb-2">{title}</h3>
      </div>

      {/* Прогресс бар */}
      <ProgressBar
        completed={completedTasksLength}
        total={tasks.length}
        className="mb-4"
      />

      <ul className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            id={task.id}
            text={task.text}
            setStatus={handleTaskStateChangeLocal}
            status={task.status}
            deadline={task.deadline}
          />
        ))}
      </ul>
    </div>
  );
}
