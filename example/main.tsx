import App from './App.tsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

console.log('React version: ', React.version)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)