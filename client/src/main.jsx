import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// --- PASTIKAN 2 BARIS INI ADA ---
import 'bootstrap/dist/css/bootstrap.min.css' // Import CSS Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // JS (Fitur Dropdown/Modal/Toggle)
import 'bootstrap-icons/font/bootstrap-icons.css'   // 3. Icon Bootstrap (BARU)
import './assets/css/style.css'                     // 4. Custom CSS Anda (Pastikan file ini ada!)
import './index.css' // File kosong tadi (biarkan saja di-import)
// --------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)