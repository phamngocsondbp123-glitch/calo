import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import { Layout } from './components/Layout';
import { useAuth } from './store/auth';
import { Dashboard } from './pages/Dashboard';
import { Diary } from './pages/Diary';
import { Foods } from './pages/Foods';
import { Weight } from './pages/Weight';
import { Reports } from './pages/Reports';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';

function Guard() {
  const { token, boot } = useAuth();
  useEffect(() => {
    void boot();
  }, [boot]);
  return token ? <Layout /> : <Navigate to="/login" replace />;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Guard />}>
          <Route index element={<Dashboard />} />
          <Route path="diary" element={<Diary />} />
          <Route path="foods" element={<Foods />} />
          <Route path="weight" element={<Weight />} />
          <Route path="reports" element={<Reports />} />
          <Route path="goals" element={<Goals />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
