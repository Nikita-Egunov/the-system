import React from 'react';
import MainLayout from '../MainLayout';
import TasksContainer from '../../features/tasks/TasksContainer';

export default function HomePage() {
  return (
    <MainLayout>
      <TasksContainer />
    </MainLayout>
  );
}
