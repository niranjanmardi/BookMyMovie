import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker } from './serviceWorkerRegistration'

// ==============================================================================
// Experiment 2: Register PWA Service Worker (Requirement d)
// Enables offline caching and app shell installation
// ==============================================================================
registerServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

