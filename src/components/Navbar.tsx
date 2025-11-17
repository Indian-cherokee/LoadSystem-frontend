import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const AppNavbar = () => {
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
        <Nav className="ms-auto">
          <Nav.Link 
            className="fs-5" 
            as={Link} 
            to="/loads"
            style={{ color: '#000000' }}
          >
            Нагрузки
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

