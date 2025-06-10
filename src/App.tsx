import React from 'react';
import AppRouter from './routes/AppRouter';
import { Link } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <><nav>
      <Link to="/">Home</Link>
    </nav>
    <AppRouter /></>);
};

export default App;
