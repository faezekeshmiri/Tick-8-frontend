import './App.css';
import React, { JSX } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';


function App(): JSX.Element {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> |{' '}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
