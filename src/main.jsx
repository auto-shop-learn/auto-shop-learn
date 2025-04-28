import React from 'react'
import ReactDOM from 'react-dom/client'
// import ReactDOM from 'react-dom';
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import { AppContextProvider } from './AppContext'; // Import your context provider
import 'tailwindcss/tailwind.css';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </Router>
  </React.StrictMode>
)


