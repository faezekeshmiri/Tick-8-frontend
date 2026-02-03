// src/routes/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Categories from '../pages/Categories';
import SubCategories from '../pages/SubCategories';
import Profile from '../pages/Profile';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import React from 'react';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/categories/:categoryName/subcategories" element={<SubCategories />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
};

export default AppRouter;
