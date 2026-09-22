import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import AnalyticsTracker from './components/AnalyticsTracker'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AnalyticsTracker />
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
