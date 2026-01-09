import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// --- 1. NEW IMPORTS (Required for Login & Routing) ---
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/authContext'

// --- 2. YOUR EXISTING IMPORTS (Keep these!) ---
import 'bootstrap/dist/css/bootstrap.min.css' 
import 'bootstrap/dist/js/bootstrap.bundle.min.js' 
import 'bootstrap-icons/font/bootstrap-icons.css' 
import './assets/css/style.css' 
import './index.css' 
// --------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrapper 1: BrowserRouter enables navigation (useNavigate) */}
    <BrowserRouter>
      {/* Wrapper 2: AuthProvider provides the 'user' and 'login' functions */}
      {/* This fixes the "Cannot destructure property user... undefined" error */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)