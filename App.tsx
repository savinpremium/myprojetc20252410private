
import React from 'react';
import type { FC } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginView } from './components/LoginView';
import { MainLayout } from './components/MainLayout';
import { LoadingScreen } from './components/LoadingScreen';
import { ReleaseGuard } from './components/ReleaseGuard';

const App: FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ReleaseGuard>
        {!user ? <LoginView /> : <MainLayout user={user} />}
    </ReleaseGuard>
  );
};

export default App;
