import { useState, useEffect } from 'react';
import { AppNavbar } from '../components/Navbar';
import { getBackendIP, setBackendIP, isBackendIPConfigured } from '../utils/backendConfig';
import './styles/HomePage.css';

export const HomePage = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Проверяем, запущено ли приложение в Tauri
    const tauriCheck = typeof window !== 'undefined' && !!(window as any).__TAURI__;
    setIsTauri(tauriCheck);
    
    // Загружаем сохраненный IP адрес
    if (tauriCheck) {
      const savedIP = getBackendIP();
      setIpAddress(savedIP);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      setBackendIP(ipAddress);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении IP адреса');
    }
  };

  return (
    <div className="homepage-wrapper">
      <AppNavbar />

      <div className="home-page-container">
        <video
          className="background-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="home-page-content">
          <h1>Добро пожаловать в систему расчета нагрузок!</h1>
          <p className="lead fs-4">
            Этот сервис предназначен для расчета нагрузок на строительные
            конструкции. Вы можете просмотреть доступные нагрузки, выбрать
            необходимые и сформировать расчетную сессию.
          </p>
          <p className="fs-5 mt-4">
            Система позволяет работать с различными типами нагрузок:
            постоянными, временными, особыми. Для каждой нагрузки указаны
            нормативные значения и коэффициенты надежности.
          </p>

          {isTauri && (
            <div className="backend-config-section">
              <h3 className="backend-config-title">Настройка подключения к серверу</h3>
              <form onSubmit={handleSubmit} className="backend-config-form">
                <div className="form-group">
                  <label htmlFor="backend-ip" className="form-label">
                    IP адрес сервера:
                  </label>
                  <input
                    type="text"
                    id="backend-ip"
                    className="form-control"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="http://192.168.0.123:8080"
                    required
                  />
                  <small className="form-text">
                    Введите полный адрес сервера в формате: http://IP:PORT
                  </small>
                </div>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success" role="alert">
                    IP адрес успешно сохранен!
                  </div>
                )}
                <button type="submit" className="btn btn-primary">
                  Сохранить
                </button>
                {isBackendIPConfigured() && (
                  <p className="current-ip-info">
                    Текущий IP: <strong>{getBackendIP()}</strong>
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

