import { AppNavbar } from '../components/Navbar';
import './styles/HomePage.css';

export const HomePage = () => {
  return (
    <div className="homepage-wrapper">
      <AppNavbar />

      <div className="home-page-container">
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
        </div>
      </div>
    </div>
  );
};

