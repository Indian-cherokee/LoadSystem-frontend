import { useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Spinner,
  Form,
  Badge,
  Image,
  Button,
} from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LoadCard } from '../components/LoadCard';
import type { RootState, AppDispatch } from '../store';
import {
  setSearchTerm,
  selectSearchTerm,
} from '../store/slices/filterSlice';
import { getLoadsList } from '../store/slices/loadsSlice';
import { fetchCartBadge } from '../store/slices/loadSessionSlice';
import { CustomBreadcrumbs } from '../components/Breadcrumbs';
import './styles/LoadsListPage.css';

export const LoadsListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const searchTerm = useSelector(selectSearchTerm);
  const { loads, loading } = useSelector((state: RootState) => state.loads);
  const { session_id, count } = useSelector((state: RootState) => state.loadSession);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(getLoadsList({ search: searchTerm }));
    if (isAuthenticated) {
      dispatch(fetchCartBadge());
    }
  }, [dispatch, isAuthenticated]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(getLoadsList({ search: searchTerm }));
  };

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Всегда обновляем данные корзины при клике
    if (isAuthenticated) {
      const result = await dispatch(fetchCartBadge());
      if (fetchCartBadge.fulfilled.match(result)) {
        const { load_session_id, loads_count } = result.payload;
        // Переход только если корзина не пустая (id не null, не -1, и количество > 0)
        if (load_session_id && load_session_id !== -1 && loads_count > 0) {
          navigate(`/orders/${load_session_id}`);
        }
      }
    } else {
      // Если не авторизован, используем текущие значения из state
      if (session_id && session_id !== -1 && count > 0) {
        navigate(`/orders/${session_id}`);
      }
    }
    // Если корзина пустая, ничего не делаем
  };

  const isCartActive = count > 0 && session_id !== null && session_id !== -1;

  const breadcrumbs = [{ label: 'Нагрузки', active: true }];

  return (
    <Container fluid className="pt-5 mt-4">
      <CustomBreadcrumbs crumbs={breadcrumbs} />

      <Form onSubmit={handleSearchSubmit}>
        <Row className="justify-content-center mb-2">
          <Col xs={12} md={10} lg={8}>
            <div className="search-and-cart-wrapper">
              <Form.Control
                type="search"
                placeholder="Введите название нагрузки для поиска..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                className="me-2"
              />
              <Button
                type="submit"
                className="all-btn"
                variant="primary"
              >
                Найти
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {/* Корзина в левом нижнем углу */}
      <div className="cart-fixed">
        <div
          onClick={handleCartClick}
          title={isCartActive ? "Перейти к заявке" : "Корзина"}
          style={{ cursor: isCartActive ? 'pointer' : 'default', display: 'inline-block' }}
        >
          <Image
            src="/mock_images/cart.png"
            alt="Корзина"
            width={32}
            style={{ opacity: isCartActive ? 1 : 0.7 }}
          />
        </div>
        {isCartActive && (
          <Badge pill className="cart-indicator">
            {count}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner 
            animation="border" 
            style={{ 
              color: '#fdc300',
              borderColor: '#fdc300'
            }} 
          />
        </div>
      ) : (
        <Row className="justify-content-center loads-cards-row mt-5">
          <Col xs={12} lg={10}>
            {loads.length === 0 ? (
              <div className="text-center mt-5">
                <h3>Нагрузки не найдены</h3>
                <p className="text-muted">
                  Попробуйте изменить параметры фильтрации
                </p>
              </div>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {loads.map((load) => (
                  <Col key={load.id}>
                    <LoadCard load={load} />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

