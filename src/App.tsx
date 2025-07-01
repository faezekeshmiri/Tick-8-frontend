import React from 'react';
import AppRouter from './routes/AppRouter';
import MainLayout from "./layouts/MainLayout";

const App: React.FC = () => {
  return (
    <MainLayout direction="ltr">
      <AppRouter />
    </MainLayout>
  );
};

export default App;
