import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { registerSW } from 'virtual:pwa-register'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.tsx'

// Очищаем данные авторизации при загрузке приложения
// Это обеспечивает разлогин при перезагрузке страницы
localStorage.removeItem('authToken');
localStorage.removeItem('userInfo');

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>,
)

if ('serviceWorker' in navigator) {
  registerSW()
}
