import React from 'react';
import type { FC } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginView } from './components/LoginView';
import { MainLayout } from './components/MainLayout';
import { LoadingScreen } from './components/LoadingScreen';

const App: FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginView />;
  }
  
  return <MainLayout user={user} />;
};

export default App;
