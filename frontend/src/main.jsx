import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // Importamos BrowserRouter
import './index.css'
import 'leaflet/dist/leaflet.css';
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { FeedbackProvider } from './context/FeedbackProvider.jsx';
import { installNetworkHelpers } from './utils/network.js';

installNetworkHelpers();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <FeedbackProvider>
              <App />
            </FeedbackProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
