import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppNavbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoadsListPage } from './pages/LoadsListPage';
import { LoadDetailPage } from './pages/LoadDetailPage';

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
    <BrowserRouter basename="/LoadSystem-frontend/">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<MainLayout />}>
          <Route path="/loads" element={<LoadsListPage />} />
          <Route path="/loads/:id" element={<LoadDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
