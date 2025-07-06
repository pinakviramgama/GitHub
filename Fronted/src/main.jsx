import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './authContext.jsx';
import './index.css';
import ProjectRoutes from './Routes.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProjectRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
