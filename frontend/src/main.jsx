import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './styles.css'
import api from './services/api'

// Wake up the backend on app load (Render free tier sleeps after 15 min)
api.get('/health').catch(() => {})

// Reset body
document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.style.background = '#09090b'
document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
