import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/userSlice';
import { getLoadsList } from '../store/slices/loadsSlice';
import { setSearchTerm } from '../store/slices/filterSlice';
import type { RootState, AppDispatch } from '../store';

export const AppNavbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(setSearchTerm(''));
    dispatch(getLoadsList({ search: '' }));
    navigate('/loads');
  };

  return (
    <Navbar 
      fixed="top" 
      className="shadow-sm custom-navbar"
      style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #e3e1d8' }}
    >
      <Container fluid className="px-4">
        <Navbar.Brand 
          className="custom-brand" 
          as={Link} 
          to="/"
          style={{ 
            color: '#000000', 
            backgroundColor: '#fdc300', 
            padding: '10px 14px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: '300'
          }}
        >
          Система расчета нагрузок
        </Navbar.Brand>
        <Nav className="ms-auto align-items-center gap-3">
          <Nav.Link 
            className="fs-5" 
            as={Link} 
            to="/loads"
            style={{ color: '#000000' }}
          >
            Нагрузки
          </Nav.Link>
          {isAuthenticated && (
            <>
              <Nav.Link 
                className="fs-5" 
                as={Link} 
                to="/load_sessions"
                style={{ color: '#000000' }}
              >
                Заявки
              </Nav.Link>
              <Nav.Link 
                className="fs-5" 
                as={Link} 
                to="/profile"
                style={{ color: '#000000' }}
              >
                {user?.full_name || user?.username || 'Профиль'}
              </Nav.Link>
              <Button
                variant="outline-warning"
                onClick={handleLogout}
                style={{ borderColor: '#fdc300', color: '#000' }}
              >
                Выйти
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/login">
              <Button
                variant="warning"
                style={{ backgroundColor: '#fdc300', borderColor: '#fdc300', color: '#000' }}
              >
                Войти
              </Button>
            </Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

