import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppNavbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoadsListPage } from './pages/LoadsListPage';
import { LoadDetailPage } from './pages/LoadDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrdersListPage } from './pages/OrdersListPage';
import { OrderPage } from './pages/OrderPage';

const MainLayout = () => (
  <>
    <AppNavbar />
    <main>
      <Outlet />
    </main>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<MainLayout />}>
          <Route path="/loads" element={<LoadsListPage />} />
          <Route path="/loads/:id" element={<LoadDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/load_sessions" element={<OrdersListPage />} />
          <Route path="/load_sessions/:id" element={<OrderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
