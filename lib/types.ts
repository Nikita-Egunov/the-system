export interface Task {
  id: string;
  text: string;
  status: 'idle' | 'in_progress' | 'done';
  deadline: Date;
  type?: 'short' | 'medium' | 'long' | 'daily';
}

export interface DeletedTask {
  id: string;
  text: string;
  columnType: 'short' | 'medium' | 'long' | 'daily';
  deletedAt: string;
  deadline: Date;
}

export interface TaskProgress {
  id: string;
  progress: number;
}

export interface TaskColumnData {
  id: string;
  title: string;
  type: 'short' | 'medium' | 'long' | 'daily';
  tasks: Task[];
}

export interface LocalStorageData {
  columns: TaskColumnData[];
  deletedTasks: DeletedTask[];
  tasksProgress: TaskProgress[];
}