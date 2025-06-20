import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug: Check if environment variables are loaded
console.log('🔍 Environment check in main.tsx:');
console.log('VITE_HACKATHON_MODE:', import.meta.env.VITE_HACKATHON_MODE);
console.log('VITE_LAMBDA_BASE_URL:', import.meta.env.VITE_LAMBDA_BASE_URL);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
