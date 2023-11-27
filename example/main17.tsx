import App from './App.tsx'
import React from 'react'
import ReactDOM from 'react-dom'
import './style.css'

console.log('React version: ', React.version)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')!
)
